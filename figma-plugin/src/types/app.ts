import type TextDataFromZh from '../app/zh.json'

export interface TVariableCollection {
  id: string;
  name: string;
  hiddenFromPublishing: boolean;
  remote: boolean;
  modes: Array<{
    modeId: string;
    name: string;
  }>;
  variableIds: string[];
  defaultModeId: string;
  key: string;
}

export interface TVariable {
  id: string;
  name: string;
  description: string;
  hiddenFromPublishing: boolean;
  remote: boolean;
  variableCollectionId: string;
  key: string;
  resolvedType: VariableResolvedDataType;
  valuesByMode: {
    [modeId: string]: VariableValue;
  };
  scopes: Array<VariableScope>;
  codeSyntax: {
    [platform in CodeSyntaxPlatform]?: string;
  };
}

export interface RGBObject {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export type ColorValue = RGB | RGBA | VariableAlias;

export interface ValueByMode {
  [modeId: string]: VariableValue;
}

export interface TVariableOptions {
  variables: TVariable[];
  label: string;
  value: string;
}

export interface FileContent {
  name: string;
  content: string;
}

export type ExportFormat = 'Tailwind CSS V3' | 'CSS Variables' | 'Tailwind CSS V4' | 'shadcn/ui (Tailwind CSS V3)' | 'shadcn/ui (Tailwind CSS V4)' | undefined;


export type TextData = typeof TextDataFromZh

export type WindowSize = 'small' | 'medium' | 'large';

