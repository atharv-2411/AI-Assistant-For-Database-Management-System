import React from 'react'
import MockDataTable from './mock-data-table'

type Props = {
  data: {
    [_:string]: object[],
  }
}

export default function MockDataResult({
  data
}: Props) {
  return (
    <div className='custom-table flex flex-col h-[80vh] overflow-auto'>
      {
        Object.keys(data).map(k => {
          return <>
            <span className='capitalize text-lg mt-4 font-bold text-gray-200'>{ k.split("_").join(" ") }</span>
            <span className='text-xs text-gray-400 mb-2'>Generated mock data for the schema {k}</span>
            <MockDataTable 
              tableName={k}
              tableData={data[k] as object[]}
            />
          </>
        })
      }
    </div>
  )
}