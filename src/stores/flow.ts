import { TableNode } from "@/types/renderer";
import { Edge } from "@xyflow/react";
import { create } from "zustand";

interface FlowState {
  codeEditorOpen: boolean;
  toggleEditorOpen: () => void;
  setEditorOpen: (_:boolean) => void;
  flowNodes: TableNode[],
  flowEdges: Edge[],
  setFlowNodes: (_:TableNode[]) => void;
  setFlowEdges: (_:Edge[]) => void;
}

const useFlowStore = create<FlowState>()(set => ({
  codeEditorOpen: false,
  toggleEditorOpen: () => set(state => ({
    codeEditorOpen: !state.codeEditorOpen,
  })),
  setEditorOpen: val => set(_ => ({ codeEditorOpen: val})),
  flowNodes: [],
  flowEdges: [],
  setFlowNodes: (nodes) => set(_ => ({ flowNodes: nodes })),
  setFlowEdges: (edges) => set(_ => ({ flowEdges: edges })),
}));

export default useFlowStore;