import React, { useState } from 'react'

import { Input } from '@/components/ui/input'
import { LoaderCircle, Pickaxe, Zap } from 'lucide-react'

import type { Stream } from 'openai/streaming.mjs';
import type { ChatCompletion, ChatCompletionChunk } from 'openai/resources/index.mjs';

// Server actions
import { generateSchemaFromPrompt } from "@/actions/schema-generator";

import useInspectorStore from '@/stores/inspector';
import useFlowStore from '@/stores/flow';
import useLoaderStore, { ENUM__LOADER_TO_MAIN_CODE } from '@/stores/loader';
import SQLToReactFlowParser from '@/lib/react-flow-parser';
import { sleep } from '@/lib/utils';
import StarBorder from '@/components/StarBorder';

type Props = {}

export const maxDuration = 60;

export default function PromptBar({}: Props) {
  /*
    Prompt Bar
    Takes in text input and sends the prompt to OpenAI API to get schema response to process later.
  */

  const [prompt, setPrompt] = useState("");

  const { mainSchemaText, addToMainSchemaText, buffering, setBuffering, setDiffSchemaText , setMainCodeDiffMode } = useInspectorStore();
  const { setEditorOpen, codeEditorOpen, setFlowEdges, setFlowNodes } = useFlowStore();
  const { setMainCodeLoadingValue } = useLoaderStore();

  async function handlePromptSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    setBuffering(true);

    const isDiffMode = mainSchemaText.length > 0;
    setMainCodeDiffMode(isDiffMode);

    if ( !codeEditorOpen ) setEditorOpen(true);
    
    setMainCodeLoadingValue(ENUM__LOADER_TO_MAIN_CODE.CONNECTING_TO_OPENAI); // Set to initial Value

    // Emulate loading for user convenience
    if (isDiffMode) setTimeout(() => setMainCodeLoadingValue(ENUM__LOADER_TO_MAIN_CODE.GENERATING_SQL_CONTENT), 2000)
      
    const response = await generateSchemaFromPrompt(prompt, isDiffMode ? mainSchemaText : undefined);

    setMainCodeLoadingValue(ENUM__LOADER_TO_MAIN_CODE.GENERATING_SQL_CONTENT)

    var schemaText_ = "";
    if ( isDiffMode ) {
      const suggestedResponse = (response as ChatCompletion).choices[0]?.message.content || "";
      setDiffSchemaText(suggestedResponse);
      schemaText_ = suggestedResponse;
    } else {
      for await (const chunk of response as Stream<ChatCompletionChunk>) {
          addToMainSchemaText(chunk.choices[0]?.delta?.content || "");
          schemaText_ += chunk.choices[0]?.delta?.content || "";
      }
    }

    setMainCodeLoadingValue(ENUM__LOADER_TO_MAIN_CODE.GENERATING_FLOW_CONTENT);

    const parser = new SQLToReactFlowParser();
    const { nodes, edges } = parser.parse(schemaText_);

    setFlowNodes(nodes);
    setFlowEdges(edges);

    await sleep(2000);
    setMainCodeLoadingValue(ENUM__LOADER_TO_MAIN_CODE.COMPLETE);
    await sleep(1500);
    
    setBuffering(false);
    setPrompt("");
  }

  return (
    <form 
    onSubmit={handlePromptSubmit}
    className='
      absolute 
      w-[40rem] min-h-16 
      bottom-8 left-1/2 -translate-x-1/2 
      bg-zinc-900 
      rounded-xl
      m-[20px]
      flex items-center justify-between
      px-6
      overflow-hidden
      z-10
    '>

      {
        buffering ? <LoaderCircle size={18} className='text-zinc-700 animate-spin' /> : <Zap className='text-zinc-700' size={18} />
      }

      <Input 
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        className='peer border-0 focus-visible:ring-0 placeholder:text-zinc-500 text-zinc-500 py-3 !text-xs' 
        placeholder='Your prompt goes here....'
      />
      <div className='
        peer-[:not(:placeholder-shown)]:opacity-100 opacity-0 
        text-emerald-700
        bg-transparent
        hover:bg-emerald-600
        hover:text-zinc-800
        
        right-4
        absolute
        peer-[:not(:placeholder-shown)]:translate-y-0
        -translate-y-10
        
        p-2
        rounded-lg
        cursor-pointer
        
        transition-all
        '>
        <Pickaxe size={18} />
      </div>
      <span className="absolute bottom-[2px] left-11 text-[9px] text-zinc-500">{ prompt.length > 0 && `${prompt.length} characters` }</span>
    </form>
  )
}
