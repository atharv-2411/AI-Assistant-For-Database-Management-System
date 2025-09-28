/*
  SSCSV- Saphal-Sugam optimized Comma Separated Values

  When generating mock data with AI, we encountered a optimization problem where, because the AI wrote the
  data in JSON format, there was a lot of redudant key writing; thus, the prompt was slow in response.

  SSCSV is our optimized data transfer format for delivering Mock Data.

  --- FORMAT ---
  
  --<TABLE_NAME>
  <HEADERS SEPARATED BY COMMAS>
  <ROW VALUES SEPARATED BY COMMAS>
  <ROW VALUES SEPARATED BY COMMAS>
  ....

*/

interface ParserOptions {
  dateFormat: RegExp;
  numberFormat: RegExp;
  strictMode?: boolean;
}

type ParsedValue = string | number | boolean | Date | null;

interface ParsedRow {
  [key: string]: ParsedValue;
}

interface TableData {
  tableName: string;
  rows: ParsedRow[];
}

interface ParseResult {
  data: {
    [tableName: string]: ParsedRow[];
  };
  errors: ParseError[];
  success: boolean;
}

interface ParseError {
  type: 'VALUE_PARSE_ERROR' | 'ROW_PARSE_ERROR' | 'TABLE_PARSE_ERROR' | 'PARSE_ERROR';
  header?: string;
  value?: string;
  row?: number;
  error: string;
}

export default class SSCSVParser {
  private options: ParserOptions;
  private errors: ParseError[];

  constructor(options: Partial<ParserOptions> = {}) {
    this.options = {
      dateFormat: /^\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2})?$/,
      numberFormat: /^-?\d*\.?\d+$/,
      strictMode: false,
      ...options
    };
    
    this.errors = [];
  }

  private parseValue(value: string, header: string): ParsedValue {
    try {
      // Remove leading/trailing whitespace
      value = value.trim();
      
      // Check for empty values
      if (value === '') return null;
      
      // Handle quoted strings
      if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1).replace(/""/g, '"');
      }
      
      // Check for boolean values
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
      
      // Check for numeric values
      if (this.options.numberFormat.test(value)) {
        return Number(value);
      }
      
      // Check for dates (including timestamps)
      if (this.options.dateFormat.test(value)) {
        const date = new Date(value);
        return isNaN(date.getTime()) ? value : date;
      }
      
      return value;
    } catch (error) {
      const parseError: ParseError = {
        type: 'VALUE_PARSE_ERROR',
        header,
        value,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      this.errors.push(parseError);
      return value;
    }
  }

  private splitCSVLine(line: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          currentValue += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    values.push(currentValue);
    return values;
  }

  private parseTable(table: string): TableData {
    try {
      const lines = table.trim().split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('Table must have at least headers row');
      }
      
      const tableName = lines[0].trim();
      const headers = this.splitCSVLine(lines[1]).map(header => header.trim());
      
      const rows = lines.slice(2).map((row, rowIndex) => {
        try {
          const values = this.splitCSVLine(row);
          
          if (values.length !== headers.length) {
            throw new Error(`Column count mismatch at row ${rowIndex + 1}`);
          }
          
          return headers.reduce<ParsedRow>((obj, header, index) => {
            obj[header] = this.parseValue(values[index], header);
            return obj;
          }, {});
        } catch (error) {
          const rowError: ParseError = {
            type: 'ROW_PARSE_ERROR',
            row: rowIndex + 1,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
          this.errors.push(rowError);
          return null;
        }
      }).filter((row): row is ParsedRow => row !== null);
      
      return { tableName, rows };
    } catch (error) {
      const tableError: ParseError = {
        type: 'TABLE_PARSE_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      this.errors.push(tableError);
      return { tableName: table.split('\n')[0].trim(), rows: [] };
    }
  }

  public parse(data: string): ParseResult {
    this.errors = [];
    const result: { [tableName: string]: ParsedRow[] } = {};
    
    try {
      const cleanedData = data.replace(/`/g, '').split('--').slice(1);
      
      for (const table of cleanedData) {
        const { tableName, rows } = this.parseTable(table);
        result[tableName] = rows;
      }
      
      return {
        data: result,
        errors: this.errors,
        success: this.errors.length === 0
      };
    } catch (error) {
      const parseError: ParseError = {
        type: 'PARSE_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      this.errors.push(parseError);
      
      return {
        data: {},
        errors: this.errors,
        success: false
      };
    }
  }

  public getErrors(): ParseError[] {
    return this.errors;
  }

  public hasErrors(): boolean {
    return this.errors.length > 0;
  }
}