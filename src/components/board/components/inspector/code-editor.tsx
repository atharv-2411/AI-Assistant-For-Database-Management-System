"use client";

import React, { useRef, useState } from 'react'

import { DiffEditor, Editor } from '@monaco-editor/react';
import type { OnMount as OnMonacoMount } from '@monaco-editor/react';

import useInspectorStore from '@/stores/inspector';
import useFlowStore from '@/stores/flow';
import SQLToReactFlowParser from '@/lib/react-flow-parser';
import { Sparkle, X } from 'lucide-react';
import ExplainWithAIButton from './explain-with-ai-button';
import ExplainWithAIComponent from './explain-with-ai-component';

type CodeEditorProps = {}

const OPEN_WITH_AI_Y_OFFSET_PX = 10; // By how much to offset 'Explain with AI' button

export default function CodeEditor({}: CodeEditorProps) {
  const { 
    mainSchemaText,
    buffering,
    diffSchemaText,
    mainCodeDiffMode,
    clearDiffSchemaText,
    setMainCodeDiffMode,
    setMainSchemaText,
    isExplaining, 
    setIsExplaining,
  } = useInspectorStore();

  const {
    setFlowNodes,
    setFlowEdges,
  } = useFlowStore();

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    visible: false,
  });
  const [currentSelection, setCurrentSelection] = useState("");

  const explainWithAIButtonRef = useRef<HTMLDivElement | null>(null);

  const handleExplainWithAIButtonClick = () => {
    if ( !currentSelection ) return;

    setIsExplaining(true);
  }
  
  const handleCodeChange = (value: string | undefined) => {
    // Don't update flow chart when streaming
    if ( !buffering && mainSchemaText ) {
      const parser = new SQLToReactFlowParser();
      const { nodes, edges } = parser.parse(value || "");

      setMainSchemaText(value || "");
      setFlowNodes(nodes.map(node => {
        const correspondingNode = nodes.find(n => n.id === node.id);
        if ( correspondingNode ) {
          return {
            ...node,
            position: correspondingNode.position,
          }
        }
        
        return node;
      }));
      setFlowEdges(edges);
    }
  }

  const handleMonacoMount: OnMonacoMount = (editor, monaco) => {
    editor.getModel()?.onDidChangeContent(() => {
      // Text Change
      const value = editor.getValue();
      handleCodeChange(value);
    });

    editor.onDidChangeCursorSelection(e => {
      // Selection change
      // if (isExplaining) return;
      
      const currentModel = editor.getModel();
      if ( currentModel ) {
        const selection = e.selection;

        const startPosition = {
          lineNumber: selection.startLineNumber,
          column: selection.startColumn,
        }

        const startCoordinates = editor.getScrolledVisiblePosition(startPosition);
        if ( startCoordinates ) {
          const buttonHeight = explainWithAIButtonRef.current?.clientHeight ?? 0;
          
          const top = startCoordinates.top - buttonHeight - OPEN_WITH_AI_Y_OFFSET_PX; 
          const left = startCoordinates.left;

          const selectedText = currentModel.getValueInRange(selection);
          if ( selectedText.length > 0 ) {
            setMenuPosition({
              left,
              top,
              visible: true,
            });

            setCurrentSelection(selectedText);
          } else {
            setMenuPosition(prev => ({ ...prev, visible: false }));
          }
        }
      }
    });
  }
  
  if ( mainCodeDiffMode && !buffering ) {
    const handleCancelChanges = () => {
      clearDiffSchemaText();
      setMainCodeDiffMode(false); 
      handleCodeChange(mainSchemaText);
    }

    const handleAcceptChanges = () => {
      setMainSchemaText(diffSchemaText);
      clearDiffSchemaText();
      setMainCodeDiffMode(false);
    }
    
    // Diff Mode
    return <>
      <DiffEditor 
        original={mainSchemaText || ""}
        modified={diffSchemaText || ""}
        
        height="80vh"
        language='sql'
        theme="custom-theme"
        options={{
          minimap: {
            enabled: false,
          },
          // fontFamily: "JetBrains Mono",
          readOnly: buffering,
          enableSplitViewResizing: true,
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
      />
      {/* Accept Changes button */}
      {
        !buffering && (
          <div className='flex gap-3 items-center my-3'>
            <span className='text-xs text-zinc-500 font-poppins'>Accept changes?</span>
            <button onClick={handleCancelChanges} className='text-xs px-2 py-1 rounded-md text-white bg-red-500 hover:bg-red-600 font-mono'>Cancel</button>
            <button onClick={handleAcceptChanges} className='text-xs px-2 py-1 rounded-md text-white border-[1px] border-green-500 hover:bg-white/10 font-mono'>Accept</button>

          </div>
        )
      }
    </>
  }
  
  return (
    <div className="h-[80vh] relative">
      {
        !isExplaining ? 
          <ExplainWithAIButton 
            {...menuPosition}
            handleButtonClick={handleExplainWithAIButtonClick}
            ref={explainWithAIButtonRef}
          /> 
          :
          <ExplainWithAIComponent 
            sectionToExplain={currentSelection}
          />
      }
      <Editor 
        value={mainSchemaText || ""}
        className="h-full"
        language="sql"
        theme="custom-theme"
        options={{
          minimap: {
            enabled: false,
          },
          fontFamily: "JetBrains Mono",
          readOnly: buffering,
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
        onMount={handleMonacoMount}
      />
    </div>
  )
}