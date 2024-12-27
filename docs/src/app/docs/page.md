---
title: 简介
nextjs:
  metadata:
    title: Variables Xporter
    description: Export Figma variables to Tailwind CSS and CSS Variables
---

# Variables Xporter

{% table-of-contents /%}

Variables Xporter 是一个 Figma 插件，它能将 Figma 变量导出为 Tailwind CSS 配置文件或 CSS 变量。让设计系统轻松同步到开发环境！

## 功能特点

### 导出格式
- **Tailwind CSS**：生成配置文件和对应的 CSS 文件
- **CSS 变量**：生成标准 CSS 变量

### 变量处理
- **类型支持**：颜色、数值、尺寸等变量类型的自动转换
- **单位转换**：px 到 rem 的自动转换，保持精度
- **变量引用**：完整支持变量间的引用关系
- **变量过滤**：支持选择性导出，避免冗余配置

### 多模式系统
- **单一出口**：基于单一出口原则的多模式变量管理
- **智能解析**：自动处理不同模式下的变量值和引用
- **类型检测**：智能识别和转换不同类型的变量
- **代码优化**：生成简洁规范的配置代码

## 开始使用

{% steps %}

### 按照 [组织建议](/docs/organizing-your-variables) 整理你的 Figma 变量
这是十分关键的一步，特别是对于 Tailwind CSS 项目。

### 在你的 Figma 文件里打开 [Variables Xporter](https://www.figma.com/community/plugin/1255188943883240897)

{% figure src="/get-started/open-variables-xporter.png" alt="打开 Variables Xporter" caption="打开 Variables Xporter" /%}

### 选择要导出的集合以及分组

{% figure src="/get-started/choose-collection-and-group.png" alt="选择集合和分组" caption="选择集合和分组" /%}

### 选择格式并导出

{% figure src="/get-started/choose-format.png" alt="选择格式并导出" caption="选择格式并导出" /%}

{% /steps %}

{% callout type="info" %}
了解变量组织的最佳实践，将帮助你更好地规划设计系统。
{% /callout %}

{% prev-next-links /%}
