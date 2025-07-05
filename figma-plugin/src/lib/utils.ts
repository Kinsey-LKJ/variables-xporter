import { ExportFormat, TVariable, TVariableCollection } from '../types/app';
import * as changeCase from 'change-case';
import { convert, OKLCH, sRGB, DisplayP3 } from '@texel/color';
import Color from 'colorjs.io';
import { optimizeCSSVariableReferences } from './optimize-css';

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

export function isRGB(value: ResolvedValue): value is RGB {
  return typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value && !('a' in value);
}

export function isRGBA(value: ResolvedValue): value is RGBA {
  return typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value && 'a' in value;
}

export function isColorValue(value: ResolvedValue): value is ColorValue {
  return isRGB(value) || isRGBA(value);
}

const notSupportRemUnit = [
  'screens',
  'scale',
  'backdrop-blur',
  'scale',
  'border-width',
  'text-decoration-thickness',
  'line-clamp',
  'outline-offset',
  'outline-width',
  'stroke-width',
  'z-index',
  'skew',
];

const nonUnits = [
  'aspect-ratio', // 比值
  'hue-rotate', // 角度单位（如 deg）
  'rotate', // 角度单位（如 deg）
  'skew', // 角度单位（如 deg）
  'scale', // 比例
  'opacity', // 0 到 1 的比值
  'brightness', // 0 到 1 的比值
  'contrast', // 0 到 1 的比值
  'grayscale', // 0 到 1 的比值
  'invert', // 0 到 1 的比值
  'saturate', // 0 到 1 的比值
  'sepia', // 0 到 1 的比值
  'flex-grow', // 整数
  'flex-shrink', // 整数
  'order', // 整数
  'z-index', // 整数
  'font-weight', // 整数
];

const tailiwndcssV3ShadcnUiThemeList = new Set([
  '[radius]-radius',
  '[colors]-background',
  '[colors]-foreground',
  '[colors]-card',
  '[colors]-card-foreground',
  '[colors]-popover',
  '[colors]-popover-foreground',
  '[colors]-primary',
  '[colors]-primary-foreground',
  '[colors]-secondary',
  '[colors]-secondary-foreground',
  '[colors]-muted',
  '[colors]-muted-foreground',
  '[colors]-accent',
  '[colors]-accent-foreground',
  '[colors]-destructive',
  '[colors]-border',
  '[colors]-input',
  '[colors]-ring',
  '[colors]-chart-1',
  '[colors]-chart-2',
  '[colors]-chart-3',
  '[colors]-chart-4',
  '[colors]-chart-5',
  '[colors]-sidebar',
  '[colors]-sidebar-foreground',
  '[colors]-sidebar-primary',
  '[colors]-sidebar-primary-foreground',
  '[colors]-sidebar-accent',
  '[colors]-sidebar-accent-foreground',
  '[colors]-sidebar-border',
  '[colors]-sidebar-ring',
]);

const tailiwndcssV4ShadcnUiThemeList = new Set([
  '[radius]-radius',
  '[color]-background',
  '[color]-foreground',
  '[color]-card',
  '[color]-card-foreground',
  '[color]-popover',
  '[color]-popover-foreground',
  '[color]-primary',
  '[color]-primary-foreground',
  '[color]-secondary',
  '[color]-secondary-foreground',
  '[color]-muted',
  '[color]-muted-foreground',
  '[color]-accent',
  '[color]-accent-foreground',
  '[color]-destructive',
  '[color]-border',
  '[color]-input',
  '[color]-ring',
  '[color]-chart-1',
  '[color]-chart-2',
  '[color]-chart-3',
  '[color]-chart-4',
  '[color]-chart-5',
  '[color]-sidebar',
  '[color]-sidebar-foreground',
  '[color]-sidebar-primary',
  '[color]-sidebar-primary-foreground',
  '[color]-sidebar-accent',
  '[color]-sidebar-accent-foreground',
  '[color]-sidebar-border',
  '[color]-sidebar-ring',
]);

const figmaNameToKebabCase = (name: string): string => {
  const nameArray = name.split('/');
  const kebabCaseArray = nameArray.map((item) => changeCase.kebabCase(item));
  return kebabCaseArray.join('/');
};

// 判断是否是媒体查询
const isMediaQuery = (modeName: string): boolean => {
  // 常见的媒体查询条件
  const mediaQueryFeatures = [
    'min-width',
    'max-width',
    'min-height',
    'max-height',
    'orientation',
    'aspect-ratio',
    'min-aspect-ratio',
    'max-aspect-ratio',
    'prefers-color-scheme',
    'prefers-reduced-motion',
    'display-mode',
  ];

  // 检查是否以任一媒体查询特性开头
  return mediaQueryFeatures.some((feature) => modeName.startsWith(`${feature}:`));
};

export function processColorValue(value: ColorValue, format: ExportFormat): string {
  const r = Math.round(value.r * 255);
  const g = Math.round(value.g * 255);
  const b = Math.round(value.b * 255);

  if (format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)') {
    const oklch = convert([value.r, value.g, value.b], sRGB, OKLCH, [0, 0, 0]);

    // 优化数字显示格式的辅助函数
    const formatNumber = (num: number, precision: number) => {
      // 如果数字为 0，直接返回 "0"
      if (num === 0) return '0';

      const fixed = Number(num.toFixed(precision));
      // 如果固定精度后的数字等于整数部分，返回整数
      if (fixed === Math.floor(fixed)) return fixed.toString();
      // 否则返回固定精度的数字
      return fixed.toString();
    };

    // 分别格式化三个值
    const l = formatNumber(oklch[0], 3); // lightness
    const c = formatNumber(oklch[1], 3); // chroma
    const h = formatNumber(oklch[2], 1); // hue

    return `oklch(${l} ${c} ${h})`;
  }

  return `${r} ${g} ${b}`;
}

export function processConstantValue(
  value: SimpleValue | ColorValue,
  resolvedDataType: VariableResolvedDataType,
  scopes: VariableScope[],
  useRemUnit: boolean,
  variableCSSName: string,
  variableName: string,
  format: ExportFormat,
  rootElementSize: number
): string {
  if (isColorValue(value)) {
    return processColorValue(value, format);
  } else if (resolvedDataType === 'FLOAT') {
    const nameArray = variableName.split('/');

    const isMustPx = variableCSSName.includes('-px');
    const isNotSupportRemUnit = notSupportRemUnit.some((item: VariableScope) => nameArray.includes(item));
    const isNonUnit = nonUnits.some((item: VariableScope) => nameArray.includes(item));

    if (['OPACITY', 'TEXT_CONTENT'].some((item: VariableScope) => scopes.includes(item))) {
      return `${value}`;
    } else if (!isMustPx && useRemUnit && !isNonUnit && !isNotSupportRemUnit) {
      return `${(value as number) / rootElementSize}rem`;
    } else if (!isNonUnit) {
      return `${value}px`;
    } else {
      return `${value}`;
    }
  } else {
    return `${value}`;
  }
}

const tailwindv3Rule = {
  color: 'colors',
  weight: 'font-weight',
  space: 'spacing',
  leading: 'line-height',
  tracking: 'letter-spacing',
  text: 'font-size',
  breakpoint: 'screens',
  radius: 'border-radius',
  shadow: 'box-shadow',
};

const tailwindv4Rule = {
  colors: 'color',
  'font-size': 'text',
  weight: 'font-weight',
  space: 'spacing',
  'line-height': 'leading',
  'letter-spacing': 'tracking',
  screens: 'breakpoint',
  'border-radius': 'radius',
  'box-shadow': 'shadow',
};

// 属性名映射和匹配帮助函数
const typographyPropertyMap = {
  size: 'fontSize',
  weight: 'fontWeight',
  lineHeight: 'lineHeight',
  fontWeight: 'fontWeight',
  letterSpacing: 'letterSpacing',
  family: 'fontFamily',
  style: 'fontStyle',
  fontStyle: 'fontStyle',
  'font-style': 'fontStyle',
  'line-height': 'lineHeight',
  'font-weight': 'fontWeight',
  'letter-spacing': 'letterSpacing',
  'font-size': 'fontSize',
  'font-family': 'fontFamily',
  'text-align': 'textAlign',
  'text-decoration': 'textDecoration',
  'text-transform': 'textTransform',
  'text-overflow': 'textOverflow',
  'text-indent': 'textIndent',
  'vertical-align': 'verticalAlign',
  'white-space': 'whiteSpace',
  'word-break': 'wordBreak',
  'word-spacing': 'wordSpacing',
  'word-wrap': 'wordWrap',
  'line-clamp': 'lineClamp',
  'list-style': 'listStyle',
  'list-style-type': 'listStyleType',
  'list-style-position': 'listStylePosition',
  'text-decoration-color': 'textDecorationColor',
  'text-decoration-style': 'textDecorationStyle',
  'text-decoration-thickness': 'textDecorationThickness',
  'text-underline-offset': 'textUnderlineOffset',
  'font-variant-numeric': 'fontVariantNumeric',
  'font-smoothing': 'fontSmoothing',
  hyphens: 'hyphens',
  caption: 'caption',
  fontSize: 'fontSize',
  fontFamily: 'fontFamily',
  textAlign: 'textAlign',
  textDecoration: 'textDecoration',
  textTransform: 'textTransform',
  textOverflow: 'textOverflow',
  textIndent: 'textIndent',
  verticalAlign: 'verticalAlign',
  whiteSpace: 'whiteSpace',
  wordBreak: 'wordBreak',
  wordSpacing: 'wordSpacing',
  wordWrap: 'wordWrap',
  lineClamp: 'lineClamp',
  listStyle: 'listStyle',
  listStyleType: 'listStyleType',
  listStylePosition: 'listStylePosition',
  textDecorationColor: 'textDecorationColor',
  textDecorationStyle: 'textDecorationStyle',
  textDecorationThickness: 'textDecorationThickness',
  textUnderlineOffset: 'textUnderlineOffset',
  fontVariantNumeric: 'fontVariantNumeric',
  fontSmoothing: 'fontSmoothing',
  'variant-numeric': 'fontVariantNumeric',
  'variant-smoothing': 'fontSmoothing',
};

// 创建属性名匹配模式
const tailwindV3TypographyPropPattern = Object.keys({ ...typographyPropertyMap, ...tailwindv3Rule })
  .map((key) => key.replace(/[-]/g, '\\-'))
  .join('|');

console.log('tailwindV3TypographyPropPattern', tailwindV3TypographyPropPattern);

const tailwindV4TypographyPropPattern = Object.keys({ ...typographyPropertyMap, ...tailwindv4Rule })
  .map((key) => key.replace(/[-]/g, '\\-'))
  .join('|');

console.log('tailwindV4TypographyPropPattern', tailwindV4TypographyPropPattern);

// 根据 Tailwind CSS 的命名规则，对变量名进行修正
const variableNameCorrection = (name: string, format: ExportFormat): string => {
  console.log(name);
  // 如果没有 / 符号，直接返回原名称
  if (!name.includes('/')) {
    return name;
  }

  // console.log('variableNameCorrectionName', name);

  // 获取第一个 / 之前的部分
  const firstPart = name.split('/')[0];
  const restParts = name.slice(name.indexOf('/'));

  // 根据 format 选择规则集
  const rules =
    format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)' ? tailwindv4Rule : tailwindv3Rule;

  // if (firstPart === 'font') {
  //   const fontVariableFirstPart = restParts.split('/')[1];
  //   const fontVariableRestParts = restParts.slice(restParts.indexOf('/', restParts.indexOf('/') + 1));
  //   console.log('fontVariableFirstPart', fontVariableFirstPart);
  //   console.log('fontVariableRestParts', fontVariableRestParts);
  //   if (fontVariableFirstPart in rules) {
  //     return `${rules[fontVariableFirstPart]}${fontVariableRestParts}`;
  //   }
  // } else {
  //   // 检查是否需要替换
  //   if (firstPart in rules) {
  //     return `${rules[firstPart]}${restParts}`;
  //   }
  // }

  console.log('firstPart,restParts', firstPart, restParts);

  if (firstPart in rules) {
    // 获取所有值为 'fontSize' 的键
    const fontSizeProps = Object.entries(typographyPropertyMap)
      .filter(([_, value]) => value === 'fontSize')
      .map(([key]) => key);

    // 构建正则表达式模式
    const fontSizePattern = fontSizeProps.map((prop) => prop.replace(/[-]/g, '\\-')).join('|');

    // 构建新的名称
    const name = `${rules[firstPart]}${restParts}`;

    // 匹配两种模式：
    // 1. text/sm 或 font-size/sm
    // 2. text/sm/font-size 或 font-size/sm/font-size
    const fontSizeMatch = name.match(
      format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)'
        ? new RegExp(`^text\\/([^/]+)(?:\\/(?:${fontSizePattern})?)?$`)
        : new RegExp(`^font-size\\/([^/]+)(?:\\/(?:${fontSizePattern})?)?$`)
    );

    if (fontSizeMatch) {
      // 无论是哪种情况，都返回 .../DEFAULT 格式
      return `${name.split('/').slice(0, 2).join('/')}/DEFAULT`;
    }

    return name;
  }

  return name;
};
// 处理需要合并的字体配置，并返回已使用的变量名集合
function processMergedFontConfigs(
  results: Result[],
  format: ExportFormat,
  ignoreTopLevelNames: boolean = true
): [Record<string, any>, Set<string>] {
  const fontConfigs: Record<
    string,
    {
      fontSize?: string;
      lineHeight?: string;
      fontWeight?: string;
      letterSpacing?: string;
    }
  > = {};

  const usedVariables = new Set<string>();

  // 首先处理标准的字体配置
  for (const result of results) {
    const { initialVariable } = result;
    const name = initialVariable.name;
    console.log(name);
    // 检查是否是标准的字体配置

    console.log('name', name);

    const fontMatch = name.match(
      format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)'
        ? new RegExp(`^text\\/([^/]+)\\/(${tailwindV4TypographyPropPattern}|[Dd][Ee][Ff][Aa][Uu][Ll][Tt])$`)
        : new RegExp(`^font-size\\/([^/]+)\\/(${tailwindV3TypographyPropPattern}|[Dd][Ee][Ff][Aa][Uu][Ll][Tt])$`)
    );
    if (fontMatch) {
      console.log('fontMatch', fontMatch);
      const [, variant, rawProp] = fontMatch;
      let prop = Object.keys(typographyPropertyMap).includes(rawProp) ? typographyPropertyMap[rawProp] : rawProp;
      if (prop === 'default') {
        prop = 'fontSize';
      }

      console.log('prop', prop);

      if (!fontConfigs[variant]) {
        fontConfigs[variant] = {};
      }

      const defaultMode = result.modes[initialVariable.collection.defaultModeId];
      if (defaultMode && defaultMode.value !== undefined) {
        let nameArray: string[];
        if (ignoreTopLevelNames) {
          nameArray = name.split('/').slice(1);
        } else {
          nameArray = name.split('/');
        }

        const value = `var(--${nameArray.map((segment) => changeCase.kebabCase(segment)).join('-')})`;
        fontConfigs[variant][prop as keyof (typeof fontConfigs)[string]] = value;
        console.log(value);
        console.log(prop);
        console.log('fontConfigs[variant]', fontConfigs[variant]);
        if (fontConfigs[variant].fontSize || prop === 'fontSize') {
          console.log('usedVariables.add(name)', name);
          usedVariables.add(name);
        }
      }
    }
  }

  // 移除不完整的配置（没有size的配置）
  for (const [variant, config] of Object.entries(fontConfigs)) {
    if (!config.fontSize) {
      delete fontConfigs[variant];
      // 移除这些变量的已使用标记
      for (const usedVar of usedVariables) {
        if (
          usedVar.startsWith(
            `${format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)' ? 'text' : 'font-size'}/${variant}/`
          )
        ) {
          usedVariables.delete(usedVar);
        }
      }
    }
  }

  // 生成合并的fontSize配置
  const mergedFontSize: Record<string, any> = {};
  for (const [variant, config] of Object.entries(fontConfigs)) {
    if (!config.fontSize) continue;

    const settings: Record<string, string> = {};
    if (config.lineHeight) settings.lineHeight = config.lineHeight;
    if (config.fontWeight) settings.fontWeight = config.fontWeight;
    if (config.letterSpacing) settings.letterSpacing = config.letterSpacing;

    mergedFontSize[variant] = Object.keys(settings).length > 0 ? [config.fontSize, settings] : config.fontSize;
  }

  console.log('mergedFontSize', mergedFontSize);
  console.log('fontConfigs', fontConfigs);

  return [mergedFontSize, usedVariables];
}

export type ResolvedValue =
  | SimpleValue
  | ColorValue
  | {
      [modeKey: string]: {
        name: string;
        value: ResolvedValue;
        variable?: {
          id: string;
          name: string;
          _name: string;
          collection: TVariableCollection;
        };
      };
    };

export type ResultValue = {
  name: string;
  value: ResolvedValue | undefined;
  variable?: {
    id: string;
    name: string;
    _name: string;
    collection: TVariableCollection;
  };
};

export type Result = {
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

// 2. 工具函数
export function isVariableAlias(value: VariableValue): value is VariableAlias {
  return typeof value === 'object' && value !== null && 'id' in value;
}

// 3. 变量解析函数
function resolveVariableValue(variable: TVariable, context: ResolveContext, format: ExportFormat): Result {
  const { variables, collections, visitedVariableIds } = context;

  if (visitedVariableIds.has(variable.id)) {
    throw new Error(`检测到循环引用: ${variable.id}`);
  }
  visitedVariableIds.add(variable.id);

  const collection = collections.find((c) => c.id === variable.variableCollectionId);
  if (!collection) {
    throw new Error(`找不到变量所属的集合: ${variable.variableCollectionId}`);
  }

  const result: Result = {
    initialVariable: {
      id: variable.id,
      name: figmaNameToKebabCase(variableNameCorrection(variable.name, format)),
      _name: figmaNameToKebabCase(variable.name),
      collection: collection,
      resolvedDataType: variable.resolvedType,
      scopes: variable.scopes,
    },
    modes: {},
  };

  for (const mode of collection.modes) {
    const value = variable.valuesByMode?.[mode.modeId];

    if (isVariableAlias(value)) {
      const referencedVariable = variables.find((v) => v.id === value.id);
      if (!referencedVariable) {
        throw new Error(`找不到引用的变量: ${value.id}`);
      }

      const resolvedReference = resolveVariableValue(
        referencedVariable,
        {
          variables,
          collections,
          visitedVariableIds: new Set(visitedVariableIds),
        },
        format
      );

      result.modes[mode.modeId] = {
        name: mode.name,
        value: {},
        variable: {
          id: referencedVariable.id,
          name: figmaNameToKebabCase(variableNameCorrection(referencedVariable.name, format)),
          // name: figmaNameToKebabCase(referencedVariable.name),
          _name: figmaNameToKebabCase(referencedVariable.name),
          collection: resolvedReference.initialVariable.collection,
        },
      };

      const referencedCollection = collections.find((c) => c.id === referencedVariable.variableCollectionId)!;

      for (const refMode of referencedCollection.modes) {
        const refModeValue = resolvedReference.modes[refMode.modeId];
        if (refModeValue) {
          (result.modes[mode.modeId].value as any)[refMode.modeId] = {
            name: refMode.name,
            value: refModeValue.value,
            variable: refModeValue.variable,
          };
        }
      }
    } else {
      result.modes[mode.modeId] = {
        name: mode.name,
        value: value as string,
      };
    }
  }

  visitedVariableIds.delete(variable.id);
  return result;
}

// 4. 批量处理函数
function resolveVariables(
  output: TVariable[],
  variables: TVariable[],
  collections: TVariableCollection[],
  selectGroup: string[],
  ignoreGroup: string[],
  format: ExportFormat
): Result[] {
  const results: Result[] = [];
  const visitedVariableIds = new Set<string>();

  console.log('ignoreGroup in resolveVariables', ignoreGroup);

  const filtered = output.filter((item) => {
    return (
      selectGroup.some((group) => item.name.startsWith(group + '/') || item.name === group) &&
      !ignoreGroup.some((group) => variableNameCorrection(item.name, format).startsWith(group))
    );
  });

  console.log('filtered', filtered);

  for (const variable of filtered) {
    try {
      const result = resolveVariableValue(
        variable,
        {
          variables,
          collections,
          visitedVariableIds: new Set(visitedVariableIds),
        },
        format
      );
      results.push(result);
    } catch (error) {
      console.error(`解析变量 ${variable.name} 时出错:`, error);
    }
  }

  return results;
}

// 添加排序辅助函数
function sortCSSDeclarationsByCollection(
  declarations: string[],
  currentCollectionId: string,
  variableMap: Map<string, { collectionId: string; collectionName: string }>,
  defaultCollectionId: string
): { groupedDeclarations: Map<string, string[]>; collectionOrder: string[] } {
  // 按集合分组
  const groupedDeclarations = new Map<string, string[]>();
  const collectionOrder: string[] = [];
  const unknownDeclarations: string[] = [];

  // 首先将声明按集合分组
  declarations.forEach((declaration) => {
    const varName = declaration.match(/--([^:]+):/)?.[1] || '';
    const varInfo = variableMap.get(varName);

    if (!varInfo) {
      // 如果找不到变量信息，将其归类到默认集合
      if (!groupedDeclarations.has(defaultCollectionId)) {
        groupedDeclarations.set(defaultCollectionId, []);
        if (!collectionOrder.includes(defaultCollectionId)) {
          collectionOrder.push(defaultCollectionId);
        }
      }
      groupedDeclarations.get(defaultCollectionId)!.push(declaration);
      return;
    }

    const { collectionId } = varInfo;
    if (!groupedDeclarations.has(collectionId)) {
      groupedDeclarations.set(collectionId, []);
      if (!collectionOrder.includes(collectionId)) {
        collectionOrder.push(collectionId);
      }
    }
    groupedDeclarations.get(collectionId)!.push(declaration);
  });

  // 对每个组内的声明进行排序，并在首字母变化时添加空行
  for (const [collectionId, group] of groupedDeclarations) {
    const sortedGroup: string[] = [];
    const sortedDeclarations = group.sort((a, b) => {
      const varNameA = a.match(/--([^:]+):/)?.[1] || '';
      const varNameB = b.match(/--([^:]+):/)?.[1] || '';
      return varNameA.localeCompare(varNameB);
    });

    let lastFirstLetter = '';
    sortedDeclarations.forEach((declaration, index) => {
      const varName = declaration.match(/--([^-]+)-/)?.[1] || '';
      const currentFirstLetter = varName.charAt(0);

      // 如果首字母变化了，并且不是第一个声明，添加空行
      if (currentFirstLetter !== lastFirstLetter && lastFirstLetter !== '') {
        sortedGroup.push('');
      }

      sortedGroup.push(declaration);
      lastFirstLetter = currentFirstLetter;
    });

    groupedDeclarations.set(collectionId, sortedGroup);
  }

  // 确保当前集合在最前面
  const currentCollectionIndex = collectionOrder.indexOf(currentCollectionId);
  if (currentCollectionIndex > -1) {
    collectionOrder.splice(currentCollectionIndex, 1);
    collectionOrder.unshift(currentCollectionId);
  }

  return { groupedDeclarations, collectionOrder };
}

function sortSelectors(selectors: string[]): string[] {
  return selectors.sort((a, b) => {
    // 媒体查询放在最后
    if (a.startsWith('@media') && !b.startsWith('@media')) return 1;
    if (!a.startsWith('@media') && b.startsWith('@media')) return -1;
    // 其他选择器按字母顺序排序
    return a.localeCompare(b);
  });
}

// 帮助函数：将集合名称转换为合法的 CSS 标识符
function sanitizeCollectionName(name: string): string {
  return (
    name
      // 转换为小写
      .toLowerCase()
      // 在大写字母前添加连字符（处理驼峰命名）
      .replace(/([A-Z])/g, '-$1')
      // 将空格和其他特殊字符替换为连字符
      .replace(/[^a-z0-9]+/g, '-')
      // 将连续的连字符替换为单个连字符
      .replace(/-+/g, '-')
      // 移除开头和结尾的连字符
      .replace(/^-+|-+$/g, '')
      // 确保以字母开头
      .replace(/^[^a-z]+/, '') ||
    // 如果处理后为空
    'collection'
  );
}

// 帮助函数：获取变量的 CSS Variables 名
function getVariableCSSName(
  variable: { name: string; collection: TVariableCollection },
  originalCollection: TVariableCollection,
  shouldAppendCollectionName: boolean,
  format: ExportFormat
): string {
  const cssNameKebabCase = variable.name
    .split('/')
    .map((segment) => changeCase.kebabCase(segment))
    .join('-');

  // 如果变量名以 -default 结尾,则删除它
  const cssNameWithoutDefault = cssNameKebabCase.endsWith('-default')
    ? cssNameKebabCase.slice(0, -8) // 删除 '-default' (8个字符)
    : cssNameKebabCase;

  const { name: cssNameProcessShadcnUiVariable } = processShadcnUiVariableName(cssNameWithoutDefault, format);
  if (variable.collection.id !== originalCollection.id && shouldAppendCollectionName) {
    const collectionName = sanitizeCollectionName(variable.collection.name);
    return `${collectionName}-${cssNameProcessShadcnUiVariable}`;
  }

  return cssNameProcessShadcnUiVariable;
}

// 帮助函数：获取 mode 的 name 和所属集合
function getModeNamesAndCollections(
  modes: string[],
  collections: TVariableCollection[]
): Array<{ name: string; collection: TVariableCollection }> {
  return modes.map((modeId) => {
    for (const collection of collections) {
      const mode = collection.modes.find((m) => m.modeId === modeId);
      if (mode) {
        return {
          name: mode.name.toLowerCase().replace(/\s+/g, '-'),
          collection,
        };
      }
    }
    return { name: modeId, collection: collections[0] };
  });
}

// 5. CSS 生成函数
function generateCSSForMultipleVariables(
  results: Result[],
  allCollections: TVariableCollection[],
  appendCollectionName: boolean = false,
  useRemUnit: boolean = false,
  format: ExportFormat,
  rootElementSize: number = 16,
  selectCollectionID: string
): string {
  const themeRootSelector =
    format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)' ? '@theme' : ':root';
  const css: string[] = [];
  const defaultValues: Map<string, string> = new Map();
  const defaultValuesChanged: Map<string, string> = new Map(); // 经过 shadcn/ui 处理的变量
  const modeOverrides: Map<string, Set<string>> = new Map();

  // 创建变量到集合的映射
  const variableCollectionMap = new Map<string, { collectionId: string; collectionName: string }>();

  // 在处理变量时，记录变量所属的集合信息
  const processedVarsMap = new Map<string, Set<string>>();

  function processValue(
    value: ResolvedValue | undefined,
    parentModes: string[] = [],
    variable: { name: string; collection: TVariableCollection },
    variableCollection: TVariableCollection,
    allCollections: TVariableCollection[],
    referencingCollection: TVariableCollection,
    originalCollection: TVariableCollection,
    resolvedDataType?: VariableResolvedDataType,
    scopes?: VariableScope[]
  ) {
    if (value === undefined || value === null) {
      console.warn(`处理变量 ${variable.name} 时遇到空值`);
      return;
    }

    let variableCSSName = getVariableCSSName(variable, originalCollection, appendCollectionName, format);
    if (
      tailwindcssv4NeedUpdateVariablesName[variableCSSName] &&
      (format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)')
    ) {
      variableCSSName = tailwindcssv4NeedUpdateVariablesName[variableCSSName];
    }

    // 记录变量所属的集合信息
    variableCollectionMap.set(variableCSSName, {
      collectionId: referencingCollection.id,
      collectionName: referencingCollection.name,
    });

    // 如果是简单值或颜色值
    if (typeof value !== 'object' || isColorValue(value)) {
      const modeInfos = getModeNamesAndCollections(parentModes, allCollections).filter(
        (info) => info.collection.id === referencingCollection.id
      );

      const selector =
        modeInfos.length > 0
          ? modeInfos.map((info) => {
              const modeName = info.name;
              if (isMediaQuery(modeName)) {
                return `@media (${modeName})`;
              }
              return `.${modeName}`;
            })[0]
          : getThemeRootSelector(variable, format);

      // 检查这个变量是否已经在这个选择器中处理过
      if (!processedVarsMap.has(selector)) {
        processedVarsMap.set(selector, new Set());
      }

      // 如果变量已在此选择器中处理过，跳过
      if (processedVarsMap.get(selector)!.has(variableCSSName)) {
        return;
      }

      // 标记为已处理
      processedVarsMap.get(selector)!.add(variableCSSName);

      const processedValue = processConstantValue(
        value as SimpleValue | ColorValue,
        resolvedDataType,
        scopes,
        useRemUnit,
        variableCSSName,
        variable.name,
        format,
        rootElementSize
      );

      const declaration = `  --${variableCSSName}: ${processedValue};`;

      // 如果是默认选择器，只在没有默认值时设置
      if (selector === getThemeRootSelector(variable, format)) {
        // 直接检查最终变量名是否是标准的 shadcn/ui 变量
        console.log(`🧪 [位置1] 判断 shadcn/ui 变量:`, { variableCSSName, format });
        const { isChange: isShadcnUiVariable } = processShadcnUiVariableName(variableCSSName, format);
        console.log(`🧪 [位置1] 判断结果:`, { variableCSSName, isShadcnUiVariable });
        
        if (isShadcnUiVariable) {
          // 经过 shadcn/ui 处理的变量放入 defaultValuesChanged
          if (!defaultValuesChanged.has(variableCSSName)) {
            defaultValuesChanged.set(variableCSSName, declaration);
          }
        } else {
          // 正常变量放入 defaultValues
          if (!defaultValues.has(variableCSSName)) {
            defaultValues.set(variableCSSName, declaration);
          }
        }
      } else {
        if (!modeOverrides.has(selector)) {
          modeOverrides.set(selector, new Set());
        }
        modeOverrides.get(selector)!.add(declaration);
      }
      return;
    }

    // 如果是对象（包含模式信息）
    const entries = Object.entries(value);
    for (const [modeId, modeData] of entries) {
      if (!modeData) continue;

      const newParentModes = [...parentModes];
      // 只有非默认模式才添加到父模式列表中
      if (modeId !== variableCollection.defaultModeId) {
        newParentModes.push(modeId);
      }

      // 如果是变量引用
      if (modeData.variable) {
        const modeInfos = getModeNamesAndCollections(newParentModes, allCollections).filter(
          (info) => info.collection.id === referencingCollection.id
        );

        const selector =
          modeInfos.length > 0
            ? modeInfos.map((info) => {
                const modeName = info.name;
                if (isMediaQuery(modeName)) {
                  return `@media (${modeName})`;
                }
                return `.${modeName}`;
              })[0]
            : getThemeRootSelector(variable, format);

        // 检查这个变量是否已经在这个选择器中处理过
        if (!processedVarsMap.has(selector)) {
          processedVarsMap.set(selector, new Set());
        }

        // 如果变量已在此选择器中处理过，跳过
        if (processedVarsMap.get(selector)!.has(variableCSSName)) {
          continue;
        }

        // 标记为已处理
        processedVarsMap.get(selector)!.add(variableCSSName);

        const referencedVarName = getVariableCSSName(
          modeData.variable,
          originalCollection,
          appendCollectionName,
          format
        );
        const varReference = `  --${variableCSSName}: var(--${referencedVarName});`;

        // 如果是默认选择器，只在没有默认值时设置
        if (selector === getThemeRootSelector(variable, format)) {
          // 直接检查最终变量名是否是标准的 shadcn/ui 变量
          console.log(`🧪 [位置2] 判断 shadcn/ui 变量:`, { variableCSSName, format });
          const { isChange: isShadcnUiVariable } = processShadcnUiVariableName(variableCSSName, format);
          console.log(`🧪 [位置2] 判断结果:`, { variableCSSName, isShadcnUiVariable });
          
          if (isShadcnUiVariable) {
            // 经过 shadcn/ui 处理的变量放入 defaultValuesChanged
            if (!defaultValuesChanged.has(variableCSSName)) {
              defaultValuesChanged.set(variableCSSName, varReference);
            }
          } else {
            // 正常变量放入 defaultValues
            if (!defaultValues.has(variableCSSName)) {
              defaultValues.set(variableCSSName, varReference);
            }
          }
        } else {
          if (!modeOverrides.has(selector)) {
            modeOverrides.set(selector, new Set());
          }
          modeOverrides.get(selector)!.add(varReference);
        }

        // 如果引用的变量有值，继续处理
        if (modeData.value !== undefined) {
          processValue(
            modeData.value,
            newParentModes,
            modeData.variable,
            modeData.variable.collection,
            allCollections,
            modeData.variable.collection,
            originalCollection,
            resolvedDataType,
            scopes
          );
        }
      } else if (modeData.value !== undefined) {
        // 如果是直接值，递归处理
        processValue(
          modeData.value,
          newParentModes,
          variable,
          variableCollection,
          allCollections,
          referencingCollection,
          originalCollection,
          resolvedDataType,
          scopes
        );
      }
    }
  }

  function processResult(
    result: Result,
    defaultValues: Map<string, string>,
    defaultValuesChanged: Map<string, string>,
    modeOverrides: Map<string, Set<string>>,
    allCollections: TVariableCollection[],
    themeRootSelector: string,
    useRemUnit: boolean,
    format: ExportFormat
  ) {
    const { initialVariable, modes } = result;

    // 处理默认模式
    const defaultMode = modes[initialVariable.collection.defaultModeId];
    if (defaultMode) {
      let variableCSSName = getVariableCSSName(
        initialVariable,
        initialVariable.collection,
        appendCollectionName,
        format
      );
      if (
        tailwindcssv4NeedUpdateVariablesName[variableCSSName] &&
        (format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)')
      ) {
        variableCSSName = tailwindcssv4NeedUpdateVariablesName[variableCSSName];
      }
      console.log('--------------处理默认模式---------------');
      // console.log('variableCSSName',variableCSSName);

      if (defaultMode.variable) {
        // 如果是引用其他变量
        const referencedVarName = getVariableCSSName(
          defaultMode.variable,
          initialVariable.collection,
          appendCollectionName,
          format
        );
        const rootReference = `  --${variableCSSName}: var(--${referencedVarName});`;
        
        // 直接检查最终变量名是否是标准的 shadcn/ui 变量
        console.log(`🧪 [位置3] 判断 shadcn/ui 变量:`, { variableCSSName, format });
        const { isChange: isShadcnUiVariable } = processShadcnUiVariableName(variableCSSName, format);
        console.log(`🧪 [位置3] 判断结果:`, { variableCSSName, isShadcnUiVariable });
        
        if (isShadcnUiVariable) {
          // 经过 shadcn/ui 处理的变量放入 defaultValuesChanged
          defaultValuesChanged.set(variableCSSName, rootReference);
        } else {
          // 正常变量放入 defaultValues
          defaultValues.set(variableCSSName, rootReference);
        }

        if (defaultMode.value !== undefined) {
          processValue(
            defaultMode.value,
            [],
            defaultMode.variable,
            defaultMode.variable.collection,
            allCollections,
            defaultMode.variable.collection,
            initialVariable.collection,
            initialVariable.resolvedDataType,
            initialVariable.scopes
          );
        }
      } else if (defaultMode.value !== undefined) {
        // 如果是直接值
        const processedValue =
          typeof defaultMode.value !== 'object' || isColorValue(defaultMode.value)
            ? processConstantValue(
                defaultMode.value as SimpleValue | ColorValue,
                initialVariable.resolvedDataType,
                initialVariable.scopes,
                useRemUnit,
                variableCSSName,
                initialVariable.name,
                format,
                rootElementSize
              )
            : defaultMode.value;
        const declaration = `  --${variableCSSName}: ${processedValue};`;
        
        // 直接检查最终变量名是否是标准的 shadcn/ui 变量
        console.log(`🧪 [位置4] 判断 shadcn/ui 变量:`, { variableCSSName, format });
        const { isChange: isShadcnUiVariable } = processShadcnUiVariableName(variableCSSName, format);
        console.log(`🧪 [位置4] 判断结果:`, { variableCSSName, isShadcnUiVariable });
        
        if (isShadcnUiVariable) {
          // 经过 shadcn/ui 处理的变量放入 defaultValuesChanged
          defaultValuesChanged.set(variableCSSName, declaration);
        } else {
          // 正常变量放入 defaultValues
          defaultValues.set(variableCSSName, declaration);
        }
      }
    }

    // 处理其他模式
    // 似乎是冗余代码
    if (modes) {
      for (const [modeId, modeData] of Object.entries(modes)) {
        if (!modeData || modeId === initialVariable.collection.defaultModeId) continue;
        console.log('modes', modes);
        const parentModes = [modeId];
        const variableCSSName = getVariableCSSName(
          initialVariable,
          initialVariable.collection,
          appendCollectionName,
          format
        );

        console.log('--------------处理其他模式---------------');
        console.log('variableCSSName', variableCSSName);

        if (modeData.variable) {
          // 如果是引用其他变量
          const referencedVarName = getVariableCSSName(
            modeData.variable,
            initialVariable.collection,
            appendCollectionName,
            format
          );
          const varReference = `  --${variableCSSName}: var(--${referencedVarName});`;

          const modeInfos = getModeNamesAndCollections(parentModes, allCollections).filter(
            (info) => info.collection.id === initialVariable.collection.id
          );

          // 处理选择器生成
          const selector =
            modeInfos.length > 0
              ? modeInfos.map((info) => {
                  const modeName = info.name;
                  if (isMediaQuery(modeName)) {
                    return `@media (${modeName})`;
                  }
                  return `.${modeName}`;
                })[0]
              : getThemeRootSelector(modeData.variable, format);

          if (!modeOverrides.has(selector)) {
            modeOverrides.set(selector, new Set());
          }
          modeOverrides.get(selector)!.add(varReference);

          if (modeData.value !== undefined) {
            processValue(
              modeData.value,
              parentModes,
              modeData.variable,
              modeData.variable.collection,
              allCollections,
              modeData.variable.collection,
              initialVariable.collection,
              initialVariable.resolvedDataType,
              initialVariable.scopes
            );
          }
        } else if (modeData.value !== undefined) {
          // 如果是直接值
          const processedValue =
            typeof modeData.value !== 'object' || isColorValue(modeData.value)
              ? processConstantValue(
                  modeData.value as SimpleValue | ColorValue,
                  initialVariable.resolvedDataType,
                  initialVariable.scopes,
                  useRemUnit,
                  variableCSSName,
                  initialVariable.name,
                  format,
                  rootElementSize
                )
              : modeData.value;
          const declaration = `  --${variableCSSName}: ${processedValue};`;

          const modeInfos = getModeNamesAndCollections(parentModes, allCollections).filter(
            (info) => info.collection.id === initialVariable.collection.id
          );

          // 处理选择器生成
          const selector =
            modeInfos.length > 0
              ? modeInfos.map((info) => {
                  const modeName = info.name;
                  if (isMediaQuery(modeName)) {
                    return `@media (${modeName})`;
                  }
                  return `.${modeName}`;
                })[0]
              : getThemeRootSelector(modeData.variable, format);

          if (!modeOverrides.has(selector)) {
            modeOverrides.set(selector, new Set());
          }
          modeOverrides.get(selector)!.add(declaration);
        }
      }
    }
  }

  console.log('modeOverrides', modeOverrides);

  const tailwindcssv4NeedUpdateVariablesName: { [key: string]: string } = {};

  if (format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)') {
    const [mergedFontConfig, usedVariables] = processMergedFontConfigs(results, format);
    console.log('mergedFontConfig', mergedFontConfig);

    for (const [variantName, config] of Object.entries(mergedFontConfig)) {
      console.log('Tailwind CSS V4 config', config);
      if (Array.isArray(config)) {
        const [fontSize, settings] = config as [string, Record<string, string>];
        console.log('Tailwind CSS V4 fontSize', fontSize);
        console.log('variantName', variantName);
        console.log('settings', settings);

        // // 提取原始值而不是变量名
        // const fontSizeValue = fontSize.match(/var\(--font-.*?-(size|fontSize)\)/i)
        //   ? fontSize
        //   : fontSize.replace('var(--font-', '').replace(')', '');
        // const fontSizeValue = fontSize;
        // defaultValues.set(`text-${variantName}`, `--text-${variantName}: ${fontSizeValue};`);

        if (settings) {
          for (const [prop, value] of Object.entries(settings)) {
            console.log('variantName,prop', variantName, prop);

            // 对于符合条件的其他字体变量，更改为 Tailwind CSS V4 指定的格式
            tailwindcssv4NeedUpdateVariablesName[`text-${variantName}-${changeCase.kebabCase(prop)}`] =
              `text-${variantName}--${changeCase.kebabCase(prop)}`;
            // 保持原始值
            // defaultValues.set(`text-${variantName}--${prop}`, `  --text-${variantName}--${prop}: ${value};`);
          }
        }
      } else {
        // 处理单独的 fontSize
        // const fontSizeValue = config.match(/var\(--font-.*?-(size|fontSize)\)/i)
        //   ? config
        //   : config.replace('var(--font-', '').replace(')', '');
        // const fontSizeValue = config;
        // defaultValues.set(`text-${variantName}`, `  --text-${variantName}: ${fontSizeValue};`);
      }
    }

    console.log('Tailwind CSS V4 defaultValues', defaultValues);

    // 处理每个结果
    for (const result of results) {
      const { initialVariable } = result;

      // 如果变量已经在字体配置中处理过，跳过它
      // if (usedVariables.has(initialVariable.name)) {
      //   continue;
      // }

      // 继续处理其他变量...
      processResult(result, defaultValues, defaultValuesChanged, modeOverrides, allCollections, themeRootSelector, useRemUnit, format);
    }
  } else {
    // 非 Tailwind CSS V4 格式，使用原有的处理逻辑
    for (const result of results) {
      processResult(result, defaultValues, defaultValuesChanged, modeOverrides, allCollections, themeRootSelector, useRemUnit, format);
    }
  }

  let defaultValuesCSSInOtherCollection = '';

  if (defaultValues.size > 0) {
    css.push('/* Default Mode */');
    css.push(themeRootSelector + ' {');

    const currentCollectionId = results[0].initialVariable.collection.id;

    //**
    // 对默认值进行分组排序
    // **
    const { groupedDeclarations, collectionOrder } = sortCSSDeclarationsByCollection(
      [...defaultValues.values()],
      currentCollectionId,
      variableCollectionMap,
      currentCollectionId
    );

    // 按集合顺序输出变量
    for (let i = 0; i < collectionOrder.length; i++) {
      const collectionId = collectionOrder[i];
      const collection = allCollections.find((c) => c.id === collectionId);
      const declarations = groupedDeclarations.get(collectionId);
      if (format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)') {
        if (declarations && declarations.length > 0) {
          if (collectionId === selectCollectionID) {
            css.push(`  /* Collection: ${collection?.name || 'Current Collection'} */`);
            css.push(declarations.join('\n'));
            // 如果不是最后一个集合，添加换行
            if (i < collectionOrder.length - 1) {
              css.push('');
            }
          } else {
            if (defaultValuesCSSInOtherCollection === '') {
              defaultValuesCSSInOtherCollection += ':root{';
              defaultValuesCSSInOtherCollection += '\n';
            } else {
              defaultValuesCSSInOtherCollection += '\n';
              defaultValuesCSSInOtherCollection += '\n';
            }
            defaultValuesCSSInOtherCollection += `  /* Collection: ${collection?.name || 'Current Collection'} */`;
            defaultValuesCSSInOtherCollection += '\n';
            defaultValuesCSSInOtherCollection += declarations.join('\n');
          }
        }
      } else {
        if (declarations && declarations.length > 0) {
          css.push(`  /* Collection: ${collection?.name || 'Current Collection'} */`);
          css.push(declarations.join('\n'));
          // 如果不是最后一个集合，添加换行
          if (i < collectionOrder.length - 1) {
            css.push('');
          }
        }
      }
    }

    css.push('}\n');
  }

  // 处理经过 shadcn/ui 处理的变量（单独放在 :root 中）
  if (defaultValuesChanged.size > 0) {
    css.push('/* shadcn/ui Variables */');
    css.push(':root {');

    const currentCollectionId = results[0].initialVariable.collection.id;

    // 对经过 shadcn/ui 处理的变量进行分组排序
    const { groupedDeclarations, collectionOrder } = sortCSSDeclarationsByCollection(
      [...defaultValuesChanged.values()],
      currentCollectionId,
      variableCollectionMap,
      currentCollectionId
    );

    // 按集合顺序输出变量
    for (let i = 0; i < collectionOrder.length; i++) {
      const collectionId = collectionOrder[i];
      const collection = allCollections.find((c) => c.id === collectionId);
      const declarations = groupedDeclarations.get(collectionId);
      if (declarations && declarations.length > 0) {
        css.push(`  /* Collection: ${collection?.name || 'Current Collection'} */`);
        css.push(declarations.join('\n'));
        // 如果不是最后一个集合，添加换行
        if (i < collectionOrder.length - 1) {
          css.push('');
        }
      }
    }

    css.push('}\n');
  }

  if (defaultValuesCSSInOtherCollection) {
    defaultValuesCSSInOtherCollection += '\n';
    defaultValuesCSSInOtherCollection += '} \n';
    css.push(defaultValuesCSSInOtherCollection);
  }

  // 对选择器进行排序
  const sortedSelectors = sortSelectors([...modeOverrides.keys()]);
  console.log('sortedSelectors', sortedSelectors);
  const currentCollectionId = results[0].initialVariable.collection.id;

  for (const selector of sortedSelectors) {
    const declarations = modeOverrides.get(selector);
    console.log('declarations', declarations);
    if (declarations?.size > 0) {
      css.push(`/* Mode Override */`);
      if ((format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)') && selector.startsWith('@media')) {
        css.push(`${selector} {`);
      }
      if (selector.startsWith('@media')) {
        if (format !== 'Tailwind CSS V4' && format !== 'shadcn/ui (Tailwind CSS V4)') {
          css.push(`${selector} {`);
        }
        css.push(
          format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)'
            ? ':root {'
            : themeRootSelector + ' {'
        );

        // 对模式覆盖的值进行分组排序
        const { groupedDeclarations, collectionOrder } = sortCSSDeclarationsByCollection(
          [...declarations],
          currentCollectionId,
          variableCollectionMap,
          currentCollectionId
        );

        // 按集合顺序输出变量
        for (let i = 0; i < collectionOrder.length; i++) {
          const collectionId = collectionOrder[i];
          const collection = allCollections.find((c) => c.id === collectionId);
          const modeDeclarations = groupedDeclarations.get(collectionId);
          if (modeDeclarations && modeDeclarations.length > 0) {
            css.push(`  /* Collection: ${collection?.name || 'Current Collection'} */`);
            css.push(modeDeclarations.join('\n'));
            // 如果不是最后一个集合，添加换行
            if (i < collectionOrder.length - 1) {
              css.push('');
            }
          }
        }

        css.push('  }');
        if (format !== 'Tailwind CSS V4' && format !== 'shadcn/ui (Tailwind CSS V4)') {
          css.push('}\n');
        }
      } else {
        css.push(`${selector} {`);

        // 对模式覆盖的值进行分组排序
        const { groupedDeclarations, collectionOrder } = sortCSSDeclarationsByCollection(
          [...declarations],
          currentCollectionId,
          variableCollectionMap,
          currentCollectionId
        );

        // 按集合顺序输出变量
        for (let i = 0; i < collectionOrder.length; i++) {
          const collectionId = collectionOrder[i];
          const collection = allCollections.find((c) => c.id === collectionId);
          const modeDeclarations = groupedDeclarations.get(collectionId);
          console.log('modeDeclarations', modeDeclarations);
          if (modeDeclarations && modeDeclarations.length > 0) {
            css.push(`  /* Collection: ${collection?.name || 'Current Collection'} */`);
            css.push(modeDeclarations.join('\n'));
            // 如果不是最后一个集合，添加换行
            if (i < collectionOrder.length - 1) {
              css.push('');
            }
          }
        }

        css.push('}\n');
      }

      if ((format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)') && selector.startsWith('@media')) {
        css.push('}\n');
        // css.push('}\n');
      }
    }
  }

  return css.join('\n');
}

// 添加新的类型定义
type TailwindColorConfig = {
  [key: string]: string | TailwindColorConfig;
};

// 添加新的函数用于生成 Tailwind 配置
function generateTailwindConfig(results: Result[], format: ExportFormat, ignoreTopLevelNames: boolean = false): string {
  function parseVariablePath(name: string): string[] {
    const nameArr = name.split('/');
    return [
      changeCase.camelCase(nameArr[0]),
      ...nameArr.slice(1).map((segment) => {
        if (segment === 'DEFAULT') return 'DEFAULT';
        return changeCase.kebabCase(segment);
      }),
    ];
  }

  function setNestedValue(obj: any, path: string[], cssValue: string) {
    console.log('setNestedValue', obj, path, cssValue);
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      console.log('path[i]', path[i]);
      console.log('current', current);
      console.log('current[key]', current[path[i]]);
      const key = path[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    if (path[path.length - 1] === 'default') {
      current['DEFAULT'] = cssValue.replace('-default', '');
    } else {
      current[path[path.length - 1]] = cssValue;
    }
  }

  // 属性名标准化函数
  function normalizeProperty(prop: string): string {
    switch (prop) {
      case 'line-height':
        return 'lineHeight';
      case 'font-weight':
        return 'fontWeight';
      case 'letter-spacing':
        return 'letterSpacing';
      default:
        return prop;
    }
  }

  // 处理普通的字体属性
  function processFontProperties(results: Result[], usedVariables: Set<string>, format: ExportFormat) {
    const configs: Record<string, Record<string, string>> = {};

    for (const result of results) {
      const { initialVariable } = result;
      const name = initialVariable.name;

      // 如果这个变量已经被用于合并格式，跳过它
      if (usedVariables.has(name)) {
        continue;
      }

      // 匹配 (font/)?property/xx 格式
      const pattern = `^(font\\/|)(${format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)' ? tailwindV4TypographyPropPattern : tailwindV3TypographyPropPattern})\\/([^/]+)$`;
      const match = name.match(new RegExp(pattern));

      if (match) {
        const [, , rawProp, variant] = match;
        const configKey = typographyPropertyMap[rawProp];

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

  // 处理顶层字体配置
  function processTopLevelFontConfigs(results: Result[], format: ExportFormat) {
    const fontConfig: Record<string, string> = {};

    for (const result of results) {
      const { initialVariable } = result;
      const name = initialVariable.name;

      // 匹配顶层字体变量
      const fontMatch = name.match(/^font\/(size|family|line-height|weight|letter-spacing)$/);
      if (fontMatch) {
        const [, prop] = fontMatch;
        const configKey = typographyPropertyMap[prop];

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

  const config: Record<string, any> = {};
  const [mergedFontConfig, usedVariables] = processMergedFontConfigs(results, format);
  console.log('mergedFontConfig', mergedFontConfig);
  console.log('usedVariables', usedVariables);
  const fontProperties = processFontProperties(results, usedVariables, format);
  const topLevelFontConfig = processTopLevelFontConfigs(results, format);

  // 添加一个辅助函数来处理变量值
  function processVariableValue(variable: Result['initialVariable']): string {
    let name: string[];
    if (ignoreTopLevelNames) {
      name = variable.name.split('/').slice(1);
    } else {
      name = variable.name.split('/');
    }

    const nameProcess = name.map((segment) => changeCase.kebabCase(segment)).join('-');
    const { name: nameProcessShadcnUi } = processShadcnUiVariableName(nameProcess, format);

    console.log('_____________________');
    console.log(name, nameProcess, nameProcessShadcnUi);
    console.log('_____________________');

    // 检查是否是颜色变量
    if (variable.resolvedDataType === 'COLOR') {
      return `rgb(var(--${nameProcessShadcnUi}))`;
    }
    // 其他类型的变量保持原样
    return `var(--${nameProcessShadcnUi})`;
  }

  // 处理所有变量
  for (const result of results) {
    const { initialVariable } = result;
    const name = initialVariable.name;
    const path = parseVariablePath(initialVariable.name);
    console.log(name);

    // 如果这个变量已经被用于合并配置，则跳过
    if (usedVariables.has(name)) {
      console.log('usedVariables.has(name)', name);
      continue;
    }

    // 检查是否是标准字体配置模式
    const fontMatch = name.match(
      new RegExp(
        `^font\\/([^/]+)\\/(${format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)' ? tailwindV4TypographyPropPattern : tailwindV3TypographyPropPattern})$`
      )
    );
    if (fontMatch) {
      // 如果是标准字体配置，跳过
      continue;
    }

    // 检查是否是顶层字体属性 (font/size/xxx, font/line-height/xxx 等)
    const topLevelFontMatch = name.match(new RegExp(`^font\\/(${Object.keys(typographyPropertyMap).join('|')})\\/`));
    if (topLevelFontMatch) {
      // 如果是顶层字体属性，跳过（这些会被处理到对应的顶层配中）
      continue;
    }

    // 确保顶层配置项存在
    const topLevel = path[0];
    if (!config[topLevel]) {
      config[topLevel] = {};
    }

    // 处理所有其他变量
    setNestedValue(config[topLevel], path.slice(1), processVariableValue(initialVariable));
  }

  // 合并字体配置
  if (Object.keys(mergedFontConfig).length > 0) {
    if (!config.fontSize) {
      config.fontSize = {};
    }
    Object.assign(config.fontSize, mergedFontConfig);
  }

  // 合并其他字体属性配置
  Object.entries(fontProperties).forEach(([key, value]) => {
    if (Object.keys(value).length > 0) {
      if (key === 'fontSize' && config.fontSize) {
        // 如果已经有合并的 fontSize 配置，只添加未被使用的变量
        config.fontSize = { ...value, ...config.fontSize };
      } else {
        config[key] = value;
      }
    }
  });

  // 合并顶层字体配置
  Object.assign(config, topLevelFontConfig);

  // 如果没有任何字体配置，则删除 font: {}
  if (config.font && Object.keys(config.font).length === 0) {
    delete config.font;
  }

  console.log(config);

  // 生成配置文件内容
  const configContent = `module.exports = {
    theme: {
      extend: {
        ${Object.entries(config)
          .map(([key, value]) => `${key}: ${JSON.stringify(value, null, 6)}`)
          .join(',\n')}
      },
    },
  };`;

  return configContent.replace(/"/g, "'").replace(/\n\s*\n/g, '\n');
}

// 6. 主函数

export async function generateThemeFiles(
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
): Promise<{ css: string; tailwindConfig: string }> {
  console.log('ignoreGroup', ignoreGroup);
  try {
    console.log('ignoreGroup', ignoreGroup);
    const results = resolveVariables(output, variables, collections, selectGroup, ignoreGroup, exportFormat);
    console.log('results', results);
    let css = generateCSSForMultipleVariables(
      results,
      collections,
      appendCollectionName,
      useRemUnit,
      exportFormat,
      rootElementSize,
      selectCollectionID
    );
    // 应用 CSS Variables引用优化
    // css = optimizeCSSVariableReferences(css);

    const tailwindConfig = generateTailwindConfig(results, exportFormat);
    return { css, tailwindConfig };
  } catch (error) {
    console.error('生成主题文件时出错:', error);
    throw error;
  }
}

const processShadcnUiVariableName = (name: string, format: ExportFormat): { name: string; isChange: boolean } => {
  let isChange = false;
  if (format !== 'shadcn/ui (Tailwind CSS V3)' && format !== 'shadcn/ui (Tailwind CSS V4)')
    return { name: name, isChange: false };

  // 检查是否以 -default 结尾
  const hasDefaultSuffix = name.endsWith('-default');
  const nameToCheck = hasDefaultSuffix ? name.slice(0, -8) : name;
  
  console.log(`🔍 processShadcnUiVariableName 调试:`, {
    原始name: name,
    nameToCheck: nameToCheck,
    format: format,
    hasDefaultSuffix: hasDefaultSuffix
  });
  
  const themeList = format === 'shadcn/ui (Tailwind CSS V3)' 
    ? tailiwndcssV3ShadcnUiThemeList 
    : tailiwndcssV4ShadcnUiThemeList;

  console.log(`📋 主题列表:`, Array.from(themeList));

  // 遍历主题列表，查找匹配的模式
  for (const themePattern of themeList) {
    // 解析方括号格式：[type]-variableName
    const match = themePattern.match(/^\[([^\]]+)\]-(.+)$/);
    if (match) {
      const [, type, variableName] = match;
      
      // 构建完整的变量名进行匹配
      const fullVariableName = `${type}-${variableName}`;
      
      console.log(`🔍 检查模式:`, {
        themePattern: themePattern,
        type: type,
        variableName: variableName,
        fullVariableName: fullVariableName,
        nameToCheck: nameToCheck,
        完整匹配: fullVariableName === nameToCheck,
        变量名匹配: variableName === nameToCheck
      });
      
      // 检查是否匹配（支持两种方式：完整匹配或变量名匹配）
      if (fullVariableName === nameToCheck || variableName === nameToCheck) {
        console.log(`✅ shadcn/ui ${format} 匹配:`, `${nameToCheck} → ${themePattern}`);
        isChange = true;
        // 返回去掉类型前缀的变量名
        return { 
          name: variableName + (hasDefaultSuffix ? '-default' : ''), 
          isChange: isChange 
        };
      }
    }
  }

  console.log(`❌ 无匹配:`, nameToCheck);
  return { name: name, isChange: isChange };
};

const getThemeRootSelector = (variable: { name: string; collection: TVariableCollection }, format: ExportFormat): string => {
  if (format !== 'shadcn/ui (Tailwind CSS V4)' && format !== 'Tailwind CSS V4') return ':root';
  if (format === 'Tailwind CSS V4') return '@theme';
  const name = variable.name
    .split('/')
    .map((segment) => changeCase.kebabCase(segment))
    .join('-');
  const { isChange } = processShadcnUiVariableName(name, format);

  return isChange ? ':root' : '@theme';
};
