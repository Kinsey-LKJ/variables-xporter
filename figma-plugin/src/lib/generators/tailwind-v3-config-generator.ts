/**
 * Tailwind CSS V3 配置生成器
 * 专门负责生成 Tailwind CSS V3 的 JavaScript 配置文件
 * 注意：Tailwind CSS V4 的配置已集成在 CSS 生成器的 @theme 块中
 */
import * as changeCase from 'change-case';
import { ExportFormat } from '../../types/app';
import { ResolvedVariable, MergedFontConfig } from '../types/export';
import { FontProcessor } from '../processors/font-processor';
import { NameTransformer } from '../processors/name-transformer';
import { TYPOGRAPHY_PROPERTY_MAPPING } from '../constants/export-config';

export class TailwindV3ConfigGenerator {
  /**
   * 生成 Tailwind CSS V3 JavaScript 配置文件
   */
  static generateConfig(
    results: ResolvedVariable[],
    format: ExportFormat,
    ignoreTopLevelNames: boolean = false
  ): string {
    // 只为 V3 格式生成配置
    if (format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)') {
      return ''; // V4 版本不需要单独的 JS 配置文件
    }

    const config = this.buildTailwindConfig(results, format, ignoreTopLevelNames);
    return this.formatConfigOutput(config);
  }

  /**
   * 构建 Tailwind 配置对象
   */
  private static buildTailwindConfig(
    results: ResolvedVariable[],
    format: ExportFormat,
    ignoreTopLevelNames: boolean
  ): Record<string, any> {
    const config: Record<string, any> = {};

    // 处理字体配置
    const [mergedFontConfig, usedVariables] = FontProcessor.processMergedFontConfigs(
      results,
      format,
      ignoreTopLevelNames
    );

    // 处理其他字体属性
    const fontProperties = FontProcessor.processFontProperties(results, usedVariables, format);
    const topLevelFontConfig = FontProcessor.processTopLevelFontConfigs(results, format);

    // 处理所有变量
    this.processAllVariables(results, config, usedVariables, format, ignoreTopLevelNames);

    // 合并字体配置
    this.mergeFontConfigurations(config, mergedFontConfig, fontProperties, topLevelFontConfig);

    // 清理空的字体配置
    if (config.font && Object.keys(config.font).length === 0) {
      delete config.font;
    }

    return config;
  }

  /**
   * 处理所有变量
   */
  private static processAllVariables(
    results: ResolvedVariable[],
    config: Record<string, any>,
    usedVariables: Set<string>,
    format: ExportFormat,
    ignoreTopLevelNames: boolean
  ): void {
    for (const result of results) {
      const { initialVariable } = result;
      const name = initialVariable.name;

      // 跳过已使用的变量
      if (usedVariables.has(name)) {
        continue;
      }

      // 跳过字体配置变量
      if (this.isFontConfigVariable(name, format)) {
        continue;
      }

      // 跳过顶层字体属性
      if (this.isTopLevelFontProperty(name)) {
        continue;
      }

      // 处理普通变量
      this.processVariable(result, config, format, ignoreTopLevelNames);
    }
  }

  /**
   * 处理单个变量
   */
  private static processVariable(
    result: ResolvedVariable,
    config: Record<string, any>,
    format: ExportFormat,
    ignoreTopLevelNames: boolean
  ): void {
    const { initialVariable } = result;
    const path = this.parseVariablePath(initialVariable.name);
    const topLevel = path[0];

    if (!config[topLevel]) {
      config[topLevel] = {};
    }

    const cssValue = this.processVariableValue(initialVariable, format, ignoreTopLevelNames);
    this.setNestedValue(config[topLevel], path.slice(1), cssValue);
  }

  /**
   * 解析变量路径
   */
  private static parseVariablePath(name: string): string[] {
    const nameArr = name.split('/');
    return [
      changeCase.camelCase(nameArr[0]),
      ...nameArr.slice(1).map((segment) => {
        return segment === 'DEFAULT' ? 'DEFAULT' : changeCase.kebabCase(segment);
      }),
    ];
  }

  /**
   * 设置嵌套值
   */
  private static setNestedValue(obj: any, path: string[], cssValue: string): void {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    const finalKey = path[path.length - 1];
    if (finalKey === 'default') {
      current['DEFAULT'] = cssValue.replace('-default', '');
    } else {
      current[finalKey] = cssValue;
    }
  }

  /**
   * 处理变量值
   */
  private static processVariableValue(
    variable: ResolvedVariable['initialVariable'],
    format: ExportFormat,
    ignoreTopLevelNames: boolean
  ): string {
    const nameArray = ignoreTopLevelNames 
      ? variable.name.split('/').slice(1)
      : variable.name.split('/');

    const nameProcess = nameArray
      .map((segment) => changeCase.kebabCase(segment))
      .join('-');

    const { name: nameProcessShadcnUi } = NameTransformer.processShadcnUiVariableName(
      nameProcess,
      format
    );

    // 根据变量类型生成适当的 CSS 引用
    if (variable.resolvedDataType === 'COLOR') {
      return `rgb(var(--${nameProcessShadcnUi}))`;
    }

    return `var(--${nameProcessShadcnUi})`;
  }

  /**
   * 合并字体配置
   */
  private static mergeFontConfigurations(
    config: Record<string, any>,
    mergedFontConfig: MergedFontConfig,
    fontProperties: Record<string, Record<string, string>>,
    topLevelFontConfig: Record<string, string>
  ): void {
    // 合并字体大小配置
    if (Object.keys(mergedFontConfig).length > 0) {
      if (!config.fontSize) {
        config.fontSize = {};
      }
      Object.assign(config.fontSize, mergedFontConfig);
    }

    // 合并其他字体属性
    Object.entries(fontProperties).forEach(([key, value]) => {
      if (Object.keys(value).length > 0) {
        if (key === 'fontSize' && config.fontSize) {
          config.fontSize = { ...value, ...config.fontSize };
        } else {
          config[key] = value;
        }
      }
    });

    // 合并顶层字体配置
    Object.assign(config, topLevelFontConfig);
  }

  /**
   * 检查是否为字体配置变量
   */
  private static isFontConfigVariable(name: string, format: ExportFormat): boolean {
    // V3 格式使用 font-size
    const pattern = /^font-size\/([^/]+)\/(fontSize|lineHeight|fontWeight|letterSpacing|default)$/i;
    return pattern.test(name);
  }

  /**
   * 检查是否为顶层字体属性
   */
  private static isTopLevelFontProperty(name: string): boolean {
    const topLevelFontPattern = new RegExp(
      `^font\\/(${Object.keys(TYPOGRAPHY_PROPERTY_MAPPING).join('|')})\\/`
    );
    return topLevelFontPattern.test(name);
  }

  /**
   * 格式化配置输出
   */
  private static formatConfigOutput(config: Record<string, any>): string {
    const configContent = `module.exports = {
  theme: {
    extend: {
      ${Object.entries(config)
        .map(([key, value]) => `${key}: ${JSON.stringify(value, null, 6)}`)
        .join(',\n')}
    },
  },
};`;

    return configContent
      .replace(/"/g, "'")
      .replace(/\n\s*\n/g, '\n');
  }
}