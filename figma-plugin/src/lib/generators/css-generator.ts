/**
 * CSS 生成器
 * 负责生成最终的 CSS 输出
 */
import { ExportFormat, TVariableCollection } from '../../types/app';
import { ResolvedVariable, CSSOutput, ResolvedValue, SimpleValue, ColorValue } from '../types/export';
import { ColorProcessor } from '../processors/color-processor';
import { UnitConverter } from '../processors/unit-converter';
import { NameTransformer } from '../processors/name-transformer';
import { VariableResolver } from '../processors/variable-resolver';
import { FontProcessor } from '../processors/font-processor';
import { getThemeRootSelector } from '../constants/export-config';

export class CSSGenerator {
  /**
   * 生成多变量的 CSS
   */
  static generateCSS(
    results: ResolvedVariable[],
    allCollections: TVariableCollection[],
    appendCollectionName: boolean,
    useRemUnit: boolean,
    format: ExportFormat,
    rootElementSize: number,
    selectCollectionID: string
  ): string {
    const cssOutput = this.processCSSVariables(
      results,
      allCollections,
      appendCollectionName,
      useRemUnit,
      format,
      rootElementSize
    );

    return this.generateCSSString(
      cssOutput,
      allCollections,
      format,
      selectCollectionID,
      results[0]?.initialVariable.collection.id
    );
  }

  /**
   * 处理 CSS 变量
   */
  private static processCSSVariables(
    results: ResolvedVariable[],
    allCollections: TVariableCollection[],
    appendCollectionName: boolean,
    useRemUnit: boolean,
    format: ExportFormat,
    rootElementSize: number
  ): CSSOutput {
    const cssOutput: CSSOutput = {
      defaultRules: new Map(),
      defaultShadcnRules: new Map(),
      modeRules: new Map(),
    };

    const processedVarsMap = new Map<string, Set<string>>();
    const variableCollectionMap = new Map<string, { collectionId: string; collectionName: string }>();

    // 处理 Tailwind CSS V4 字体配置，获取变量名映射表
    const tailwindcssv4NeedUpdateVariablesName = this.processTailwindV4FontConfig(results, format, cssOutput);

    for (const result of results) {
      this.processResult(
        result,
        cssOutput,
        allCollections,
        appendCollectionName,
        useRemUnit,
        format,
        rootElementSize,
        processedVarsMap,
        variableCollectionMap,
        tailwindcssv4NeedUpdateVariablesName
      );
    }

    return cssOutput;
  }

  /**
   * 处理单个变量结果
   */
  private static processResult(
    result: ResolvedVariable,
    cssOutput: CSSOutput,
    allCollections: TVariableCollection[],
    appendCollectionName: boolean,
    useRemUnit: boolean,
    format: ExportFormat,
    rootElementSize: number,
    processedVarsMap: Map<string, Set<string>>,
    variableCollectionMap: Map<string, { collectionId: string; collectionName: string }>,
    tailwindcssv4NeedUpdateVariablesName: Map<string, string>
  ): void {
    const { initialVariable, modes } = result;

    // 处理默认模式
    const defaultMode = modes[initialVariable.collection.defaultModeId];
    if (defaultMode) {
      this.processDefaultMode(
        initialVariable,
        defaultMode,
        cssOutput,
        appendCollectionName,
        useRemUnit,
        format,
        rootElementSize,
        variableCollectionMap,
        tailwindcssv4NeedUpdateVariablesName
      );

      // 如果默认模式有变量引用且包含复杂值，需要递归处理
      if (defaultMode.variable && defaultMode.value !== undefined) {
        this.processComplexValue(
          defaultMode.value,
          [],
          defaultMode.variable,
          defaultMode.variable.collection,
          allCollections,
          defaultMode.variable.collection,
          initialVariable.collection,
          initialVariable.resolvedDataType,
          initialVariable.scopes,
          cssOutput,
          appendCollectionName,
          useRemUnit,
          format,
          rootElementSize,
          processedVarsMap,
          variableCollectionMap,
          tailwindcssv4NeedUpdateVariablesName
        );
      }
    }

    // 处理其他模式
    for (const [modeId, modeData] of Object.entries(modes)) {
      if (!modeData || modeId === initialVariable.collection.defaultModeId) continue;

      this.processNonDefaultMode(
        initialVariable,
        modeData,
        [modeId],
        cssOutput,
        allCollections,
        appendCollectionName,
        useRemUnit,
        format,
        rootElementSize,
        processedVarsMap,
        tailwindcssv4NeedUpdateVariablesName
      );

      // 如果模式数据有变量引用且包含复杂值，需要递归处理
      if (modeData.variable && modeData.value !== undefined) {
        this.processComplexValue(
          modeData.value,
          [modeId],
          modeData.variable,
          modeData.variable.collection,
          allCollections,
          modeData.variable.collection,
          initialVariable.collection,
          initialVariable.resolvedDataType,
          initialVariable.scopes,
          cssOutput,
          appendCollectionName,
          useRemUnit,
          format,
          rootElementSize,
          processedVarsMap,
          variableCollectionMap,
          tailwindcssv4NeedUpdateVariablesName
        );
      }
    }
  }

  /**
   * 处理默认模式
   */
  private static processDefaultMode(
    variable: ResolvedVariable['initialVariable'],
    defaultMode: any,
    cssOutput: CSSOutput,
    appendCollectionName: boolean,
    useRemUnit: boolean,
    format: ExportFormat,
    rootElementSize: number,
    variableCollectionMap: Map<string, { collectionId: string; collectionName: string }>,
    tailwindcssv4NeedUpdateVariablesName: Map<string, string>
  ): void {
    let variableCSSName = NameTransformer.getVariableCSSName(
      variable,
      variable.collection,
      appendCollectionName,
      format
    );

    // 应用 Tailwind CSS V4 字体变量名映射
    if (tailwindcssv4NeedUpdateVariablesName.has(variableCSSName) && 
        (format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)')) {
      variableCSSName = tailwindcssv4NeedUpdateVariablesName.get(variableCSSName)!;
    }

    // 记录变量所属的集合信息
    variableCollectionMap.set(variableCSSName, {
      collectionId: variable.collection.id,
      collectionName: variable.collection.name,
    });

    if (defaultMode.variable) {
      // 处理变量引用
      let referencedVarName = NameTransformer.getVariableCSSName(
        defaultMode.variable,
        variable.collection,
        appendCollectionName,
        format
      );
      
      // 对引用的变量名也应用映射
      if (tailwindcssv4NeedUpdateVariablesName.has(referencedVarName) && 
          (format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)')) {
        referencedVarName = tailwindcssv4NeedUpdateVariablesName.get(referencedVarName)!;
      }
      
      const declaration = `  --${variableCSSName}: var(--${referencedVarName});`;
      this.addToAppropriateRules(declaration, variableCSSName, format, cssOutput);
    } else if (defaultMode.value !== undefined) {
      // 处理直接值
      const processedValue = this.processValue(
        defaultMode.value,
        variable.resolvedDataType,
        variable.scopes,
        useRemUnit,
        variableCSSName,
        variable.name,
        format,
        rootElementSize
      );
      const declaration = `  --${variableCSSName}: ${processedValue};`;
      this.addToAppropriateRules(declaration, variableCSSName, format, cssOutput);
    }
  }

  /**
   * 处理非默认模式
   */
  private static processNonDefaultMode(
    variable: ResolvedVariable['initialVariable'],
    modeData: any,
    parentModes: string[],
    cssOutput: CSSOutput,
    allCollections: TVariableCollection[],
    appendCollectionName: boolean,
    useRemUnit: boolean,
    format: ExportFormat,
    rootElementSize: number,
    processedVarsMap: Map<string, Set<string>>,
    tailwindcssv4NeedUpdateVariablesName: Map<string, string>
  ): void {
    let variableCSSName = NameTransformer.getVariableCSSName(
      variable,
      variable.collection,
      appendCollectionName,
      format
    );

    // 应用 Tailwind CSS V4 字体变量名映射
    if (tailwindcssv4NeedUpdateVariablesName.has(variableCSSName) && 
        (format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)')) {
      variableCSSName = tailwindcssv4NeedUpdateVariablesName.get(variableCSSName)!;
    }

    const modeInfos = VariableResolver.getModeNamesAndCollections(parentModes, allCollections)
      .filter((info) => info.collection.id === variable.collection.id);

    const selector = this.generateSelector(modeInfos, variable, format);

    // 检查是否已处理过
    if (!processedVarsMap.has(selector)) {
      processedVarsMap.set(selector, new Set());
    }
    if (processedVarsMap.get(selector)!.has(variableCSSName)) {
      return;
    }
    processedVarsMap.get(selector)!.add(variableCSSName);

    let declaration: string;
    if (modeData.variable) {
      let referencedVarName = NameTransformer.getVariableCSSName(
        modeData.variable,
        variable.collection,
        appendCollectionName,
        format
      );
      
      // 对引用的变量名也应用映射
      if (tailwindcssv4NeedUpdateVariablesName.has(referencedVarName) && 
          (format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)')) {
        referencedVarName = tailwindcssv4NeedUpdateVariablesName.get(referencedVarName)!;
      }
      
      declaration = `  --${variableCSSName}: var(--${referencedVarName});`;
    } else {
      const processedValue = this.processValue(
        modeData.value,
        variable.resolvedDataType,
        variable.scopes,
        useRemUnit,
        variableCSSName,
        variable.name,
        format,
        rootElementSize
      );
      declaration = `  --${variableCSSName}: ${processedValue};`;
    }

    if (!cssOutput.modeRules.has(selector)) {
      cssOutput.modeRules.set(selector, new Set());
    }
    cssOutput.modeRules.get(selector)!.add(declaration);
  }

  /**
   * 生成选择器
   */
  private static generateSelector(
    modeInfos: Array<{ name: string; collection: TVariableCollection }>,
    variable: ResolvedVariable['initialVariable'],
    format: ExportFormat
  ): string {
    if (modeInfos.length > 0) {
      const modeName = modeInfos[0].name;
      if (VariableResolver.isMediaQuery(modeName)) {
        return `@media (${modeName})`;
      }
      return `.${modeName}`;
    }
    return NameTransformer.getThemeRootSelector(variable, format);
  }

  /**
   * 处理值
   */
  private static processValue(
    value: ResolvedValue,
    resolvedDataType: VariableResolvedDataType,
    scopes: VariableScope[],
    useRemUnit: boolean,
    variableCSSName: string,
    variableName: string,
    format: ExportFormat,
    rootElementSize: number
  ): string {
    if (typeof value !== 'object' || ColorProcessor.isColorValue(value)) {
      return UnitConverter.processConstantValue(
        value as SimpleValue | ColorValue,
        resolvedDataType,
        scopes,
        useRemUnit,
        variableCSSName,
        variableName,
        format,
        rootElementSize
      );
    }
    return String(value);
  }

  /**
   * 处理复杂的变量值 - 递归处理包含多个模式的变量引用
   */
  private static processComplexValue(
    value: ResolvedValue | undefined,
    parentModes: string[],
    variable: { name: string; collection: TVariableCollection },
    variableCollection: TVariableCollection,
    allCollections: TVariableCollection[],
    referencingCollection: TVariableCollection,
    originalCollection: TVariableCollection,
    resolvedDataType?: VariableResolvedDataType,
    scopes?: VariableScope[],
    cssOutput?: CSSOutput,
    appendCollectionName?: boolean,
    useRemUnit?: boolean,
    format?: ExportFormat,
    rootElementSize?: number,
    processedVarsMap?: Map<string, Set<string>>,
    variableCollectionMap?: Map<string, { collectionId: string; collectionName: string }>,
    tailwindcssv4NeedUpdateVariablesName?: Map<string, string>
  ): void {
    if (value === undefined || value === null) {
      console.warn(`处理变量 ${variable.name} 时遇到空值`);
      return;
    }

    let variableCSSName = NameTransformer.getVariableCSSName(
      variable,
      originalCollection,
      appendCollectionName!,
      format!
    );

    // 应用 Tailwind CSS V4 字体变量名映射
    if (tailwindcssv4NeedUpdateVariablesName && tailwindcssv4NeedUpdateVariablesName.has(variableCSSName) && 
        (format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)')) {
      variableCSSName = tailwindcssv4NeedUpdateVariablesName.get(variableCSSName)!;
    }

    // 记录变量所属的集合信息
    variableCollectionMap!.set(variableCSSName, {
      collectionId: referencingCollection.id,
      collectionName: referencingCollection.name,
    });

    // 如果是简单值或颜色值
    if (typeof value !== 'object' || ColorProcessor.isColorValue(value)) {
      const modeInfos = VariableResolver.getModeNamesAndCollections(parentModes, allCollections)
        .filter((info) => info.collection.id === referencingCollection.id);

      const selector = modeInfos.length > 0
        ? modeInfos.map((info) => {
            const modeName = info.name;
            if (VariableResolver.isMediaQuery(modeName)) {
              return `@media (${modeName})`;
            }
            return `.${modeName}`;
          })[0]
        : NameTransformer.getThemeRootSelector(variable, format!);

      // 检查这个变量是否已经在这个选择器中处理过
      if (!processedVarsMap!.has(selector)) {
        processedVarsMap!.set(selector, new Set());
      }

      // 如果变量已在此选择器中处理过，跳过
      if (processedVarsMap!.get(selector)!.has(variableCSSName)) {
        return;
      }

      // 标记为已处理
      processedVarsMap!.get(selector)!.add(variableCSSName);

      const processedValue = this.processValue(
        value,
        resolvedDataType!,
        scopes!,
        useRemUnit!,
        variableCSSName,
        variable.name,
        format!,
        rootElementSize!
      );

      const declaration = `  --${variableCSSName}: ${processedValue};`;

      // 如果是默认选择器
      if (selector === NameTransformer.getThemeRootSelector(variable, format!)) {
        this.addToAppropriateRules(declaration, variableCSSName, format!, cssOutput!);
      } else {
        // 添加到模式覆盖规则
        if (!cssOutput!.modeRules.has(selector)) {
          cssOutput!.modeRules.set(selector, new Set());
        }
        cssOutput!.modeRules.get(selector)!.add(declaration);
      }
      return;
    }

    // 如果是对象（包含模式信息），递归处理
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
        const modeInfos = VariableResolver.getModeNamesAndCollections(newParentModes, allCollections)
          .filter((info) => info.collection.id === referencingCollection.id);

        const selector = modeInfos.length > 0
          ? modeInfos.map((info) => {
              const modeName = info.name;
              if (VariableResolver.isMediaQuery(modeName)) {
                return `@media (${modeName})`;
              }
              return `.${modeName}`;
            })[0]
          : NameTransformer.getThemeRootSelector(variable, format!);

        // 检查这个变量是否已经在这个选择器中处理过
        if (!processedVarsMap!.has(selector)) {
          processedVarsMap!.set(selector, new Set());
        }

        // 如果变量已在此选择器中处理过，跳过
        if (processedVarsMap!.get(selector)!.has(variableCSSName)) {
          continue;
        }

        // 标记为已处理
        processedVarsMap!.get(selector)!.add(variableCSSName);

        let referencedVarName = NameTransformer.getVariableCSSName(
          modeData.variable,
          originalCollection,
          appendCollectionName!,
          format!
        );
        
        // 对引用的变量名也应用映射
        if (tailwindcssv4NeedUpdateVariablesName && tailwindcssv4NeedUpdateVariablesName.has(referencedVarName) && 
            (format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)')) {
          referencedVarName = tailwindcssv4NeedUpdateVariablesName.get(referencedVarName)!;
        }
        
        const varReference = `  --${variableCSSName}: var(--${referencedVarName});`;

        // 如果是默认选择器
        if (selector === NameTransformer.getThemeRootSelector(variable, format!)) {
          this.addToAppropriateRules(varReference, variableCSSName, format!, cssOutput!);
        } else {
          // 添加到模式覆盖规则
          if (!cssOutput!.modeRules.has(selector)) {
            cssOutput!.modeRules.set(selector, new Set());
          }
          cssOutput!.modeRules.get(selector)!.add(varReference);
        }

        // 如果引用的变量有值，继续处理
        if (modeData.value !== undefined) {
          this.processComplexValue(
            modeData.value,
            newParentModes,
            modeData.variable,
            modeData.variable.collection,
            allCollections,
            modeData.variable.collection,
            originalCollection,
            resolvedDataType,
            scopes,
            cssOutput,
            appendCollectionName,
            useRemUnit,
            format,
            rootElementSize,
            processedVarsMap,
            variableCollectionMap,
            tailwindcssv4NeedUpdateVariablesName
          );
        }
      } else if (modeData.value !== undefined) {
        // 如果是直接值，递归处理
        this.processComplexValue(
          modeData.value,
          newParentModes,
          variable,
          variableCollection,
          allCollections,
          referencingCollection,
          originalCollection,
          resolvedDataType,
          scopes,
          cssOutput,
          appendCollectionName,
          useRemUnit,
          format,
          rootElementSize,
          processedVarsMap,
          variableCollectionMap,
          tailwindcssv4NeedUpdateVariablesName
        );
      }
    }
  }

  /**
   * 处理 Tailwind CSS V4 字体配置
   * 根据原始实现，创建变量名映射表来处理字体属性的命名转换
   */
  private static processTailwindV4FontConfig(
    results: ResolvedVariable[],
    format: ExportFormat,
    cssOutput: CSSOutput
  ): Map<string, string> {
    const tailwindcssv4NeedUpdateVariablesName: Map<string, string> = new Map();
    
    if (format !== 'Tailwind CSS V4' && format !== 'shadcn/ui (Tailwind CSS V4)') {
      return tailwindcssv4NeedUpdateVariablesName;
    }

    const [mergedFontConfig, usedVariables] = FontProcessor.processMergedFontConfigs(results, format);
    
    // 分析字体配置，构建变量名映射表
    for (const [variantName, config] of Object.entries(mergedFontConfig)) {
      if (Array.isArray(config)) {
        const [fontSize, settings] = config as [string, Record<string, string>];
        
        // 为字体属性创建变量名映射
        if (settings) {
          for (const [prop, value] of Object.entries(settings)) {
            const kebabProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
            // 映射：从 text-variant-property 到 text-variant--property (双短横线)
            const originalName = `text-${variantName}-${kebabProp}`;
            const newName = `text-${variantName}--${kebabProp}`;
            tailwindcssv4NeedUpdateVariablesName.set(originalName, newName);
          }
        }
      }
    }
    
    return tailwindcssv4NeedUpdateVariablesName;
  }

  /**
   * 添加到适当的规则集合
   */
  private static addToAppropriateRules(
    declaration: string,
    variableCSSName: string,
    format: ExportFormat,
    cssOutput: CSSOutput
  ): void {
    const { isChange: isShadcnUiVariable } = NameTransformer.processShadcnUiVariableName(
      variableCSSName,
      format
    );

    if (isShadcnUiVariable) {
      cssOutput.defaultShadcnRules.set(variableCSSName, declaration);
    } else {
      cssOutput.defaultRules.set(variableCSSName, declaration);
    }
  }

  /**
   * 生成 CSS 字符串
   */
  private static generateCSSString(
    cssOutput: CSSOutput,
    allCollections: TVariableCollection[],
    format: ExportFormat,
    selectCollectionID: string,
    currentCollectionId: string
  ): string {
    const css: string[] = [];
    const themeRootSelector = getThemeRootSelector(format);

    // 生成默认规则
    if (cssOutput.defaultRules.size > 0) {
      css.push('/* Default Mode */');
      css.push(`${themeRootSelector} {`);
      css.push(...this.sortAndFormatDeclarations([...cssOutput.defaultRules.values()]));
      css.push('}\n');
    }

    // 生成 shadcn/ui 规则
    if (cssOutput.defaultShadcnRules.size > 0) {
      css.push('/* shadcn/ui Variables */');
      css.push(':root {');
      css.push(...this.sortAndFormatDeclarations([...cssOutput.defaultShadcnRules.values()]));
      css.push('}\n');
    }

    // 生成模式覆盖规则
    this.generateModeOverrides(css, cssOutput.modeRules, format);

    return css.join('\n');
  }

  /**
   * 生成模式覆盖规则
   */
  private static generateModeOverrides(
    css: string[],
    modeRules: Map<string, Set<string>>,
    format: ExportFormat
  ): void {
    const sortedSelectors = this.sortSelectors([...modeRules.keys()]);

    for (const selector of sortedSelectors) {
      const declarations = modeRules.get(selector);
      if (!declarations?.size) continue;

      css.push('/* Mode Override */');
      
      if (selector.startsWith('@media')) {
        this.generateMediaQueryRule(css, selector, [...declarations], format);
      } else {
        this.generateClassRule(css, selector, [...declarations]);
      }
    }
  }

  /**
   * 生成媒体查询规则
   */
  private static generateMediaQueryRule(
    css: string[],
    selector: string,
    declarations: string[],
    format: ExportFormat
  ): void {
    const isV4 = format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)';
    
    if (isV4) {
      css.push(`${selector} {`);
    }
    
    if (!isV4) {
      css.push(`${selector} {`);
    }
    
    css.push(isV4 ? ':root {' : ':root {');
    css.push(...this.sortAndFormatDeclarations(declarations));
    css.push('  }');
    
    if (!isV4) {
      css.push('}\n');
    } else {
      css.push('}\n');
    }
  }

  /**
   * 生成类规则
   */
  private static generateClassRule(css: string[], selector: string, declarations: string[]): void {
    css.push(`${selector} {`);
    css.push(...this.sortAndFormatDeclarations(declarations));
    css.push('}\n');
  }

  /**
   * 排序和格式化声明
   */
  private static sortAndFormatDeclarations(declarations: string[]): string[] {
    return declarations
      .sort((a, b) => {
        const varNameA = a.match(/--([^:]+):/)?.[1] || '';
        const varNameB = b.match(/--([^:]+):/)?.[1] || '';
        return varNameA.localeCompare(varNameB);
      })
      .reduce((acc: string[], declaration, index, arr) => {
        const varName = declaration.match(/--([^-]+)-/)?.[1] || '';
        const prevVarName = index > 0 ? arr[index - 1].match(/--([^-]+)-/)?.[1] || '' : '';
        
        // 在首字母变化时添加空行
        if (varName.charAt(0) !== prevVarName.charAt(0) && index > 0) {
          acc.push('');
        }
        
        acc.push(declaration);
        return acc;
      }, []);
  }

  /**
   * 排序选择器
   */
  private static sortSelectors(selectors: string[]): string[] {
    return selectors.sort((a, b) => {
      // 媒体查询放在最后
      if (a.startsWith('@media') && !b.startsWith('@media')) return 1;
      if (!a.startsWith('@media') && b.startsWith('@media')) return -1;
      return a.localeCompare(b);
    });
  }
}