import React from 'react'
import Image from 'next/image'

export default function Logo() {
  return (
    <div className='absolute z-[100] -translate-y-10 translate-x-3 flex flex-col'>
      <Image src="/cohesion.png" alt="Company header logo" width={200} height={40}/>
      <span className='-translate-y-[4.6rem] translate-x-5 text-xs text-gray-300 font-mono'>AI-Powered SQL Assistant</span>
    </div>
  )
}