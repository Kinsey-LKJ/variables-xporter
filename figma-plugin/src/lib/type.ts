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

export type ExportFormat = 'Tailwind CSS' | 'CSS Variables';

export interface TextData {
  back: string;
  export_figma_variables_tailwind_css_or_css_variables: string;
  get_started: string;
  select_variables_to_export: string;
  select_collection: string;
  select_variables: string;
  format: string;
  export: string;
  export_successful: string;
  import_as_tailwind_css_presets: string;
  use_rem_as_unit: string;
  ignore_tailwind_css_default_palette: string;
  ignore_default_palette_description: string;
  tailwind_css_figma_template: string;
}
