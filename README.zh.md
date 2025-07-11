# Variables Xporter

<div align="center">
  <img src="docs/public/logo.svg" alt="Variables Xporter Logo" width="120" height="120">
  
  **一个将 Figma Variables 导出为代码的插件**
  
  [![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
  [![Figma Plugin](https://img.shields.io/badge/Figma-Plugin-purple.svg)](https://www.figma.com/community/plugin/1522142900835722038/variables-xporter)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
</div>


## 📚 文档

完整的使用文档和 API 参考请访问：[variables-xporter.com](https://variables-xporter.com)  

## 📖 项目简介

Variables Xporter 是一个 Figma 插件，支持将 Figma Variables 导出为 **shadcn/ui 主题变量**、**Tailwind CSS 配置文件**或 **CSS Variables**，提供有效的设计与开发工作流程集成。将您的 Figma Variables 转换为一致的 Design Tokens 用于开发环境。

## ✨ 核心特性

### 多种导出格式
- **shadcn/ui (Tailwind CSS V4)** ⭐ - 生成 shadcn/ui 主题变量和 Tailwind CSS V4 配置
- **shadcn/ui (Tailwind CSS V3)** ⭐ - 生成 shadcn/ui 主题变量和 Tailwind CSS V3 配置
- **Tailwind CSS V4** - 生成 Tailwind CSS V4 版本的配置文件和对应的 CSS
- **Tailwind CSS V3** - 生成 Tailwind CSS V3 版本的配置文件和对应的 CSS
- **CSS Variables** - 生成标准 CSS Variables

### 多模式支持
- **主题模式** - Dark/Light 模式支持
- **品牌模式** - 多品牌主题管理
- **密度模式** - 界面不同密度适配
- **设备模式** - 响应式断点适配
- ...

### 核心功能
- **shadcn/ui 主题支持** - 直接导出为 shadcn/ui 主题格式，与组件兼容良好
- **变量优化** - 忽略 Tailwind 默认调色板，简化导出的代码（Tailwind CSS 优化）
- **排版合并** - 自动合并相关的排版样式，构建更合理的排版相关变量（Tailwind CSS 优化）
- **媒体查询** - 导出在媒体查询条件下具有不同值的 Design Tokens
- **变量引用** - 保持设计中的变量关联关系，还原变量引用链

## ✨ 理念

### 单一出口原则

Variables Xporter 采用"单一出口原则"来组织复杂的多模式设计系统，这是我们管理大型设计系统变量的方法。

#### 什么是单一出口原则？

**单一出口原则是指在一个变量系统中，所有的变量以一个集合作为单一出口，这个集合只包含一个模式，并通过引用其他集合中的变量来实现多模式变量管理。**

传统的多模式变量组织方式：
```
传统集合 (所有变量强耦合到一个集合)
├── Light 模式                  ├── Dark 模式
├── colors/primary: #3B82F6    ├── colors/primary: #60A5FA
├── colors/secondary: #10B981  ├── colors/secondary: #F59E0B
├── spacing/sm: 8px            ├── spacing/sm: 8px (重复设置)
└── font/size/base: 16px       └── font/size/base: 16px (重复设置)
```

单一出口原则的变量组织方式：
```
Design Tokens (主集合 - 唯一出口)
├── colors/primary/DEFAULT → 引用 Theme Modes 集合
├── colors/secondary/DEFAULT → 引用 Theme Modes 集合  
├── spacing/sm: 8px (直接值，无需多模式)
└── font/size/base: 16px (直接值，无需多模式)

Theme Modes (辅助集合 - 仅存放变化的变量)
├── Light 模式                          ├── Dark 模式
├── colors/primary/DEFAULT: #3B82F6    ├── colors/primary/DEFAULT: #60A5FA
└── colors/secondary/DEFAULT: #10B981  └── colors/secondary/DEFAULT: #F59E0B
```

#### 核心优势

- **🎯 统一接口** - 设计师只需从主集合选择变量
- **⚡ 高效导出** - 导出时只需选择主集合，插件自动追踪引用链
- **🔧 易于扩展** - 添加新模式维度（如品牌主题）时不会影响现有结构
- **📦 避免冗余** - 只有需要变化的变量才放在模式集合中
- **🎨 灵活组合** - 支持明暗主题 × 品牌主题 × 响应式 × 紧凑模式等复杂组合

#### 实际组织方式

1. **创建 Design Tokens 集合（主集合）**
   - 包含所有变量，只有默认模式
   - 作为设计师使用的统一出口

2. **创建模式集合（如 Theme Modes）**
   - 只包含需要在模式间变化的变量
   - 通过变量引用连接到主集合

3. **建立引用关系**
   - 主集合变量引用模式集合对应变量
   - 形成清晰的变量引用链

这种组织方式让您的设计系统既强大又简单，支持复杂的多模式场景而不会变得混乱。


## 🌍 国际化支持
- 🇨🇳 简体中文
- 🇺🇸 English  
- 🇫🇷 Français

## ☕ 支持这个项目

如果 Variables Xporter 对你有帮助，请考虑请我喝杯咖啡来支持项目的持续开发！

<div align="center">
  <a href="https://www.buymeacoffee.com/kinseylkj" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
  </a>
</div>

你的支持将帮助我：
- 🚀 持续开发新功能
- 🐛 修复 bug 和改进性能
- 📚 维护和更新文档
- 🎯 响应社区反馈

## 🚀 快速开始

### 1. 安装插件
在 Figma 中搜索并安装 [Variables Xporter](https://www.figma.com/community/plugin/1522142900835722038/variables-xporter) 插件。

### 2. 组织设计变量
按照我们的 [变量组织建议](https://variables-xporter.com/docs/organizing-your-variables) 整理您的 Figma Variables：

### 3. 导出变量
1. 在 Figma 中打开插件
2. 选择导出格式（shadcn/ui、Tailwind CSS 或 CSS Variables）
3. 选择要导出的变量集合和分组
4. 点击导出获取代码

### 4. 在项目中使用

#### 🎨 shadcn/ui 主题变量

为 shadcn/ui 项目优化！Variables Xporter 生成的主题变量可以与 shadcn/ui 组件良好配合。

**shadcn/ui (Tailwind CSS V4) 格式：**

将导出的主题变量添加到您的 CSS 文件中：

```css
/* 添加到您的 app.css 或 global.css */
@theme {
  /* shadcn/ui 主题变量 */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

/* 暗色模式支持 */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  /* ... 其他暗色模式变量 */
}
```

**shadcn/ui (Tailwind CSS V3) 格式：**

您将获得两个需要集成的文件：

1. **tailwind.config.js** - 添加到您的 Tailwind 配置中
2. **global.css** - 将 CSS 变量添加到全局样式中

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... 其他主题颜色
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
}
```

您的 shadcn/ui 组件将自动使用这些主题变量！🎉

#### Tailwind CSS V3

导出为 Tailwind CSS V3 格式后，您将获得两个文件，需要分别集成到项目中：

**tailwind.config.js**
将导出的配置合并到您的 Tailwind 配置文件中：

```javascript
module.exports = {
  theme: {
    extend: {
      // 🎯 将导出的 extend 内容粘贴到这里
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--colors-primary-default) / <alpha-value>)',
          foreground: 'rgb(var(--colors-primary-foreground) / <alpha-value>)'
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem'
      }
      // ... 其他导出的配置
    }
  }
}
```

**global.css**
将 CSS Variables 定义添加到您的全局样式文件中：

```css
/* 将导出的 CSS Variables 粘贴到 global.css 中 */
:root {
  --colors-primary-default: 59 130 246;
  --colors-primary-foreground: 255 255 255;
  --spacing-xs: 4;
  --spacing-sm: 8;
}

/* 多模式支持 */
.dark {
  --colors-primary-default: 96 165 250;
}
```

#### ⚡ Tailwind CSS V4

Tailwind CSS V4 采用全新的 CSS 优先配置方式，导出后只需要一个文件：

```css
/* 将导出内容添加到您的 CSS 配置文件中 (通常是 app.css 或 global.css) */
@theme {
  --color-primary: oklch(0.94 0.024 17.6);
  --color-primary-foreground: oklch(1 0 0);
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
}

/* 多模式支持 */
.dark {
  --color-primary: oklch(0.8 0.15 250);
}
```

> 💡 **小贴士**：如果您的项目中已有其他设计系统配置（如 shadcn/ui），请将 Variables Xporter 导出的内容放在文件末尾，确保优先级正确。

#### CSS Variables

最简单直接的方式，适合不使用 Tailwind CSS 的项目：

```css
/* 直接将导出内容添加到任何 CSS 文件中 */
:root {
  --colors-primary: #3b82f6;
  --colors-primary-foreground: #ffffff;
  --font-size-heading: 1.5rem;
  --line-height-heading: 1.2;
  --spacing-xs: 0.25rem;
}

/* 在任何地方使用 */
.my-component {
  color: var(--colors-primary);
  background-color: var(--colors-primary-foreground);
  font-size: var(--font-size-heading);
  padding: var(--spacing-xs);
}
```


## 📁 项目结构

```
variables-xporter/
├── figma-plugin/          # Figma 插件源码
│   ├── src/
│   │   ├── app/           # React UI 组件
│   │   ├── lib/           # 核心逻辑和工具函数
│   │   ├── plugin/        # Figma 插件 API 交互
│   │   └── types/         # TypeScript 类型定义
│   ├── manifest.json      # Figma 插件配置
│   └── package.json
├── docs/                  # 文档站点
│   ├── app/               # Next.js 应用
│   ├── content/           # MDX 文档内容
│   │   ├── zh/            # 中文文档
│   │   ├── en/            # 英文文档
│   │   └── fr/            # 法文文档
│   └── package.json
└── package.json           # 根项目配置
```

## 开发指南

### 环境要求
- Node.js 18+
- pnpm 8+
- Figma Desktop App

### 安装依赖
```bash
# 安装所有依赖
pnpm install
```

### 开发命令

#### Figma 插件开发
```bash
# 启动插件开发模式
pnpm dev:figma-plugin

# 构建插件
pnpm build:figma-plugin
```

#### 文档站点开发
```bash
# 启动文档开发服务器
pnpm dev:docs

# 构建文档
pnpm build:docs
```



## 🎯 路线图

- [ ] **插件优化**
  - [ ] 导出性能优化

- [ ] **新功能**
  - [ ] GitHub 集成自动同步

## 📄 许可证

本项目采用 [ISC](LICENSE) 许可证。

---

<div align="center">
  <p>如果这个项目对您有帮助，请给我们一个 ⭐ Star！</p>
  <p>Built with ❤️ by Kinsey</p>
</div> 