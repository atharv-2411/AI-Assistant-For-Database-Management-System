
import type { TableNode } from "@/types/renderer";
import { type Edge } from "@xyflow/react";
import { cleanSQL } from "./utils";

interface SchemaField {
  title: string;
  type: string;
  is_pk: boolean;
  is_null: boolean;
  is_unique: boolean;
}

interface ReactFlowData {
  nodes: TableNode[];
  edges: Edge[];
}

interface ForeignKey {
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
}

// SQL to React Flow Parser Class
class SQLToReactFlowParser {
  private nodes: TableNode[];
  private edges: Edge[];

  constructor() {
    this.nodes = [];
    this.edges = [];
  }

  public parse(sqlString: string): ReactFlowData {
    // Reset state for new parsing
    this.nodes = [];
    this.edges = [];

    const cleanedSQL = cleanSQL(sqlString);
    
    // Split into separate CREATE TABLE statements
    const tableStatements = cleanedSQL.split(/CREATE TABLE/i).filter(s => s.trim());
    
    // Process each CREATE TABLE statement
    tableStatements.forEach(statement => {
      this.parseCreateTable(statement);
    });

    return {
      nodes: this.nodes,
      edges: this.edges
    };
  }

  private splitColumnDefinitions(columnSection: string): string[] {
    const results: string[] = [];
    let current = '';
    let parenCount = 0;
    let inQuotes = false;
    
    for (let i = 0; i < columnSection.length; i++) {
      const char = columnSection[i];
      
      if (char === '(' && !inQuotes) {
        parenCount++;
      } else if (char === ')' && !inQuotes) {
        parenCount--;
      } else if (char === '`') {
        inQuotes = !inQuotes;
      }
      
      if (char === ',' && parenCount === 0 && !inQuotes) {
        results.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      results.push(current.trim());
    }
    
    return results;
  }

  private parseCreateTable(statement: string): void {
    // Extract table name
    const tableNameMatch = statement.match(/`?(\w+)`?\s*\(/i);
    if (!tableNameMatch) return;
    
    const tableName = tableNameMatch[1].toLowerCase();
    
    // Extract column definitions
    const columnSection = statement.substring(statement.indexOf('(') + 1, statement.lastIndexOf(')'));
    const columnDefinitions = this.splitColumnDefinitions(columnSection);
    
    const schema: SchemaField[] = [];
    const foreignKeys: ForeignKey[] = [];

    // First pass: identify separate PRIMARY KEY constraint if it exists
    const pkConstraint = columnDefinitions.find(def => 
      def.toLowerCase().startsWith('primary key') ||
      def.toLowerCase().startsWith('constraint') && def.toLowerCase().includes('primary key')
    );
    
    let separatePkColumns: string[] = [];
    if (pkConstraint) {
      const pkMatch = pkConstraint.match(/PRIMARY KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        separatePkColumns = pkMatch[1].split(',').map(col => 
          col.trim().replace(/`/g, '').toLowerCase()
        );
      }
    }

    columnDefinitions.forEach(colDef => {
      // Skip if it's a constraint definition
      if (colDef.toLowerCase().startsWith('constraint') ||
          colDef.toLowerCase().startsWith('primary key') ||
          colDef.toLowerCase().startsWith('foreign key')) {
        // Extract foreign key information
        const fkMatch = colDef.match(/FOREIGN KEY\s*\(`?(\w+)`?\)\s*REFERENCES\s*`?(\w+)`?\s*\(`?(\w+)`?\)/i);
        if (fkMatch) {
          foreignKeys.push({
            sourceColumn: fkMatch[1],
            targetTable: fkMatch[2].toLowerCase(),
            targetColumn: fkMatch[3]
          });
        }
        return;
      }

      // Parse column definition
      const parts = colDef.split(/\s+/);
      if (parts.length < 2) return;

      const columnName = parts[0].replace(/`/g, '');
      
      // Handle data type with potential parameters
      let dataType = parts[1];
      if (dataType.includes('(')) {
        dataType = dataType.split('(')[0];
      }
      dataType = dataType.toLowerCase();
      
      // Check if this column is a primary key (either inline or in separate constraint)
      const isPK = colDef.toLowerCase().includes('primary key') || 
                  separatePkColumns.includes(columnName.toLowerCase());
      
      // If it's a primary key, it's automatically NOT NULL and UNIQUE
      const isNull = isPK ? false : !colDef.toLowerCase().includes('not null');
      const isUnique = isPK ? true : colDef.toLowerCase().includes('unique');

      schema.push({
        title: columnName,
        type: dataType,
        is_pk: isPK,
        is_null: isNull,
        is_unique: isUnique
      });
    });

    // Create node
    const node: TableNode = {
      id: tableName,
      position: { x: 0, y: 0},
      type: 'databaseSchema',
      data: {
        label: tableName.charAt(0).toUpperCase() + tableName.slice(1),
        schema: schema
      }
    };

    this.nodes.push(node);

    // Store foreign key information for edge generation
    if (foreignKeys.length > 0) {
      foreignKeys.forEach(fk => {
        const edge: Edge = {
          id: `${tableName}-${fk.targetTable}`,
          target: tableName,
          source: fk.targetTable,
          sourceHandle: fk.targetColumn,
          targetHandle: fk.sourceColumn,
          animated: true,
        };
        this.edges.push(edge);
      });
    }
  }
}

export default SQLToReactFlowParser;