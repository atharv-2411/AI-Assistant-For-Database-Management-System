import { LoadingState } from "@/components/ui/multi-step-loader";
import { create } from "zustand";

export enum ENUM__LOADER_TO_MAIN_CODE {
  CONNECTING_TO_OPENAI,
  GENERATING_SQL_CONTENT,
  GENERATING_FLOW_CONTENT,
  GENERATING_DOCUMENTATION_CONTENT,
  COMPLETE,
}

export const LOADER_TO_MAIN_CODE: LoadingState[] = [
  {
    text: "Connecting to Open AI server for SQL",
  },
  {
    text: "Generating content",
  },
  {
    text: "Generating flow diagram for the solution",
  },
  {
    text: "Complete",
  },
];

interface LoaderState {
  mainCodeLoading: boolean,
  mainCodeLoadingStep: ENUM__LOADER_TO_MAIN_CODE;
  setMainCodeLoadingValue: (_: ENUM__LOADER_TO_MAIN_CODE) => void;
  toggleMainCodeLoading: () => void;
}

const useLoaderStore = create<LoaderState>()(set => ({
  mainCodeLoading: false,
  mainCodeLoadingStep: ENUM__LOADER_TO_MAIN_CODE.CONNECTING_TO_OPENAI,
  setMainCodeLoadingValue: (val) => set(_ => ({ mainCodeLoadingStep: val})),
  toggleMainCodeLoading: () => set(state => ({ mainCodeLoading: !state.mainCodeLoading })),
}));

export default useLoaderStore;