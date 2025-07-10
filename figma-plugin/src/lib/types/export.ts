/**
 * 导出功能相关的类型定义
 */
import { ExportFormat, TVariable, TVariableCollection } from '../../types/app';

// ===== 基础类型 =====
export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type RGBA = RGB & {
  a: number;
};

export type SimpleValue = string | number | boolean;
export type ColorValue = RGB | RGBA;

// ===== 变量解析相关类型 =====
export type ResolvedValue =
  | SimpleValue
  | ColorValue
  | {
      [modeKey: string]: {
        name: string;
        value: ResolvedValue;
        variable?: ProcessedVariable;
      };
    };

export type ProcessedVariable = {
  id: string;
  name: string;
  _name: string;
  collection: TVariableCollection;
};

export type ResultValue = {
  name: string;
  value: ResolvedValue | undefined;
  variable?: ProcessedVariable;
};

export type ResolvedVariable = {
  initialVariable: {
    id: string;
    name: string;
    _name: string;
    collection: TVariableCollection;
    resolvedDataType: VariableResolvedDataType;
    scopes: VariableScope[];
  };
  modes: {
    [modeId: string]: ResultValue;
  };
};

export type ResolveContext = {
  variables: TVariable[];
  collections: TVariableCollection[];
  visitedVariableIds: Set<string>;
};

// ===== 导出配置 =====
export interface ExportConfig {
  output: TVariable[];
  variables: TVariable[];
  collections: TVariableCollection[];
  appendCollectionName: boolean;
  useRemUnit: boolean;
  selectGroup: string[];
  ignoreGroup: string[];
  exportFormat: ExportFormat;
  rootElementSize: number;
  selectCollectionID: string;
}

export interface ExportResult {
  css: string;
  tailwindConfig: string;
}

// ===== CSS 生成相关 =====
export interface CSSRule {
  selector: string;
  declarations: string[];
}

export interface CSSOutput {
  defaultRules: Map<string, string>;
  defaultShadcnRules: Map<string, string>;
  modeRules: Map<string, Set<string>>;
}

// ===== 字体配置 =====
export interface FontConfig {
  fontSize?: string;
  lineHeight?: string;
  fontWeight?: string;
  letterSpacing?: string;
}

export interface MergedFontConfig {
  [variant: string]: string | [string, Record<string, string>];
}