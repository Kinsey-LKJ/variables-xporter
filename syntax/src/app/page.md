---
title: Variables Xporter
---

Variables Xporter 是一个 Figma 插件，它能将 Figma 变量导出为 Tailwind CSS 配置文件或 CSS 变量。让设计系统轻松同步到开发环境！ {% .lead %}

{% quick-links %}

{% quick-link title="变量组织" icon="box" href="/docs/organizing-your-variables" description="了解如何组织你的设计变量，建立清晰、可维护的设计系统。" /%}

{% quick-link title="功能特性" icon="lightbulb" href="/docs/features" description="探索 Variables Xporter 的强大功能，包括单位转换、变量引用等。" /%}

{% quick-link title="导出模式" icon="palette" href="/docs/export-modes/tailwind" description="支持导出为 Tailwind CSS 配置或标准 CSS 变量，灵活适配不同项目需求。" /%}

{% quick-link title="多模式支持" icon="moon" href="/docs/organizing-your-variables/multi-mode" description="基于单一出口原则的多模式变量管理，轻松处理明暗主题等场景。" /%}

{% /quick-links %}

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

{% callout type="info" %}
Variables Xporter 支持导出为 Tailwind CSS 配置和 CSS 变量，让你的设计系统轻松同步到开发环境。
{% /callout %}

---

## 开始使用

### 1. 按照组织建议整理变量

首先，按照我们的[变量组织建议](/docs/organizing-your-variables)整理你的 Figma 变量。这是十分关键的一步，特别是对于 Tailwind CSS 项目。

### 2. 选择导出模式

根据你的项目需求，选择合适的[导出模式](/docs/export-modes/tailwind)：
- **Tailwind CSS**：适合使用 Tailwind CSS 的项目
- **CSS 变量**：适合任何 Web 项目

### 3. 配置导出选项

在插件面板中：
1. 选择要导出的变量集合
2. 配置导出选项（如单位转换、变量引用等）
3. 预览并确认导出内容

### 4. 集成到项目

将导出的配置文件集成到你的项目中：
- Tailwind CSS：在 `tailwind.config.js` 中引入
- CSS 变量：在样式文件中引入
