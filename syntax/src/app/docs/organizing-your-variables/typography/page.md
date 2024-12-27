# 排版系统
让我们来探索如何组织字体相关的变量，包括 `font-family`（字体系列）、`font-size`（字体大小）、`font-weight`（字重）和 `line-height`（行高）等。这些变量是构建优秀排版系统的基石。

## 顶层目录
为了保持变量结构的清晰和直观，我们建议采用以下两种方式之一来组织字体相关变量：
1. 直接使用属性名作为顶层目录（如 `font-family`、`font-size` 等）
2. 使用[合并处理](#merge-property)方式统一管理

以下是使用属性名作为顶层目录的示例：
- `font-family/sans` - 无衬线字体系列
- `font-size/sm` - 小号字体大小
- `font-weight/bold` - 粗体字重
- `line-height/relaxed` - 宽松的行高
- `letter-spacing/normal` - 标准字间距

{% callout type="error" %}
在 Tailwind CSS 项目中，你必须选择以下方案之一：1) 使用 `font-family`、`font-size`、`font-weight`、`line-height` 等作为顶层目录；或 2) 使用 `font` 作为顶层目录并采用[合并处理](#merge-property)方式。这是由 Tailwind CSS 的配置结构决定的。
{% /callout %}

## 合并处理 [#merge-property]
除了使用独立的属性目录外，你还可以选择将相关的字体属性组合在一起。这种方式特别适合管理具有固定样式组合的文本样式，例如标题、正文等。

以下是一个典型的示例，我们将一个"英雄标题"的所有字体属性组织在一起：
- `font/hero/size` - 标题尺寸
- `font/hero/weight` - 标题字重
- `font/hero/line-height` - 标题行高
- `font/hero/letter-spacing` - 标题字间距

这种组织方式会自动生成以下 Tailwind CSS 配置和对应的 CSS 变量：

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    fontSize: {
      // 将相关的字体属性组合在一起，形成完整的文本样式
      'hero': ['var(--font-hero-size)', {
        lineHeight: 'var(--font-hero-line-height)',
        letterSpacing: 'var(--font-hero-letter-spacing)',
        fontWeight: 'var(--font-hero-weight)',
      }]
    }
  }
}
```
```css
:root {
  --font-hero-size: 1.5rem;
  --font-hero-line-height: 2rem;
  --font-hero-letter-spacing: -0.01em;
  --font-hero-weight: 500;
}
```

{% callout type="warning" %}
需要注意的是，合并处理功能仅支持四种样式属性：`font-size`、`font-weight`、`line-height` 和 `letter-spacing`。另外，只有在存在 `font/{variable}/size` 变量时，这个功能才会生效。这是为了与 Tailwind CSS 的 [`fontSize` 配置功能](https://tailwindcss.com/docs/font-size#customizing-your-theme)保持一致。
{% /callout %}

### 原子化变量

为了保持变量的灵活性和可重用性，我们也支持原子化的变量命名方式。当变量名符合 `font/{property}/{value}` 的规则[^1]时，Variables Xporter 会自动将其转换为对应的属性目录，以确保与 Tailwind CSS 的配置结构保持一致。

让我们来看一些实际的例子：

字体大小变量：
- `font/size/sm` → `font-size/sm` （小号字体）
- `font/size/base` → `font-size/base` （基础字体）
- `font/size/lg` → `font-size/lg` （大号字体）

字重变量：
- `font/weight/normal` → `font-weight/normal` （常规字重）
- `font/weight/medium` → `font-weight/medium` （中等字重）
- `font/weight/bold` → `font-weight/bold` （粗体字重）

行高变量：
- `font/line-height/none` → `line-height/none` （无行高）
- `font/line-height/tight` → `line-height/tight` （紧凑行高）
- `font/line-height/relaxed` → `line-height/relaxed` （宽松行高）

字间距变量：
- `font/letter-spacing/normal` → `letter-spacing/normal` （标准字间距）
- `font/letter-spacing/tight` → `letter-spacing/tight` （紧凑字间距）
- `font/letter-spacing/wide` → `letter-spacing/wide` （宽松字间距）

[^1]: `font/size/{value}` 、`font/weight/{value}` 、`font/line-height/{value}` 、`font/letter-spacing/{value}`。
