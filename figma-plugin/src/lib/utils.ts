/**
 * 全新重构的导出工具
 * 提供简洁、清晰的导出接口
 */
import { ExportFormat, TVariable, TVariableCollection } from '../types/app';
import { ExportResult } from './types/export';
import { ExportController } from './export-controller';

/**
 * 主要导出函数 - 简化的接口
 */
export async function generateThemeFiles(
  output: TVariable[],
  variables: TVariable[],
  collections: TVariableCollection[],
  appendCollectionName: boolean,
  useRemUnit: boolean,
  selectGroup: string[],
  ignoreGroup: string[],
  exportFormat: ExportFormat,
  rootElementSize: number,
  selectCollectionID: string
): Promise<ExportResult> {
  return ExportController.generateThemeFiles(
    output,
    variables,
    collections,
    appendCollectionName,
    useRemUnit,
    selectGroup,
    ignoreGroup,
    exportFormat,
    rootElementSize,
    selectCollectionID
  );
}

// 重新导出必要的类型和工具
export type { ExportResult } from './types/export';
export { ExportController } from './export-controller';
export { ColorProcessor } from './processors/color-processor';
export { UnitConverter } from './processors/unit-converter';
export { NameTransformer } from './processors/name-transformer';
export { VariableResolver } from './processors/variable-resolver';
export { FontProcessor } from './processors/font-processor';
export { CSSGenerator } from './generators/css-generator';
export { TailwindV3ConfigGenerator } from './generators/tailwind-v3-config-generator';

// 重新导出常量
export * from './constants/export-config';