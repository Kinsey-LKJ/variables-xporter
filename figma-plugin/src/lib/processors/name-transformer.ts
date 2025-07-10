/**
 * 名称转换器
 * 负责变量名的格式转换和规范化
 */
import * as changeCase from 'change-case';
import { ExportFormat, TVariableCollection } from '../../types/app';
import { 
  getPropertyMapping, 
  getShadcnThemeVariables,
  TYPOGRAPHY_PROPERTY_MAPPING 
} from '../constants/export-config';

export class NameTransformer {
  /**
   * 将 Figma 变量名转换为 kebab-case 格式
   */
  static toKebabCase(name: string): string {
    const nameArray = name.split('/');
    const kebabCaseArray = nameArray.map((item) => changeCase.kebabCase(item));
    return kebabCaseArray.join('/');
  }

  /**
   * 根据 Tailwind CSS 规则修正变量名
   */
  static correctVariableName(name: string, format: ExportFormat): string {
    if (!name.includes('/')) {
      return name;
    }

    const firstPart = name.split('/')[0];
    const restParts = name.slice(name.indexOf('/'));
    const rules = getPropertyMapping(format);

    if (firstPart in rules) {
      const correctedName = `${rules[firstPart as keyof typeof rules]}${restParts}`;
      return this.handleFontSizeCorrection(correctedName, format);
    }

    return name;
  }

  /**
   * 处理字体大小的特殊命名规则
   */
  private static handleFontSizeCorrection(name: string, format: ExportFormat): string {
    const fontSizeProps = Object.entries(TYPOGRAPHY_PROPERTY_MAPPING)
      .filter(([_, value]) => value === 'fontSize')
      .map(([key]) => key);

    const fontSizePattern = fontSizeProps
      .map((prop) => prop.replace(/[-]/g, '\\-'))
      .join('|');

    const isV4 = format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)';
    const pattern = isV4 
      ? new RegExp(`^text\\/([^/]+)(?:\\/(?:${fontSizePattern})?)?$`)
      : new RegExp(`^font-size\\/([^/]+)(?:\\/(?:${fontSizePattern})?)?$`);

    const fontSizeMatch = name.match(pattern);
    if (fontSizeMatch) {
      return `${name.split('/').slice(0, 2).join('/')}/DEFAULT`;
    }

    return name;
  }

  /**
   * 处理 shadcn/ui 变量名映射
   */
  static processShadcnUiVariableName(
    name: string, 
    format: ExportFormat
  ): { name: string; isChange: boolean } {
    if (!this.isShadcnUiFormat(format)) {
      return { name, isChange: false };
    }

    const hasDefaultSuffix = name.endsWith('-default');
    const nameToCheck = hasDefaultSuffix ? name.slice(0, -8) : name;
    const themeList = getShadcnThemeVariables(format);

    for (const themePattern of themeList) {
      const match = themePattern.match(/^\[([^\]]+)\]-(.+)$/);
      if (match) {
        const [, type, variableName] = match;
        const fullVariableName = `${type}-${variableName}`;

        if (fullVariableName === nameToCheck || variableName === nameToCheck) {
          return {
            name: variableName + (hasDefaultSuffix ? '-default' : ''),
            isChange: true
          };
        }
      }
    }

    return { name, isChange: false };
  }

  /**
   * 获取变量的 CSS 名称
   */
  static getVariableCSSName(
    variable: { name: string; collection: TVariableCollection },
    originalCollection: TVariableCollection,
    shouldAppendCollectionName: boolean,
    format: ExportFormat
  ): string {
    const cssNameKebabCase = variable.name
      .split('/')
      .map((segment) => changeCase.kebabCase(segment))
      .join('-');

    // 移除 -default 后缀
    const cssNameWithoutDefault = cssNameKebabCase.endsWith('-default')
      ? cssNameKebabCase.slice(0, -8)
      : cssNameKebabCase;

    const { name: processedName } = this.processShadcnUiVariableName(
      cssNameWithoutDefault, 
      format
    );

    // 如果变量来自不同集合且需要添加集合名
    if (variable.collection.id !== originalCollection.id && shouldAppendCollectionName) {
      const collectionName = this.sanitizeCollectionName(variable.collection.name);
      return `${collectionName}-${processedName}`;
    }

    return processedName;
  }

  /**
   * 清理集合名称，使其成为合法的 CSS 标识符
   */
  static sanitizeCollectionName(name: string): string {
    return name
      .toLowerCase()
      .replace(/([A-Z])/g, '-$1')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/^[^a-z]+/, '') || 'collection';
  }

  /**
   * 检查是否为 shadcn/ui 格式
   */
  private static isShadcnUiFormat(format: ExportFormat): boolean {
    return format === 'shadcn/ui (Tailwind CSS V3)' || 
           format === 'shadcn/ui (Tailwind CSS V4)';
  }

  /**
   * 获取主题根选择器
   */
  static getThemeRootSelector(
    variable: { name: string; collection: TVariableCollection }, 
    format: ExportFormat
  ): string {
    if (format !== 'shadcn/ui (Tailwind CSS V4)' && format !== 'Tailwind CSS V4') {
      return ':root';
    }
    
    if (format === 'Tailwind CSS V4') {
      return '@theme';
    }

    const name = variable.name
      .split('/')
      .map((segment) => changeCase.kebabCase(segment))
      .join('-');
    
    const { isChange } = this.processShadcnUiVariableName(name, format);
    return isChange ? ':root' : '@theme';
  }
}