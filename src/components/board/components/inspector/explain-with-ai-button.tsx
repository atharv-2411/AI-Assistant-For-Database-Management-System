import { Sparkle } from 'lucide-react';
import React, { forwardRef } from 'react'

type Props = {
  top: number;
  left: number;
  visible: boolean;
  handleButtonClick: () => void;
}

const ExplainWithAIButton =  forwardRef<HTMLDivElement, Props>(({
  top,
  left,
  visible,
  handleButtonClick,
}, ref) => {
  return (
    <div 
      ref={ref}
      style={{
        top: `${top}px`,
        left: `${left}px`,
        opacity: visible ? "1" : "0",
      }}
      className='absolute border-[1px] cursor-pointer hover:bg-zinc-700 border-green-300 h-7 w-32 bg-zinc-800 top-0 left-0 rounded-md flex items-center justify-between py-1 px-3 shadow-sm transition-all z-[100]'
    >
      <Sparkle size={16} className='text-yellow-300/80'/>
      <span onClick={handleButtonClick} className="text-xs text-gray-300">Explain with AI</span>
    </div>
  );
});

export default ExplainWithAIButton;