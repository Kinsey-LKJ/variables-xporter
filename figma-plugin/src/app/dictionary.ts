import lingoI18nConfig from '../../../i18n.json';
export const defaultLocale = lingoI18nConfig.locale.source;
export const locales = lingoI18nConfig.locale.targets; 
export const allLanguages = [defaultLocale, ...locales] as const;

// 使用 require.context 自动导入所有翻译文件
const context = require.context('./', false, /\.json$/);

export type Locale = (typeof allLanguages)[number];

// 构建翻译对象
export const translations = context.keys().reduce(
  (acc, path) => {
    const langCode = path.match(/\.\/(.+)\.json$/)?.[1] ?? '';
    return {
      ...acc,
      [langCode]: context(path),
    };
  },
  {} as Record<Locale, any>
);

// 使用英文翻译作为类型定义基准
export type Dictionary = typeof translations.en;
