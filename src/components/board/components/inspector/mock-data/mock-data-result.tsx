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
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-[80vh] text-gray-400">
        No mock data generated yet
      </div>
    );
  }

  return (
    <div className='custom-table flex flex-col h-[80vh] overflow-auto'>
      {Object.keys(data).map((k, index) => (
        <div key={`table-section-${index}`} className="mb-6">
          <h3 className='capitalize text-lg mt-4 font-bold text-gray-200'>
            {k.split("_").join(" ")}
          </h3>
          <p className='text-xs text-gray-400 mb-2'>
            Generated mock data for the schema {k}
          </p>
          <MockDataTable 
            tableName={k}
            tableData={data[k] as object[]}
          />
        </div>
      ))}
    </div>
  )
}