import { TVariable, TVariableCollection } from './type';
import * as changeCase from 'change-case';

export const ignoreGroup = [
  'colors/slate',
  'colors/gray',
  'colors/zinc',
  'colors/neutral',
  'colors/stone',
  'colors/red',
  'colors/orange',
  'colors/amber',
  'colors/yellow',
  'colors/lime',
  'colors/green',
  'colors/emerald',
  'colors/teal',
  'colors/cyan',
  'colors/sky',
  'colors/blue',
  'colors/indigo',
  'colors/violet',
  'colors/purple',
  'colors/fuchsia',
  'colors/pink',
  'colors/rose',
];

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
  "skew"
];

const nonUnits = [
  "aspectRatio",          // 比值
  "hueRotate",            // 角度单位（如 deg）
  "rotate",               // 角度单位（如 deg）
  "skew",                 // 角度单位（如 deg）
  "scale",                // 比例
  "opacity",              // 0 到 1 的比值
  "brightness",           // 0 到 1 的比值
  "contrast",             // 0 到 1 的比值
  "grayscale",            // 0 到 1 的比值
  "invert",               // 0 到 1 的比值
  "saturate",             // 0 到 1 的比值
  "sepia",                // 0 到 1 的比值
  "flexGrow",             // 整数
  "flexShrink",           // 整数
  "order",                // 整数
  "zIndex"                // 整数
];


const figmaNameToKebabCase = (name: string): string => {
  const nameArray = name.split('/');
  const kebabCaseArray = nameArray.map((item) => changeCase.kebabCase(item));
  return kebabCaseArray.join('/');
}

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
}

export function processColorValue(value: ColorValue): string {
  const r = Math.round(value.r * 255);
  const g = Math.round(value.g * 255);
  const b = Math.round(value.b * 255);

  if (isRGBA(value)) {
    return `${r} ${g} ${b} / ${value.a}`;
  }

  return `${r} ${g} ${b}`;
}

export function processConstantValue(
  value: SimpleValue | ColorValue,
  resolvedDataType: VariableResolvedDataType,
  scopes: VariableScope[],
  useRemUnit: boolean,
  variableCSSName: string
): string {
  if (isColorValue(value)) {
    return processColorValue(value);
  } else if (resolvedDataType === 'FLOAT') {
    const startWith = variableCSSName.split('-')[0];
    
    const isMustPx = variableCSSName.includes('-px');
    const isNotSupportRemUnit = notSupportRemUnit.some((item: VariableScope) => startWith.includes(item));
    const isNonUnit = nonUnits.some((item: VariableScope) => startWith.includes(item));

    if (['OPACITY', 'TEXT_CONTENT'].some((item: VariableScope) => scopes.includes(item))) {
      return `${value}`;
    } else if (!isMustPx && useRemUnit && !isNonUnit && !isNotSupportRemUnit) {
      return `${(value as number) / 16}rem`;
    } else if (!isNonUnit) {
      return `${value}px`;
    }
  } else {
    return `${value}`;
  }
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
    collection: TVariableCollection;
  };
};

export type Result = {
  initialVariable: {
    id: string;
    name: string;
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
function resolveVariableValue(variable: TVariable, context: ResolveContext): Result {
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
      name: figmaNameToKebabCase(variable.name),
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

      const resolvedReference = resolveVariableValue(referencedVariable, {
        variables,
        collections,
        visitedVariableIds: new Set(visitedVariableIds),
      });

      result.modes[mode.modeId] = {
        name: mode.name,
        value: {},
        variable: {
          id: referencedVariable.id,
          name: referencedVariable.name,
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
  ignoreGroup: string[]
): Result[] {
  const results: Result[] = [];
  const visitedVariableIds = new Set<string>();

  const filtered = output.filter((item) => {
    return (
      selectGroup.some((group) => item.name.startsWith(group + '/') || item.name === group) &&
      !ignoreGroup.some((group) => item.name.startsWith(group + '/'))
    );
  });

  for (const variable of filtered) {
    try {
      const result = resolveVariableValue(variable, {
        variables,
        collections,
        visitedVariableIds: new Set(visitedVariableIds),
      });
      results.push(result);
    } catch (error) {
      console.error(`解析变量 ${variable.name} 时出错:`, error);
    }
  }

  return results;
}

// 5. CSS 生成函数
function generateCSSForMultipleVariables(
  results: Result[],
  allCollections: TVariableCollection[],
  appendCollectionName: boolean = false,
  useRemUnit: boolean = false
): string {
  const css: string[] = [];
  const defaultValues: Map<string, string> = new Map();
  const modeOverrides: Map<string, Set<string>> = new Map();

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
      // 如果处理后为
      'collection'
    );
  }

  // 帮助函数：获取变量的 CSS 变量名
  function getVariableCSSName(
    variable: { name: string; collection: TVariableCollection },
    originalCollection: TVariableCollection
  ): string {
    const cssNameKebabCase = variable.name
      .split('/')
      .map((segment) => changeCase.kebabCase(segment))
      .join('-');
    if (variable.collection.id !== originalCollection.id && appendCollectionName) {
      const collectionName = sanitizeCollectionName(variable.collection.name);
      return `${cssNameKebabCase}-${collectionName}`;
    }

    return cssNameKebabCase;
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
    console.log(parentModes);
    console.log(variable.name);
    console.log(value);
    if (value === undefined || value === null) {
      console.warn(`处理变量 ${variable.name} 时遇到空值`);
      return;
    }

    const variableCSSName = getVariableCSSName(variable, originalCollection);
    console.log('--------------处理值---------------');
    console.log(variableCSSName);

    if (typeof value !== 'object' || isColorValue(value)) {
      const modeInfos = getModeNamesAndCollections(parentModes, allCollections).filter(
        (info) => info.collection.id === referencingCollection.id
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
          : ':root';

      const processedValue = processConstantValue(
        value as SimpleValue | ColorValue,
        resolvedDataType,
        scopes,
        useRemUnit,
        variableCSSName
      );
      const declaration = `  --${variableCSSName}: ${processedValue};`;

      if (selector === ':root') {
        defaultValues.set(variableCSSName, declaration);
      } else {
        if (!modeOverrides.has(selector)) {
          modeOverrides.set(selector, new Set());
        }
        modeOverrides.get(selector)!.add(declaration);
      }
    } else if (typeof value === 'object') {
      const entries = Object.entries(value);
      for (const [modeId, modeData] of entries) {
        if (!modeData) continue;

        const newParentModes = [...parentModes];
        if (modeId !== variableCollection.defaultModeId) {
          newParentModes.push(modeId);
        }

        if (modeData.variable) {
          const modeInfos = getModeNamesAndCollections(newParentModes, allCollections).filter(
            (info) => info.collection.id === referencingCollection.id
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
              : ':root';

          const referencedVarName = getVariableCSSName(modeData.variable, originalCollection);
          const varReference = `  --${variableCSSName}: var(--${referencedVarName});`;

          if (selector === ':root') {
            defaultValues.set(variableCSSName, varReference);
          } else {
            if (!modeOverrides.has(selector)) {
              modeOverrides.set(selector, new Set());
            }
            modeOverrides.get(selector)!.add(varReference);
          }

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
  }

  // 在 for 循环中修改处理每个结果逻辑
  for (const result of results) {
    const { initialVariable, modes } = result;

    // 处理默认模式
    const defaultMode = modes[initialVariable.collection.defaultModeId];
    if (defaultMode) {
      const variableCSSName = getVariableCSSName(initialVariable, initialVariable.collection);
      console.log('--------------处理默认模式---------------');
      console.log(variableCSSName);

      if (defaultMode.variable) {
        // 如果是引用其他变量
        const referencedVarName = getVariableCSSName(defaultMode.variable, initialVariable.collection);
        const rootReference = `  --${variableCSSName}: var(--${referencedVarName});`;
        defaultValues.set(variableCSSName, rootReference);

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
                variableCSSName
              )
            : defaultMode.value;
        const declaration = `  --${variableCSSName}: ${processedValue};`;
        defaultValues.set(variableCSSName, declaration);
      }
    }

    // 处理其他模式
    if (modes) {
      for (const [modeId, modeData] of Object.entries(modes)) {
        if (!modeData || modeId === initialVariable.collection.defaultModeId) continue;

        const parentModes = [modeId];
        const variableCSSName = getVariableCSSName(initialVariable, initialVariable.collection);

        console.log('--------------处理其他模式---------------');
        console.log(variableCSSName);

        if (modeData.variable) {
          // 如果是引用其他变量
          const referencedVarName = getVariableCSSName(modeData.variable, initialVariable.collection);
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
              : ':root';

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
                  variableCSSName
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
              : ':root';

          if (!modeOverrides.has(selector)) {
            modeOverrides.set(selector, new Set());
          }
          modeOverrides.get(selector)!.add(declaration);
        }
      }
    }
  }

  if (defaultValues.size > 0) {
    css.push('/* Default Mode */');
    css.push(':root {');
    css.push([...defaultValues.values()].join('\n'));
    css.push('}\n');
  }

  for (const [selector, declarations] of modeOverrides.entries()) {
    if (declarations.size > 0) {
      css.push(`/* Mode Override */`);
      if (selector.startsWith('@media')) {
        css.push(`${selector} {`);
        css.push('  :root {');
        css.push([...declarations].join('\n'));
        css.push('  }');
        css.push('}\n');
      } else {
        css.push(`${selector} {`);
        css.push([...declarations].join('\n'));
        css.push('}\n');
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
function generateTailwindConfig(results: Result[]): string {
  function parseVariablePath(name: string): string[] {
    const nameArr = name.split('/');
    return [
      changeCase.camelCase(nameArr[0]),
      ...nameArr.slice(1).map((segment) => {
        if (segment === 'DEFAULT') return 'DEFAULT';
        return changeCase.camelCase(segment);
      }),
    ];
  }

  function setNestedValue(obj: any, path: string[], value: string) {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    current[path[path.length - 1]] = value;
  }

  // 属性名映射和匹配帮助函数
  const propertyMap = {
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
    'hyphens': 'hyphens',
    'caption': 'caption',
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
  const propPattern = Object.keys(propertyMap)
    .map((key) => key.replace(/[-]/g, '\\-'))
    .join('|');

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

  // 处理需要合并的字体配置，并返回已使用的变量名集合
  function processMergedFontConfigs(results: Result[]): [Record<string, any>, Set<string>] {
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
      console.log(name)
      // 检查是否是标准的字体配置
      const fontMatch = name.match(new RegExp(`^font\\/([^/]+)\\/(${propPattern})$`));
      if (fontMatch) {
        const [, variant, rawProp] = fontMatch;
        const prop = Object.keys(propertyMap).includes(rawProp) ? propertyMap[rawProp] : rawProp;

        if (!fontConfigs[variant]) {
          fontConfigs[variant] = {};
        }

        const defaultMode = result.modes[initialVariable.collection.defaultModeId];
        if (defaultMode && defaultMode.value !== undefined) {
          const value = `var(--${name
            .split('/')
            .map((segment) => changeCase.kebabCase(segment))
            .join('-')})`;
          fontConfigs[variant][prop as keyof (typeof fontConfigs)[string]] = value;
          console.log(value)
          console.log(prop)
          console.log(fontConfigs[variant])
          if ( fontConfigs[variant].fontSize || prop === 'fontSize') {
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
          if (usedVar.startsWith(`font/${variant}/`)) {
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

      mergedFontSize[variant] = Object.keys(settings).length > 0 ? [ config.fontSize, settings] : config.fontSize;
    }

    return [mergedFontSize, usedVariables];
  }

  // 处理普通的字体属性
  function processFontProperties(results: Result[], usedVariables: Set<string>) {
    const configs: Record<string, Record<string, string>> = {};

    for (const result of results) {
      const { initialVariable } = result;
      const name = initialVariable.name;

      // 如果这个变量已经被用于合并格式，跳过它
      if (usedVariables.has(name)) {
        continue;
      }

      // 匹配 (font/)?property/xx 格式
      const pattern = `^(font\\/|)(${propPattern})\\/([^/]+)$`;
      const match = name.match(new RegExp(pattern));

      if (match) {
        const [, , rawProp, variant] = match;
        const configKey = propertyMap[rawProp];

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
  function processTopLevelFontConfigs(results: Result[]) {
    const fontConfig: Record<string, string> = {};

    for (const result of results) {
      const { initialVariable } = result;
      const name = initialVariable.name;

      // 匹配顶层字体变量
      const fontMatch = name.match(/^font\/(size|family|line-height|weight|letter-spacing)$/);
      if (fontMatch) {
        const [, prop] = fontMatch;
        const configKey = propertyMap[prop];

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
  const [mergedFontConfig, usedVariables] = processMergedFontConfigs(results);
  const fontProperties = processFontProperties(results, usedVariables);
  const topLevelFontConfig = processTopLevelFontConfigs(results);

  // 添加一个辅助函数来处理变量值
  function processVariableValue(variable: Result['initialVariable']): string {
    // 检查是否是颜色变量
    if (variable.resolvedDataType === 'COLOR') {
      return `rgba(var(--${variable.name
        .split('/')
        .map((segment) => changeCase.kebabCase(segment))
        .join('-')}))`;
    }
    // 其他类型的变量保持原样
    return `var(--${variable.name
      .split('/')
      .map((segment) => changeCase.kebabCase(segment))
      .join('-')})`;
  }

  // 处理所有变量
  for (const result of results) {
    const { initialVariable } = result;
    const name = initialVariable.name;
    const path = parseVariablePath(initialVariable.name);

    // 如果这个变量已经被用于合并配置，则跳过
    if (usedVariables.has(name)) {
      continue;
    }

    // 检查是否是标准字体配置模式
    const fontMatch = name.match(new RegExp(`^font\\/([^/]+)\\/(${propPattern})$`));
    if (fontMatch) {
      // 如果是标准字体配置，跳过
      continue;
    }

    // 检查是否是顶层字体属性 (font/size/xxx, font/line-height/xxx 等)
    const topLevelFontMatch = name.match(new RegExp(`^font\\/(${Object.keys(propertyMap).join('|')})\\/`));
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
  ignoreGroup: string[] = []
): Promise<{ css: string; tailwindConfig: string }> {
  try {
    const results = resolveVariables(output, variables, collections, selectGroup, ignoreGroup);
    console.log(results);
    const css = generateCSSForMultipleVariables(results, collections, appendCollectionName, useRemUnit);
    const tailwindConfig = generateTailwindConfig(results);
    return { css, tailwindConfig };
  } catch (error) {
    console.error('生成主题文件时出错:', error);
    throw error;
  }
}
