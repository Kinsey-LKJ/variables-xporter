import { type ClassValue, clsx } from 'clsx';
import { ColorValue, RGBObject, TVariable, TVariableCollection, ValueByMode } from './type';
import gh from 'parse-github-url';
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

export function rgbObjectToColorString(rgbObject) {
  const r = Math.round(rgbObject.r * 255);
  const g = Math.round(rgbObject.g * 255);
  const b = Math.round(rgbObject.b * 255);

  return `rgb(${r}, ${g}, ${b})`;
}

export function getVariableById(id: string, mode: string, variables: TVariable[]): TVariable | undefined {
  // console.log(id, mode, variables);
  const varObj = variables.find((variable) => variable.id === id);
  if (varObj) {
    return varObj;
  }
}

function resolveVariableValue(
  variables: TVariable[],
  id: string,
  modeId: string,
  visited: Set<string> = new Set()
): Exclude<VariableValue, VariableAlias> | TVariable | undefined {
  if (visited.has(id)) {
    console.warn(`检测到循环引用: ${id}`);
    return undefined;
  }

  const variable = variables.find((v) => v.id === id);
  if (!variable) {
    return undefined;
  }

  visited.add(id);
  const value = variable.valuesByMode[modeId];

  if (isVariableAlias(value)) {
    return resolveVariableValue(variables, value.id, modeId, visited);
  } else if (value === undefined) {
    // 当前变量存在，但是位于其他集合
    return variable;
  }

  return value;
}

export const resolveConstant = (
  value: Exclude<VariableValue, VariableAlias>,
  type: VariableResolvedDataType,
  useRemUnit: boolean,
  scope: VariableScope[]
) => {
  if (isColorVariable(value, type)) {
    const r = Math.round(value.r * 255);
    const g = Math.round(value.g * 255);
    const b = Math.round(value.b * 255);

    return `${r} ${g} ${b}`;
  } else if (type === 'FLOAT') {
    if (['OPACITY', 'TEXT_CONTENT'].some((item: VariableScope) => scope.includes(item))) {
      return `${value}`;
    } else if (useRemUnit) {
      return `${(value as number) / 16}rem`;
    } else {
      return `${value}px`;
    }
  } else {
    // console.log(value);
    return `${value}`;
  }
};

// 辅助函数: 获取CSS颜色值（可能是RGB颜色，也可能是另一CSS变量）
export function getCssValue(
  value: VariableValue,
  type: VariableResolvedDataType,
  scopes: VariableScope[],
  mode: string,
  variables: TVariable[],
  allVariables: TVariable[],
  useRemUnit: boolean,
  cssVariable: string,
  ignoreTailwindColor: boolean,
  collections: TVariableCollection[]
): string {
  if (isVariableAlias(value)) {
    const newVariable = getVariableById(value.id, mode, allVariables) as TVariable;
    // console.log(newVariable);
    if (!newVariable) {
      console.log(`找不到 ${cssVariable.replace('.', '/')} 所引用的变量`);
      return;
    }

    // 如果是颜色变量并且是 Tailwind CSS 颜色，则必须获取到最终的实际值
    // 从字符串中提取颜色前缀
    const prefixToCheck = newVariable.name.substring(0, newVariable.name.lastIndexOf('/'));
    // 判断前缀是否存在于数组中
    const belongsToArray = ignoreGroup.includes(prefixToCheck);

    if (belongsToArray && ignoreTailwindColor) {
      //获取对应变量的绝对值(递归直到获取到实际值为止)
      const resolvedValue = resolveVariableValue(allVariables, value.id, mode);
      // console.log(resolvedValue);
      if (resolvedValue) {
        if (isTVariable(resolvedValue)) {
          // 如果是变量对象，获取其值并解析
          // 在后面处理
        } else {
          // 如果是具体值，直接解析
          return resolveConstant(resolvedValue, type, useRemUnit, scopes);
        }
      } else {
        return undefined;
      }
    }

    if(newVariable.valuesByMode[mode] === undefined) {
      const valueInOtherCollection = getVariableValueInOtherCollection(newVariable, allVariables, collections);
      console.log(valueInOtherCollection);
    }

    let nameFormatted = newVariable.name.replace(/\//g, '-');
    if (nameFormatted.endsWith('-DEFAULT')) {
      nameFormatted = nameFormatted.slice(0, -8); // remove the "-DEFAULT" at the end
    }

    return `var(--${nameFormatted})`;
  } else {
    return resolveConstant(value, type, useRemUnit, scopes);
  }
}

interface VariableValueInOtherCollection {
  [modeName: string]: {
    [variableName: string]: string;
  };
}

type ResolvedValue = Exclude<VariableValue, VariableAlias> | {
  [modeKey: string]: {
    name: string;
    value: ResolvedValue;
  };
};

type ResultValue = {
  name: string;
  value: ResolvedValue | undefined;
  variable?: {
    id: string;
    name: string;
    collection: {
      id: string;
      name: string;
    };
  };
};

type Result = {
  variable: {
    id: string;
    name: string;
    collection: {
      id: string;
      name: string;
    };
  };
  modes: Record<string, ResultValue>;
};


// 此函数用于获取变量在其他集合中的值，并且会一直找到实际值为止
/**
 * 获取变量在其他集合中的最终值
 * @param variable 需要解析的变量
 * @param variables 所有变量列表
 * @param collections 所有集合列表
 * @param visitedVariableIds 用于检测循环引用的变量ID集合
 * @returns 返回一个对象，key 为 modeId，value 为对应的最终值
 */

function getVariableValueInOtherCollection(
  variable: TVariable,
  variables: TVariable[],
  collections: TVariableCollection[],
  visitedVariableIds: Set<string> = new Set()
): Result {
  if (visitedVariableIds.has(variable.id)) {
    throw new Error(`检测到循环引用: ${variable.id}`);
  }
  visitedVariableIds.add(variable.id);

  const collection = collections.find(c => c.id === variable.variableCollectionId);
  if (!collection) {
    return {
      variable: {
        id: variable.id,
        name: variable.name,
        collection: {
          id: variable.variableCollectionId,
          name: '未找到集合'
        }
      },
      modes: {}
    };
  }

  const modes: Record<string, ResultValue> = {};

  for (const mode of collection.modes) {
    const value = variable.valuesByMode[mode.modeId];

    if (isVariableAlias(value)) {
      const referencedVariable = variables.find(v => v.id === value.id);
      if (referencedVariable) {
        const referencedCollection = collections.find(
          c => c.id === referencedVariable.variableCollectionId
        );
        if (!referencedCollection) {
          modes[mode.modeId] = {
            name: mode.name,
            value: undefined,
            variable: {
              id: referencedVariable.id,
              name: referencedVariable.name,
              collection: {
                id: referencedVariable.variableCollectionId,
                name: '未找到集合'
              }
            }
          };
          continue;
        }

        const resolvedValues = getVariableValueInOtherCollection(
          referencedVariable,
          variables,
          collections,
          visitedVariableIds
        );

        const modeValues: Record<string, { name: string; value: ResolvedValue }> = {};
        for (const refMode of referencedCollection.modes) {
          const resolvedValue = resolvedValues.modes[refMode.modeId];
          if (resolvedValue?.value !== undefined) {
            modeValues[refMode.modeId] = {
              name: refMode.name,
              value: resolvedValue.value
            };
          }
        }

        modes[mode.modeId] = {
          name: mode.name,
          value: Object.keys(modeValues).length > 0 ? modeValues : undefined,
          variable: {
            id: referencedVariable.id,
            name: referencedVariable.name,
            collection: {
              id: referencedCollection.id,
              name: referencedCollection.name
            }
          }
        };
      } else {
        modes[mode.modeId] = {
          name: mode.name,
          value: undefined,
          variable: {
            id: value.id,
            name: '未找到变量',
            collection: {
              id: '',
              name: '未找到集合'
            }
          }
        };
      }
    } else {
      modes[mode.modeId] = {
        name: mode.name,
        value: value as Exclude<VariableValue, VariableAlias>
      };
    }
  }

  visitedVariableIds.delete(variable.id);
  
  return {
    variable: {
      id: variable.id,
      name: variable.name,
      collection: {
        id: collection.id,
        name: collection.name
      }
    },
    modes
  };
}

export function isVariableAlias(value: VariableValue): value is VariableAlias {
  if (typeof value === 'object') {
    return 'type' in value && value.type === 'VARIABLE_ALIAS';
  } else {
    return false;
  }
}

function isTVariable(value: TVariable | Exclude<VariableValue, VariableAlias>): value is TVariable {
  return (value as TVariable).id !== undefined;
}

export function isColorVariable(value: VariableValue, type: VariableResolvedDataType): value is ColorValue {
  return type === 'COLOR';
}

export function kebabToCamel(s: string): string {
  const result = s.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
  return result.charAt(0).toLowerCase() + result.slice(1);
}

export function camelToKebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export const Uint8ArrayToString = (fileData) => {
  var dataString = '';
  for (var i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }
  return dataString;
};

export const formattedSelections = (selections) => {
  const iconsPromise = selections.map(async (c) => {
    let svgCode = await c.exportAsync({ format: 'SVG' });
    svgCode = Uint8ArrayToString(svgCode);
    return { id: c.id, name: c.name, code: svgCode };
  });
  return Promise.all(iconsPromise);
};

export const validateGithubURL = (url) => {
  return gh(url);
};

export const versionValue = (versions) => {
  return versions
    .split('.')
    .map((n) => n - 0)
    .reduce((accumulator, currentValue, index) => {
      return accumulator + currentValue * Math.pow(100, 2 - index);
    }, 0);
};
