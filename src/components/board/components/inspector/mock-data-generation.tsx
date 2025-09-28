import { generateMockDataFromSchema } from '@/actions/mock-data-generator';
import useInspectorStore, { type MockDataOutputConfig } from '@/stores/inspector';
import React, { FormEvent, useState } from 'react'

import SSCSVParser from '@/lib/sscsv-parser';
import MockDataResult from './mock-data/mock-data-result';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderCircle } from 'lucide-react';

import MonacoEditor from "@monaco-editor/react";
import { SQLSerializer } from '@/lib/sql-serializer';

export default function MockDataGenerationSection() {
  const [loading, setLoading] = useState(false);
  const { 
    mainSchemaText, 
    mockData, 
    setMockData, 
    mockDataOutput, 
    setMockDataOutput, 
    numOfRows, 
    setNumOfRows 
  } = useInspectorStore();
  
  const handleNumOfRowsSelect = (val: string) => setNumOfRows(parseInt(val));
  const handleMockDataOutputOptionSelect = (val: MockDataOutputConfig) => setMockDataOutput(val);
  
  async function getMockData(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!numOfRows) return;
    
    setLoading(true);
    try {
      const response = await generateMockDataFromSchema(mainSchemaText, numOfRows);
      const parser = new SSCSVParser();
      const parsedData = parser.parse(response);
      setMockData(parsedData.data);
    } catch (error) {
      console.error('Error generating mock data:', error);
      alert('Failed to generate mock data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const serializer = new SQLSerializer();
  
  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-[80vh] gap-1 py-10'>
        <LoaderCircle size={28} className='text-emerald-500 animate-spin'/>
        <span className='font-bold text-white/20 font-sans'>AI is generating your mock data</span>
      </div>
    );
  }
  
  return (
    <div className='h-full space-y-2'>
      <div className='flex items-center justify-between'>
        <form onSubmit={getMockData} className='flex items-center gap-2'>
          <Select value={numOfRows?.toString()} onValueChange={handleNumOfRowsSelect}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Number of Rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem defaultValue="5" value="5" descriptor="Ideal for accuracy of your schema.">
                5 rows
              </SelectItem>
              <SelectItem value="10" descriptor="Ideal for using in other applications.">
                10 rows
              </SelectItem>
              <SelectItem value="20" descriptor="Not recommended. Uses a lot of tokens.">
                20 rows
              </SelectItem>
            </SelectContent>
          </Select>
          <button 
            type="submit"
            className='px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm'
          >
            {mockData ? "Regenerate" : "Generate"}
          </button>
        </form>
        
        <Select value={mockDataOutput} onValueChange={handleMockDataOutputOptionSelect}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Output" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Table" descriptor="Ideal for visualization">
              Table View
            </SelectItem>
            <SelectItem value="JSON" descriptor="Ideal for testing and other uses">
              JSON View
            </SelectItem>
            <SelectItem value="SQL" descriptor="To insert into an actual database for hacking">
              SQL View
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {mockDataOutput === "Table" ? (
        mockData && <MockDataResult data={mockData as {[_:string]:object[]}} />
      ) : (
        <MonacoEditor 
          value={mockDataOutput === "JSON" ? JSON.stringify(mockData, null, 2) || "" : serializer.serialize(mockData)}
          className="h-[80vh]"
          language={mockDataOutput.toLowerCase()}
          theme="custom-theme"
          options={{
            minimap: {
              enabled: false,
            },
            fontFamily: "JetBrains Mono",
            fontSize: 12,
            readOnly: true,
          }}
          beforeMount={monaco => {
            monaco.editor.defineTheme('custom-theme', {
              base: 'vs-dark',
              inherit: true,
              rules: [],
              colors: {
                'editor.background': '#00000000',
              },
            });
          }}
          keepCurrentModel={true}
        />
      )}
    </div>
  );
}