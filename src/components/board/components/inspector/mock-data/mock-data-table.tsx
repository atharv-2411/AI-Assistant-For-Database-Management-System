import React from 'react'

type Props = {
  tableName: string;
  tableData: object[],
}

export default function MockDataTable({
  tableName,
  tableData,
}: Props) {
  const headers = Object.keys(tableData[0]);
  
  return (
    <table>
      <thead>
        { headers.map(h => <td>{ h } </td>)}
      </thead>
      <tbody>
        {
          tableData.map((row: object) => {
            return <tr>
              {
                Object.values(row).map(data => {
                  if ( data instanceof Date ) {
                    data = data.toString();
                  }
                  
                  return <td className='text-xs'>{ data as React.ReactNode }</td>
                })
              }
            </tr>
          })
        }
      </tbody>
    </table>
  )
}