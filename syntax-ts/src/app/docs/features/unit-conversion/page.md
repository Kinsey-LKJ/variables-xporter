---
title: 单位转换
---

Variables Xporter 提供了强大的单位转换功能，可以自动将 Figma 中的 px 单位转换 Tailwind CSS 中默认的 rem 单位。{% .lead %}

## 如何使用
1. 导出时勾选"使用 Rem 单位"选项
2. Variables Xporter 会自动将 px 转换为 rem（基于 16px = 1rem）

例如：
```css
/* Figma 中的值 */
--spacing-lg: 24px;
--font-size-base: 16px;

/* 导出后的值（启用 rem 转换） */
--spacing-lg: 1.5rem;    /* 24/16 = 1.5 */
--font-size-base: 1rem;  /* 16/16 = 1 */
```

---

## 不会转换的变量
- 当变量名包含 px 且为数字时，此变量不会转换为 rem，例如 `spacing/px`
- 当变量的值为数字但通常不会包含单位时，在生成的 CSS 中也不会包含任何单位，例如 opacity、scale

除了以上条件的数字类型的变量，均会在勾选“使用 Rem 单位”时被转换为 rem

---

## rem 还是 px？
这是一个相当有争议的话题，虽然 Taiwind CSS 逐渐成为 Web 开发的标准，并且它使用 rem 单位，但是使用 rem 或者 px 都有各自的优缺点。
建议查看 [Joshw Comeau 的这篇文章](https://www.joshwcomeau.com/css/surprising-truth-about-pixels-and-accessibility/) 并结合项目的情况以及开发团队的建议来决定。但是好在 Tailwind CSS 提供了强大的自定义功能，Variables Xporter 也支持这两种单位。
