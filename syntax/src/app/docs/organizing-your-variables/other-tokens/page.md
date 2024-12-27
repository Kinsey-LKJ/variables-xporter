---
title: 其他设计变量
description: 在设计系统中，除了颜色、排版和间距外的其他重要设计变量的组织方式
---

在设计系统中，除了颜色、排版和间距外，还有许多其他重要的设计变量。让我们来看看如何组织这些变量，以保持设计系统的一致性和可维护性。

## 基础样式

### 阴影变量

使用 `box-shadow` 作为顶层目录：

```text
box-shadow/
├── sm     # 小阴影
├── md     # 中等阴影
├── lg     # 大阴影
└── inner  # 内阴影
```

### 边框变量

使用 `border-width` 作为顶层目录：

```text
border-width/
├── 1      # 1px
├── 2      # 2px
└── 3      # 3px
```

### 圆角变量

使用 `border-radius` 作为顶层目录：

```text
border-radius/
├── sm     # 小圆角
├── md     # 中等圆角
└── lg     # 大圆角
```

### 模糊变量

使用 `blur` 作为顶层目录：

```text
blur/
├── sm     # 轻微模糊
├── md     # 中等模糊
└── lg     # 强烈模糊
```

{% callout type="note" title="更多配置" %}
你可以在 [Tailwind CSS 主题配置参考](https://tailwindcss.com/docs/theme#configuration-reference) 中查看完整的配置键列表。
{% /callout %}

## 组件级变量

对于组件级变量，顶层目录请依然遵循前面的原则，组件名称作为第二层。以下是一些常见的组件变量组织示例：

```text
colors/
├── button/
│   ├── DEFAULT
│   ├── foreground
│   └── border
│
├── input/
│   └── DEFAULT
│
└── card/
    ├── DEFAULT
    ├── foreground
    └── border
```
