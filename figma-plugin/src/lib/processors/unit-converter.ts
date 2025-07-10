/**
 * 单位转换器
 * 负责数值的单位转换和格式化
 */
import { ExportFormat } from '../../types/app';
import { SimpleValue, ColorValue } from '../types/export';
import { NOT_SUPPORT_REM_UNITS, NON_UNITS } from '../constants/export-config';
import { ColorProcessor } from './color-processor';

export class UnitConverter {
  /**
   * 处理常量值并应用适当的单位转换
   */
  static processConstantValue(
    value: SimpleValue | ColorValue,
    resolvedDataType: VariableResolvedDataType,
    scopes: VariableScope[],
    useRemUnit: boolean,
    variableCSSName: string,
    variableName: string,
    format: ExportFormat,
    rootElementSize: number = 16
  ): string {
    // 处理颜色值
    if (ColorProcessor.isColorValue(value)) {
      return ColorProcessor.getCSSColorValue(value, format);
    }

    // 处理数值类型
    if (resolvedDataType === 'FLOAT') {
      return this.processFloatValue(
        value as number,
        scopes,
        useRemUnit,
        variableCSSName,
        variableName,
        rootElementSize
      );
    }

    // 其他类型直接返回字符串
    return String(value);
  }

  /**
   * 处理浮点数值
   */
  private static processFloatValue(
    value: number,
    scopes: VariableScope[],
    useRemUnit: boolean,
    variableCSSName: string,
    variableName: string,
    rootElementSize: number
  ): string {
    const nameArray = variableName.split('/');
    
    const isMustPx = variableCSSName.includes('-px');
    const isNotSupportRemUnit = NOT_SUPPORT_REM_UNITS.some(
      (item) => nameArray.includes(item)
    );
    const isNonUnit = NON_UNITS.some(
      (item) => nameArray.includes(item)
    );

    // 处理透明度和文本内容
    if (this.isOpacityOrTextScope(scopes)) {
      return String(value);
    }

    // 处理 rem 单位
    if (!isMustPx && useRemUnit && !isNonUnit && !isNotSupportRemUnit) {
      return `${value / rootElementSize}rem`;
    }

    // 处理 px 单位
    if (!isNonUnit) {
      return `${value}px`;
    }

    // 无单位数值
    return String(value);
  }

  /**
   * 检查作用域是否为透明度或文本内容
   */
  private static isOpacityOrTextScope(scopes: VariableScope[]): boolean {
    return ['OPACITY', 'TEXT_CONTENT'].some((scope) => 
      scopes.includes(scope as VariableScope)
    );
  }

  /**
   * 格式化数字显示
   */
  static formatNumber(num: number, precision: number = 3): string {
    if (num === 0) return '0';
    
    const fixed = Number(num.toFixed(precision));
    return fixed === Math.floor(fixed) ? fixed.toString() : fixed.toString();
  }
}