/**
 * 颜色处理器
 * 负责颜色值的转换和格式化
 */
import { convert, OKLCH, sRGB } from '@texel/color';
import { ExportFormat } from '../../types/app';
import { ColorValue, RGB, RGBA, ResolvedValue } from '../types/export';

export class ColorProcessor {
  /**
   * 判断值是否为 RGB 颜色
   */
  static isRGB(value: ResolvedValue): value is RGB {
    return typeof value === 'object' && 
           value !== null && 
           'r' in value && 
           'g' in value && 
           'b' in value && 
           !('a' in value);
  }

  /**
   * 判断值是否为 RGBA 颜色
   */
  static isRGBA(value: ResolvedValue): value is RGBA {
    return typeof value === 'object' && 
           value !== null && 
           'r' in value && 
           'g' in value && 
           'b' in value && 
           'a' in value;
  }

  /**
   * 判断值是否为颜色值
   */
  static isColorValue(value: ResolvedValue): value is ColorValue {
    return this.isRGB(value) || this.isRGBA(value);
  }

  /**
   * 处理颜色值并转换为指定格式
   */
  static processColorValue(value: ColorValue, format: ExportFormat): string {
    const r = Math.round(value.r * 255);
    const g = Math.round(value.g * 255);
    const b = Math.round(value.b * 255);

    if (format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)') {
      return this.convertToOKLCH(value);
    }

    return `${r} ${g} ${b}`;
  }

  /**
   * 转换为 OKLCH 颜色空间
   */
  private static convertToOKLCH(value: ColorValue): string {
    const oklch = convert([value.r, value.g, value.b], sRGB, OKLCH, [0, 0, 0]);

    const formatNumber = (num: number, precision: number): string => {
      if (num === 0) return '0';
      
      const fixed = Number(num.toFixed(precision));
      return fixed === Math.floor(fixed) ? fixed.toString() : fixed.toString();
    };

    const l = formatNumber(oklch[0], 3); // lightness
    const c = formatNumber(oklch[1], 3); // chroma
    const h = formatNumber(oklch[2], 1); // hue

    return `oklch(${l} ${c} ${h})`;
  }

  /**
   * 获取颜色的 CSS 表示
   */
  static getCSSColorValue(value: ColorValue, format: ExportFormat): string {
    const processedValue = this.processColorValue(value, format);
    
    if (format === 'CSS Variables') {
      // 对于纯 CSS Variables，直接返回 hex 或 rgb 格式
      const r = Math.round(value.r * 255);
      const g = Math.round(value.g * 255);
      const b = Math.round(value.b * 255);
      
      if ('a' in value && value.a !== 1) {
        return `rgba(${r}, ${g}, ${b}, ${value.a})`;
      }
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    return processedValue;
  }
}