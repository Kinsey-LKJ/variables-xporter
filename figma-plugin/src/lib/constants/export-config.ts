/**
 * 导出功能的常量配置
 */
import { ExportFormat } from '../../types/app';

// ===== 单位处理相关 =====
export const NOT_SUPPORT_REM_UNITS = [
  'screens',
  'scale',
  'backdrop-blur',
  'border-width',
  'text-decoration-thickness',
  'line-clamp',
  'outline-offset',
  'outline-width',
  'stroke-width',
  'z-index',
  'skew',
] as const;

export const NON_UNITS = [
  'aspect-ratio',
  'hue-rotate',
  'rotate',
  'skew',
  'scale',
  'opacity',
  'brightness',
  'contrast',
  'grayscale',
  'invert',
  'saturate',
  'sepia',
  'grow',
  'shrink',
  'flex-grow',
  'flex-shrink',
  'order',
  'z-index',
] as const;

// ===== shadcn/ui 主题变量 =====
export const SHADCN_UI_V3_THEME_VARIABLES = new Set([
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
  '[radius]-radius',
]);

export const SHADCN_UI_V4_THEME_VARIABLES = new Set([
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
  '[radius]-radius',
]);

// ===== Tailwind CSS 属性映射 =====
export const TAILWIND_V3_PROPERTY_MAPPING = {
  color: 'colors',
  weight: 'font-weight',
  space: 'spacing',
  leading: 'line-height',
  tracking: 'letter-spacing',
  text: 'font-size',
  breakpoint: 'screens',
  radius: 'border-radius',
  shadow: 'box-shadow',
} as const;

export const TAILWIND_V4_PROPERTY_MAPPING = {
  colors: 'color',
  'font-size': 'text',
  weight: 'font-weight',
  space: 'spacing',
  'line-height': 'leading',
  'letter-spacing': 'tracking',
  screens: 'breakpoint',
  'border-radius': 'radius',
  'box-shadow': 'shadow',
} as const;

// ===== 字体属性映射 =====
export const TYPOGRAPHY_PROPERTY_MAPPING = {
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
} as const;

// ===== 媒体查询特性 =====
export const MEDIA_QUERY_FEATURES = [
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
] as const;

// ===== 工具函数 =====
export function getPropertyMapping(format: ExportFormat) {
  return format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)'
    ? TAILWIND_V4_PROPERTY_MAPPING
    : TAILWIND_V3_PROPERTY_MAPPING;
}

export function getShadcnThemeVariables(format: ExportFormat) {
  return format === 'shadcn/ui (Tailwind CSS V3)'
    ? SHADCN_UI_V3_THEME_VARIABLES
    : SHADCN_UI_V4_THEME_VARIABLES;
}

export function getThemeRootSelector(format: ExportFormat): string {
  return format === 'Tailwind CSS V4' || format === 'shadcn/ui (Tailwind CSS V4)' 
    ? '@theme' 
    : ':root';
}