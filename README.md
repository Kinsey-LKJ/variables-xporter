# Variables Xporter

<div align="center">
  <img src="docs/public/logo.svg" alt="Variables Xporter Logo" width="120" height="120">
  
  **一个强大的 Figma 插件，轻松的链接设计与开发**
  
  [![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
  [![Figma Plugin](https://img.shields.io/badge/Figma-Plugin-purple.svg)](https://www.figma.com/community/plugin/1255188943883240897)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
</div>

## 📚 文档

完整的使用文档和 API 参考请访问：

- 🌐 **在线文档**: [variables-xporter.com](https://variables-xporter.com)
- 📖 **使用指南**: [变量组织建议](https://variables-xporter.com/docs/organizing-your-variables)
- ⚡ **功能特性**: [高级功能](https://variables-xporter.com/docs/features)
- 🎯 **导出模式**: [导出格式说明](https://variables-xporter.com/docs/export-modes)

## 📖 项目简介

Variables Xporter 是一个专业的 Figma 插件，它能将 Figma 设计变量无缝导出为 **Tailwind CSS 配置文件**或 **CSS 变量**，完美解决设计与开发之间的同步问题。让设计系统轻松落地到开发环境！

## ✨ 核心特性

### 🎯 多种导出格式
- **Tailwind CSS V3**
- **Tailwind CSS V4**
- **CSS Variables**

### 🌈 强大的多模式支持
- **主题模式** - Dark/Light 模式完美支持
- **品牌模式** - 多品牌主题管理
- **设备模式** - 响应式断点适配
- **状态模式** - Hover、Focus 等交互状态

### 🛠️ 专业功能
- **变量优化** - 忽略 Tailwind 默认调色板，简化导出的代码
- **排版合并** - 自动合并相关的排版样式，构建更合理的排版相关变量
- **媒体查询** - CSS 媒体查询模式支持
- **变量引用** - 保持设计中的变量关联关系，完整还原变量引用联

### ⭐ 单一出口原则

Variables Xporter 采用"单一出口原则"来组织复杂的多模式设计系统，这是我们解决大型设计系统变量管理的核心理念。

#### 🎯 什么是单一出口原则？

**单一出口原则是指在一个变量系统中，所有的变量以一个集合作为唯一出口，这个集合只包含一个模式，并通过引用其他集合中的变量来实现多模式变量管理。**

传统的多模式变量组织方式：
```
传统集合 (所有变量强耦合到一个集合)
├── Light 模式    ├── Dark 模式
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
├── Light 模式    ├── Dark 模式
├── colors/primary/DEFAULT: #3B82F6    ├── colors/primary/DEFAULT: #60A5FA
└── colors/secondary/DEFAULT: #10B981  └── colors/secondary/DEFAULT: #F59E0B
```

#### ✨ 核心优势

- **🎯 统一接口** - 设计师只需从主集合选择变量，无需在多个集合间切换
- **⚡ 高效导出** - 导出时只需选择主集合，插件自动追踪引用链
- **🔧 易于扩展** - 添加新模式维度（如品牌主题）时不会影响现有结构
- **📦 避免冗余** - 只有需要变化的变量才放在模式集合中
- **🎨 灵活组合** - 支持明暗主题 × 品牌主题 × 响应式 × 紧凑模式等复杂组合

#### 🏗️ 实际组织方式

1. **创建 Design Tokens 集合（主集合）**
   - 包含所有变量，只有默认模式
   - 作为设计师使用的统一出口

2. **创建模式集合（如 Theme Modes）**
   - 只包含需要在模式间变化的变量
   - 通过变量引用连接到主集合

3. **建立引用关系**
   - 主集合变量引用模式集合对应变量
   - 形成清晰的变量引用链

这种组织方式让您的设计系统既强大又简单，完美支持复杂的多模式场景而不会变得混乱。


### 🌍 国际化支持
- 🇨🇳 简体中文
- 🇺🇸 English  
- 🇫🇷 Français

## 🚀 快速开始

### 1. 安装插件
在 Figma 中搜索并安装 [Variables Xporter](https://www.figma.com/community/plugin/1255188943883240897) 插件。

### 2. 组织设计变量
按照我们的 [变量组织建议](https://variables-xporter.com/docs/organizing-your-variables) 整理您的 Figma 变量：

### 3. 导出变量
1. 在 Figma 中打开插件
2. 选择导出格式（Tailwind CSS 或 CSS 变量）
3. 选择要导出的变量集合和分组
4. 点击导出获取代码

### 4. 在项目中使用

#### 🎨 Tailwind CSS V3

导出为 Tailwind CSS V3 格式后，您将获得两个文件，需要分别集成到项目中：

**📄 tailwind.config.js**
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

**🎨 global.css**
将 CSS 变量定义添加到您的全局样式文件中：

```css
/* 🎯 将导出的 CSS 变量粘贴到 global.css 中 */
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
/* 🎯 将导出内容添加到您的 CSS 配置文件中 (通常是 app.css 或 global.css) */
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

#### 🔧 CSS Variables

最简单直接的方式，适合适合不使用 Tailwind CSS 的项目：

```css
/* 🎯 直接将导出内容添加到任何 CSS 文件中 */
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

## 🛠️ 开发指南

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

### 技术栈

#### Figma 插件
- **框架**: React 18 + TypeScript
- **构建工具**: Webpack 5
- **UI 库**: Mantine 7
- **状态管理**: React Context + useForm
- **样式**: PostCSS + Tailwind CSS
- **工具库**: Lucide React, GSAP, Color.js

#### 文档站点  
- **框架**: Next.js 15
- **内容**: MDX + Nextra
- **UI 库**: Radix UI + shadcn/ui
- **样式**: Tailwind CSS V4
- **国际化**: 内置多语言支持

### 核心文件说明

- `figma-plugin/src/lib/utils.ts` - 变量处理核心逻辑
- `figma-plugin/src/app/components/App.tsx` - 插件主界面
- `figma-plugin/src/plugin/controller.ts` - Figma API 交互
- `docs/content/zh/docs/` - 中文文档内容


## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. **Fork** 本仓库
2. 创建新的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 **Pull Request**

### 开发规范
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 代码规范
- 更新相关文档

### 报告问题
如果您发现 bug 或有功能建议，请在 [Issues](https://github.com/yourusername/variables-xporter/issues) 中创建新的 issue。

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