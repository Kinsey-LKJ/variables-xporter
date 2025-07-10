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
        variableCollectionMap
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
    variableCollectionMap: Map<string, { collectionId: string; collectionName: string }>
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
        variableCollectionMap
      );
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
        processedVarsMap
      );
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
    variableCollectionMap: Map<string, { collectionId: string; collectionName: string }>
  ): void {
    let variableCSSName = NameTransformer.getVariableCSSName(
      variable,
      variable.collection,
      appendCollectionName,
      format
    );

    // 记录变量所属的集合信息
    variableCollectionMap.set(variableCSSName, {
      collectionId: variable.collection.id,
      collectionName: variable.collection.name,
    });

    if (defaultMode.variable) {
      // 处理变量引用
      const referencedVarName = NameTransformer.getVariableCSSName(
        defaultMode.variable,
        variable.collection,
        appendCollectionName,
        format
      );
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
    processedVarsMap: Map<string, Set<string>>
  ): void {
    const variableCSSName = NameTransformer.getVariableCSSName(
      variable,
      variable.collection,
      appendCollectionName,
      format
    );

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
      const referencedVarName = NameTransformer.getVariableCSSName(
        modeData.variable,
        variable.collection,
        appendCollectionName,
        format
      );
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