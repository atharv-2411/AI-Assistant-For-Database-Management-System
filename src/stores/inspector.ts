import { create } from "zustand";

export const TABS__MAIN_SCHEMA = "main-code";
export const TABS__DOCUMENTATION = "documentation";
export const TABS__MOCK_DATA = "mock-data";
export const TABS__EXPORT = "export";

export type MockDataOutputConfig = "JSON" | "Table" | "sql";

export type ExportOptions = "django" | "prisma" | "eloquent" | "drizzle";


interface InspectorState {
  currentTab: string;
  setCurrentTab: (_:string) => void;
  
  mainSchemaText: string;
  setMainSchemaText: (_:string) => void;
  addToMainSchemaText: (_:string) => void;
  clearMainSchemaText: () => void;

  diffSchemaText: string;
  setDiffSchemaText: (_:string) => void;
  addToDiffSchemaText: (_:string) => void;
  clearDiffSchemaText: () => void;

  mainCodeDiffMode: boolean; // For proposing changes
  setMainCodeDiffMode: (_:boolean) => void;
  
  buffering: boolean;
  setBuffering: (_:boolean) => void;
  documentationBuffering: boolean;
  setDocumentationBuffering: (_:boolean) => void;

  documentationText: string;
  setDocumentationText: (_: string) => void;
  addToDocumentationText: (_:string) => void;

  isExplaining: boolean;
  setIsExplaining: (_:boolean) => void;

  mockData: object | null;
  setMockData: (_: object | null) => void;
  mockDataOutput: MockDataOutputConfig;
  setMockDataOutput: (_: MockDataOutputConfig) => void;
  numOfRows: number | null,
  setNumOfRows: (_:number | null) => void;

  exportOption: ExportOptions;
  setExportOption: (_:ExportOptions) => void;
}

const useInspectorStore = create<InspectorState>()(set => ({
  currentTab: TABS__MAIN_SCHEMA,
  setCurrentTab: (tab) => set(_ => ({ currentTab: tab })),
  
  mainSchemaText: "",
  setMainSchemaText: (newSchemaText) => set(state => ({ mainSchemaText: newSchemaText})),
  addToMainSchemaText: (newCharacter) => set(state => ({ mainSchemaText: state.mainSchemaText + newCharacter})),
  clearMainSchemaText: () => set(_ => ({ mainSchemaText: "" })),
  
  buffering: false,
  setBuffering: (val) => set(_ => ({ buffering: val })),
  documentationBuffering: false,
  setDocumentationBuffering: (val) => set(_ => ({ documentationBuffering: val })),
  
  diffSchemaText: "",
  addToDiffSchemaText: (newCharacter) => set(state => ({ diffSchemaText: state.diffSchemaText + newCharacter})),
  setDiffSchemaText: (newSchemaText) => set(_ => ({ diffSchemaText: newSchemaText})),
  clearDiffSchemaText: () => set(_ => ({ diffSchemaText: ""})),

  mainCodeDiffMode: false,
  setMainCodeDiffMode: (val) => set(_ => ({ mainCodeDiffMode: val})),

  documentationText: "",
  setDocumentationText: (newDocumentationText) => set(_ => ({ documentationText: newDocumentationText })),
  addToDocumentationText: (newCharacter) => set(state => ({ documentationText: state.documentationText + newCharacter})),

  isExplaining: false,
  setIsExplaining: (val) => set(_ => ({ isExplaining: val })),

  mockData: null,
  setMockData: (data) => set(_ => ({ mockData: data })),

  mockDataOutput: "Table",
  setMockDataOutput: (config) => set(_ => ({ mockDataOutput: config })),

  numOfRows: 5,
  setNumOfRows: (val) => set(_ => ({ numOfRows: val })),

  exportOption: "django",
  setExportOption: (option) => set(_ => ({ exportOption: option })),
}));

export default useInspectorStore;