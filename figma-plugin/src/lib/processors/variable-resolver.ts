/**
 * 变量解析器
 * 负责解析 Figma 变量及其引用关系
 */
import { ExportFormat, TVariable, TVariableCollection } from '../../types/app';
import { 
  ResolvedVariable, 
  ResolveContext, 
  ResolvedValue,
  ProcessedVariable 
} from '../types/export';
import { NameTransformer } from './name-transformer';
import { MEDIA_QUERY_FEATURES } from '../constants/export-config';

export class VariableResolver {
  /**
   * 批量解析变量
   */
  static resolveVariables(
    output: TVariable[],
    variables: TVariable[],
    collections: TVariableCollection[],
    selectGroup: string[],
    ignoreGroup: string[],
    format: ExportFormat
  ): ResolvedVariable[] {
    const results: ResolvedVariable[] = [];
    const visitedVariableIds = new Set<string>();

    // 过滤需要处理的变量
    const filtered = output.filter((item) => {
      const correctedName = NameTransformer.correctVariableName(item.name, format);
      return (
        selectGroup.some((group) => 
          item.name.startsWith(group + '/') || item.name === group
        ) &&
        !ignoreGroup.some((group) => 
          correctedName.startsWith(group)
        )
      );
    });

    // 解析每个变量
    for (const variable of filtered) {
      try {
        const result = this.resolveVariableValue(
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

  /**
   * 解析单个变量值
   */
  private static resolveVariableValue(
    variable: TVariable,
    context: ResolveContext,
    format: ExportFormat
  ): ResolvedVariable {
    const { variables, collections, visitedVariableIds } = context;

    // 检测循环引用
    if (visitedVariableIds.has(variable.id)) {
      throw new Error(`检测到循环引用: ${variable.id}`);
    }
    visitedVariableIds.add(variable.id);

    // 找到变量所属的集合
    const collection = collections.find((c) => c.id === variable.variableCollectionId);
    if (!collection) {
      throw new Error(`找不到变量所属的集合: ${variable.variableCollectionId}`);
    }

    // 构建解析结果
    const result: ResolvedVariable = {
      initialVariable: {
        id: variable.id,
        name: NameTransformer.toKebabCase(
          NameTransformer.correctVariableName(variable.name, format)
        ),
        _name: NameTransformer.toKebabCase(variable.name),
        collection: collection,
        resolvedDataType: variable.resolvedType,
        scopes: variable.scopes,
      },
      modes: {},
    };

    // 处理每个模式
    for (const mode of collection.modes) {
      const value = variable.valuesByMode?.[mode.modeId];

      if (this.isVariableAlias(value)) {
        // 处理变量引用
        result.modes[mode.modeId] = this.resolveVariableReference(
          value,
          variables,
          collections,
          visitedVariableIds,
          mode,
          format
        );
      } else {
        // 处理直接值
        result.modes[mode.modeId] = {
          name: mode.name,
          value: value as ResolvedValue,
        };
      }
    }

    visitedVariableIds.delete(variable.id);
    return result;
  }

  /**
   * 解析变量引用
   */
  private static resolveVariableReference(
    alias: VariableAlias,
    variables: TVariable[],
    collections: TVariableCollection[],
    visitedVariableIds: Set<string>,
    mode: { modeId: string; name: string },
    format: ExportFormat
  ) {
    const referencedVariable = variables.find((v) => v.id === alias.id);
    if (!referencedVariable) {
      throw new Error(`找不到引用的变量: ${alias.id}`);
    }

    const resolvedReference = this.resolveVariableValue(
      referencedVariable,
      {
        variables,
        collections,
        visitedVariableIds: new Set(visitedVariableIds),
      },
      format
    );

    const processedVariable: ProcessedVariable = {
      id: referencedVariable.id,
      name: NameTransformer.toKebabCase(
        NameTransformer.correctVariableName(referencedVariable.name, format)
      ),
      _name: NameTransformer.toKebabCase(referencedVariable.name),
      collection: resolvedReference.initialVariable.collection,
    };

    const result = {
      name: mode.name,
      value: {} as ResolvedValue,
      variable: processedVariable,
    };

    // 构建引用的值结构
    const referencedCollection = collections.find(
      (c) => c.id === referencedVariable.variableCollectionId
    )!;

    for (const refMode of referencedCollection.modes) {
      const refModeValue = resolvedReference.modes[refMode.modeId];
      if (refModeValue) {
        (result.value as any)[refMode.modeId] = {
          name: refMode.name,
          value: refModeValue.value,
          variable: refModeValue.variable,
        };
      }
    }

    return result;
  }

  /**
   * 检查值是否为变量别名
   */
  private static isVariableAlias(value: VariableValue): value is VariableAlias {
    return typeof value === 'object' && value !== null && 'id' in value;
  }

  /**
   * 检查模式名是否为媒体查询
   */
  static isMediaQuery(modeName: string): boolean {
    return MEDIA_QUERY_FEATURES.some((feature) => 
      modeName.startsWith(`${feature}:`)
    );
  }

  /**
   * 获取模式名称和所属集合信息
   */
  static getModeNamesAndCollections(
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
}