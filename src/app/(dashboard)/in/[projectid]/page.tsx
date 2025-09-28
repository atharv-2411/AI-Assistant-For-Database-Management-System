import SchemaBoard from '@/components/board';
import React from 'react'

export default function ProjectPage({
  params,
}: {
  params: any
}) {
  
  return (
    <div className='flex-1 flex flex-col'>
      <SchemaBoard />
    </div>
  );
}