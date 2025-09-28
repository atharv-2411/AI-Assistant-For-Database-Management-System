import { Node, NodeProps, Position } from "@xyflow/react";
import { BaseNode } from "@/components/base-node";
import { LabeledHandle } from "@/components/labeled-handle";
import useInspectorStore from "@/stores/inspector";
import { KeySquare } from "lucide-react";

type DatabaseSchemaNode = Node<{
  label: string;
  schema: { title: string; type: string }[];
}>;

const getTypeColor = (type: string): string => {
  const typeColor: {
    [_: string]: string,
  } = {
    // Numeric types
    'int': '#2563eb',        // text-blue-500
    'integer': '#2563eb',    // text-blue-500
    'float': '#2563eb',      // text-blue-500
    'double': '#2563eb',     // text-blue-500
    'decimal': '#2563eb',    // text-blue-500
    'number': '#2563eb',     // text-blue-500
    
    // String types
    'string': '#10b981',     // text-emerald-500
    'text': '#10b981',       // text-emerald-500
    'char': '#10b981',       // text-emerald-500
    'varchar': '#10b981',    // text-emerald-500
    
    // Date/Time types
    'date': '#7c3aed',       // text-purple-500
    'datetime': '#7c3aed',   // text-purple-500
    'timestamp': '#7c3aed',  // text-purple-500
    'time': '#7c3aed',       // text-purple-500
    
    // Boolean type
    'boolean': '#f59e0b',     // text-yellow-500
    'bool': '#f59e0b',        // text-yellow-500
    
    // Array/Object types
    'array': '#d946ef',       // text-pink-500
    'object': '#d946ef',      // text-pink-500
    'json': '#d946ef',        // text-pink-500
    
    // Binary types
    'binary': '#fb923c',      // text-orange-500
    'blob': '#fb923c',        // text-orange-500
    
    // UUID/ID types
    'uuid': '#22d3ee',        // text-cyan-500
    'id': '#22d3ee',          // text-cyan-500
    
    // Default
    'default': '#6b7280'      // text-gray-500
  };

  const normalizedType = type.toLowerCase();
  return typeColor[normalizedType] || typeColor.default;
};

export function DatabaseSchemaNode({
  data,
  selected,
}: NodeProps<DatabaseSchemaNode>) {
  const { mainCodeDiffMode } = useInspectorStore();
  
  return (
    <BaseNode className={`p-0 bg-zinc-800 min-w-[200px] ${mainCodeDiffMode ? "animate-pulse ease-out ring-2 ring-white" : ""}`} selected={selected}>
      <h2 className="rounded-tl-md rounded-tr-md bg-zinc-900 p-2 text-center text-sm text-white font-bold">
        {data.label}
      </h2>
      <div className="grid">
        {data.schema.map((entry) => (
          <div 
            key={entry.title}
            className="relative grid grid-cols-2 text-sm bg-neutral-800 hover:bg-neutral-900"
          >
            <div className="relative py-3 pl-0 font-mono">
              <LabeledHandle
                id={entry.title}
                title={entry.title}
                type="target"
                position={Position.Left}
                labelclassName="text-zinc-300/90"
              />
            </div>
            <div className="relative py-3 pr-0 text-right font-mono">
              <LabeledHandle
                labelStyle={{}}
                id={entry.title}
                title=""
                type="source"
                position={Position.Right}
                className="p-0 text-blue-400"
                handleclassname="p-0"
                labelclassName={`p-0 font-bold`}
              >
                <div className="flex items-center gap-2">
                  <span 
                    style={{
                      color: getTypeColor(entry.type),
                    }}
                    className="px-3 text-foreground p-0 font-bold"
                  >{entry.type}</span>
                  {
                    // @ts-ignore
                    entry.is_pk && (
                      <KeySquare className="text-yellow-500 mr-2" size={16}/>
                    )
                  }
                  {
                    // @ts-ignore
                    entry.is_null && (
                      <span className="border-[1px] border-dashed border-gray-400 mr-2 text-xs px-1 rounded-lg text-gray-400">NULL</span>
                    )
                  }
                </div>
              </LabeledHandle>
            </div>
          </div>
        ))}
      </div>
    </BaseNode>
  );
}