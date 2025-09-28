import React from 'react'

type Props = {
  tableName: string;
  tableData: object[],
}

export default function MockDataTable({
  tableName,
  tableData,
}: Props) {
  if (!tableData || tableData.length === 0) {
    return (
      <div className="text-gray-400 text-sm p-4">
        No data available for {tableName}
      </div>
    );
  }

  const headers = Object.keys(tableData[0]);
  
  return (
    <table>
      <thead>
        <tr>
          {headers.map((h, index) => (
            <th key={`header-${index}`} className="text-left p-2 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.map((row: object, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {Object.values(row).map((data, cellIndex) => {
              let displayValue = data;
              
              if (data instanceof Date) {
                displayValue = data.toISOString().split('T')[0]; // Format as YYYY-MM-DD
              } else if (data === null || data === undefined) {
                displayValue = 'NULL';
              }
              
              return (
                <td key={`cell-${rowIndex}-${cellIndex}`} className="text-xs p-2">
                  {displayValue as React.ReactNode}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}