/**
 * 字体配置处理器
 * 负责处理字体相关的变量合并和配置生成
 */
import * as changeCase from 'change-case';
import { ExportFormat } from '../../types/app';
import { ResolvedVariable, FontConfig, MergedFontConfig } from '../types/export';
import { 
  TYPOGRAPHY_PROPERTY_MAPPING,
  TAILWIND_V3_PROPERTY_MAPPING,
  TAILWIND_V4_PROPERTY_MAPPING
} from '../constants/export-config';

export class FontProcessor {
  /**
   * 处理合并的字体配置
   */
  static processMergedFontConfigs(
    results: ResolvedVariable[],
    format: ExportFormat,
    ignoreTopLevelNames: boolean = false
  ): [MergedFontConfig, Set<string>] {
    const fontConfigs: Record<string, FontConfig> = {};
    const usedVariables = new Set<string>();

    const isV4 = format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)';
    const propertyPattern = this.buildTypographyPropertyPattern(format);

    // 处理标准字体配置
    for (const result of results) {
      const { initialVariable } = result;
      const name = initialVariable.name;

      const fontMatch = name.match(
        isV4
          ? new RegExp(`^text\\/([^/]+)\\/(${propertyPattern}|[Dd][Ee][Ff][Aa][Uu][Ll][Tt])$`)
          : new RegExp(`^font-size\\/([^/]+)\\/(${propertyPattern}|[Dd][Ee][Ff][Aa][Uu][Ll][Tt])$`)
      );

      if (fontMatch) {
        this.processFontMatch(
          fontMatch,
          result,
          fontConfigs,
          usedVariables,
          ignoreTopLevelNames
        );
      }
    }

    // 移除不完整的配置
    this.removeIncompleteFontConfigs(fontConfigs, usedVariables, format);

    // 生成合并的字体配置
    const mergedFontSize = this.generateMergedFontSize(fontConfigs);

    return [mergedFontSize, usedVariables];
  }

  /**
   * 构建字体属性模式
   */
  private static buildTypographyPropertyPattern(format: ExportFormat): string {
    const isV4 = format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)';
    const rules = isV4 ? TAILWIND_V4_PROPERTY_MAPPING : TAILWIND_V3_PROPERTY_MAPPING;
    
    return Object.keys({ ...TYPOGRAPHY_PROPERTY_MAPPING, ...rules })
      .map((key) => key.replace(/[-]/g, '\\-'))
      .join('|');
  }

  /**
   * 处理字体匹配
   */
  private static processFontMatch(
    fontMatch: RegExpMatchArray,
    result: ResolvedVariable,
    fontConfigs: Record<string, FontConfig>,
    usedVariables: Set<string>,
    ignoreTopLevelNames: boolean
  ): void {
    const [, variant, rawProp] = fontMatch;
    const { initialVariable } = result;
    
    let prop = Object.keys(TYPOGRAPHY_PROPERTY_MAPPING).includes(rawProp) 
      ? TYPOGRAPHY_PROPERTY_MAPPING[rawProp as keyof typeof TYPOGRAPHY_PROPERTY_MAPPING]
      : rawProp;
    
    if (prop.toLowerCase() === 'default') {
      prop = 'fontSize';
    }

    if (!fontConfigs[variant]) {
      fontConfigs[variant] = {};
    }

    const defaultMode = result.modes[initialVariable.collection.defaultModeId];
    if (defaultMode && defaultMode.value !== undefined) {
      const nameArray = ignoreTopLevelNames 
        ? initialVariable.name.split('/').slice(1)
        : initialVariable.name.split('/');

      // 处理 fontSize 的特殊情况
      let processedNameArray = nameArray;
      if (prop === 'fontSize' && 
          nameArray[nameArray.length - 1].toLowerCase() === 'default') {
        processedNameArray = nameArray.slice(0, -1);
      }

      const value = `var(--${processedNameArray
        .map((segment) => changeCase.kebabCase(segment))
        .join('-')})`;

      fontConfigs[variant][prop as keyof FontConfig] = value;

      if (fontConfigs[variant].fontSize || prop === 'fontSize') {
        usedVariables.add(initialVariable.name);
      }
    }
  }

  /**
   * 移除不完整的字体配置
   */
  private static removeIncompleteFontConfigs(
    fontConfigs: Record<string, FontConfig>,
    usedVariables: Set<string>,
    format: ExportFormat
  ): void {
    const isV4 = format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)';
    const prefix = isV4 ? 'text' : 'font-size';

    for (const [variant, config] of Object.entries(fontConfigs)) {
      if (!config.fontSize) {
        delete fontConfigs[variant];
        
        // 移除这些变量的已使用标记
        for (const usedVar of usedVariables) {
          if (usedVar.startsWith(`${prefix}/${variant}/`)) {
            usedVariables.delete(usedVar);
          }
        }
      }
    }
  }

  /**
   * 生成合并的字体大小配置
   */
  private static generateMergedFontSize(
    fontConfigs: Record<string, FontConfig>
  ): MergedFontConfig {
    const mergedFontSize: MergedFontConfig = {};

    for (const [variant, config] of Object.entries(fontConfigs)) {
      if (!config.fontSize) continue;

      const settings: Record<string, string> = {};
      if (config.lineHeight) settings.lineHeight = config.lineHeight;
      if (config.fontWeight) settings.fontWeight = config.fontWeight;
      if (config.letterSpacing) settings.letterSpacing = config.letterSpacing;

      mergedFontSize[variant] = Object.keys(settings).length > 0 
        ? [config.fontSize, settings]
        : config.fontSize;
    }

    return mergedFontSize;
  }

  /**
   * 处理普通字体属性
   */
  static processFontProperties(
    results: ResolvedVariable[],
    usedVariables: Set<string>,
    format: ExportFormat
  ): Record<string, Record<string, string>> {
    const configs: Record<string, Record<string, string>> = {};
    const propertyPattern = this.buildTypographyPropertyPattern(format);

    for (const result of results) {
      const { initialVariable } = result;
      const name = initialVariable.name;

      // 如果这个变量已经被用于合并格式，跳过它
      if (usedVariables.has(name)) {
        continue;
      }

      // 匹配 (font/)?property/xx 格式
      const pattern = `^(font\\/|)(${propertyPattern})\\/([^/]+)$`;
      const match = name.match(new RegExp(pattern));

      if (match) {
        const [, , rawProp, variant] = match;
        const configKey = TYPOGRAPHY_PROPERTY_MAPPING[
          rawProp as keyof typeof TYPOGRAPHY_PROPERTY_MAPPING
        ];

        if (!configs[configKey]) {
          configs[configKey] = {};
        }

        const defaultMode = result.modes[initialVariable.collection.defaultModeId];
        if (defaultMode && defaultMode.value !== undefined) {
          const value = `var(--${name.replace(/\//g, '-')})`;
          configs[configKey][variant] = value;
        }
      }
    }

    return configs;
  }

  /**
   * 处理顶层字体配置
   */
  static processTopLevelFontConfigs(
    results: ResolvedVariable[],
    format: ExportFormat
  ): Record<string, string> {
    const fontConfig: Record<string, string> = {};

    for (const result of results) {
      const { initialVariable } = result;
      const name = initialVariable.name;

      // 匹配顶层字体变量
      const fontMatch = name.match(/^font\/(size|family|line-height|weight|letter-spacing)$/);
      if (fontMatch) {
        const [, prop] = fontMatch;
        const configKey = TYPOGRAPHY_PROPERTY_MAPPING[
          prop as keyof typeof TYPOGRAPHY_PROPERTY_MAPPING
        ];

        if (configKey) {
          const defaultMode = result.modes[initialVariable.collection.defaultModeId];
          if (defaultMode && defaultMode.value !== undefined) {
            const value = `var(--${name.replace(/\//g, '-')})`;
            fontConfig[configKey] = value;
          }
        }
      }
    }

    return fontConfig;
  }
}