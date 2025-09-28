export class SQLSerializer {
  constructor() {}

  private serializeDatabaseObjectToSchema(tableName: string, data: object[]) {
    const columnNames = Object.keys(data[0]);

    let command = `INSERT INTO ${tableName} (${columnNames.join(", ")})\n`;

    data.forEach((row, index) => {
      command += "\t";
      command += `(${Object.values(row).reduce((acc, value) => {
        let serializedValue: string = value;

        if ( typeof value === "string" ) {
          serializedValue = `'${value}'`
        }
        
        if ( value instanceof Date ) {
          serializedValue = `'${value.toISOString()}'`;
        }
        
        if ( !value ) {
          serializedValue = "NULL";
        }

        return `${acc},${serializedValue}`;
      })})`;
      if ( index < data.length - 1)
        command += ",\n";
      else
        command += ";";
    });
    
    return command;
  }

  serialize(data: any) {
    let finalSchema = "";

    if(!data) return;
    
    Object.keys(data).forEach(key => {
      finalSchema += this.serializeDatabaseObjectToSchema(key, data[key]);
      finalSchema += "\n\n";
    });

    return finalSchema;
  }
}