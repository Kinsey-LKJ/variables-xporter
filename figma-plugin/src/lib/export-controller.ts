/**
 * 导出控制器
 * 整合所有处理器和生成器，提供统一的导出接口
 */
import { ExportFormat, TVariable, TVariableCollection } from '../types/app';
import { ExportConfig, ExportResult } from './types/export';
import { VariableResolver } from './processors/variable-resolver';
import { FontProcessor } from './processors/font-processor';
import { CSSGenerator } from './generators/css-generator';
import { TailwindV3ConfigGenerator } from './generators/tailwind-v3-config-generator';

export class ExportController {
  /**
   * 主要导出函数 - 统一的导出接口
   */
  static async generateThemeFiles(
    output: TVariable[],
    variables: TVariable[],
    collections: TVariableCollection[],
    appendCollectionName: boolean = true,
    useRemUnit: boolean = false,
    selectGroup: string[] = [],
    ignoreGroup: string[] = [],
    exportFormat: ExportFormat,
    rootElementSize: number = 16,
    selectCollectionID: string
  ): Promise<ExportResult> {
    try {
      const config: ExportConfig = {
        output,
        variables,
        collections,
        appendCollectionName,
        useRemUnit,
        selectGroup,
        ignoreGroup,
        exportFormat,
        rootElementSize,
        selectCollectionID,
      };

      return this.processExport(config);
    } catch (error) {
      console.error('生成主题文件时出错 | Error generating theme files:', error);
      throw error;
    }
  }

  /**
   * 处理导出逻辑
   */
  private static processExport(config: ExportConfig): ExportResult {
    const {
      output,
      variables,
      collections,
      appendCollectionName,
      useRemUnit,
      selectGroup,
      ignoreGroup,
      exportFormat,
      rootElementSize,
      selectCollectionID,
    } = config;

    // 第一步：解析变量
    const resolvedVariables = VariableResolver.resolveVariables(
      output,
      variables,
      collections,
      selectGroup,
      ignoreGroup,
      exportFormat
    );

    // 第二步：生成 CSS
    const css = CSSGenerator.generateCSS(
      resolvedVariables,
      collections,
      appendCollectionName,
      useRemUnit,
      exportFormat,
      rootElementSize,
      selectCollectionID
    );

    // 第三步：生成 Tailwind 配置（仅适用于 V3 格式）
    const tailwindConfig = this.generateTailwindConfig(resolvedVariables, exportFormat);

    return {
      css,
      tailwindConfig,
    };
  }

  /**
   * 生成 Tailwind 配置
   */
  private static generateTailwindConfig(
    resolvedVariables: any[],
    exportFormat: ExportFormat
  ): string {
    // 对于 V4 格式，Tailwind 配置已集成在 CSS 的 @theme 块中
    if (exportFormat === 'Tailwind CSS V4' || exportFormat === 'shadcn/ui (Tailwind CSS V4)') {
      return '';
    }

    // 对于 V3 格式，生成 JavaScript 配置文件
    return TailwindV3ConfigGenerator.generateConfig(resolvedVariables, exportFormat);
  }

  /**
   * 处理 Tailwind CSS V4 的字体配置（集成到 CSS 中）
   * 这个方法在 CSS 生成器中调用
   */
  static processTailwindV4FontConfig(
    resolvedVariables: any[],
    format: ExportFormat
  ): { mergedConfig: any; usedVariables: Set<string> } {
    if (format !== 'Tailwind CSS V4' && format !== 'shadcn/ui (Tailwind CSS V4)') {
      return { mergedConfig: {}, usedVariables: new Set() };
    }

    const [mergedFontConfig, usedVariables] = FontProcessor.processMergedFontConfigs(
      resolvedVariables,
      format
    );

    return {
      mergedConfig: mergedFontConfig,
      usedVariables,
    };
  }

  /**
   * 验证导出配置
   */
  private static validateConfig(config: ExportConfig): void {
    if (!config.output || config.output.length === 0) {
      throw new Error('没有找到要导出的变量 | No variables found to export');
    }

    if (!config.selectGroup || config.selectGroup.length === 0) {
      throw new Error('没有选择变量组 | No variable groups selected');
    }

    if (!config.collections || config.collections.length === 0) {
      throw new Error('没有找到变量集合 | No variable collections found');
    }
  }

  /**
   * 获取支持的导出格式
   */
  static getSupportedFormats(): ExportFormat[] {
    return [
      'Tailwind CSS V3',
      'Tailwind CSS V4',
      'shadcn/ui (Tailwind CSS V3)',
      'shadcn/ui (Tailwind CSS V4)',
      'CSS Variables',
    ];
  }

  /**
   * 检查格式是否需要 Tailwind 配置文件
   */
  static needsTailwindConfig(format: ExportFormat): boolean {
    return format === 'Tailwind CSS V3' || format === 'shadcn/ui (Tailwind CSS V3)';
  }

  /**
   * 检查格式是否为 V4
   */
  static isV4Format(format: ExportFormat): boolean {
    return format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)';
  }

  /**
   * 检查格式是否为 shadcn/ui
   */
  static isShadcnUiFormat(format: ExportFormat): boolean {
    return format === 'shadcn/ui (Tailwind CSS V3)' || format === 'shadcn/ui (Tailwind CSS V4)';
  }
}