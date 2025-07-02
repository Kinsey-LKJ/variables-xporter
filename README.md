# Variables Xporter

<div align="center">
  <img src="docs/public/logo.svg" alt="Variables Xporter Logo" width="120" height="120">
  
  **A powerful Figma plugin that seamlessly bridges design and development**
  
  [![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
  [![Figma Plugin](https://img.shields.io/badge/Figma-Plugin-purple.svg)](https://www.figma.com/community/plugin/1255188943883240897)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
</div>

> 🌏 **Other Languages**: [中文版](README.zh.md)

## 📚 Documentation

For complete usage documentation and API reference, visit: [variables-xporter.com](https://variables-xporter.com)

## 📖 Introduction

Variables Xporter is a professional Figma plugin that seamlessly exports Figma design variables as **Tailwind CSS configuration files** or **CSS variables**, perfectly solving the synchronization problem between design and development. Make your design system effortlessly integrate into your development environment!

## ✨ Core Features

### Multiple Export Formats
- **Tailwind CSS V3**
- **Tailwind CSS V4**
- **CSS Variables**

### Powerful Multi-Mode Support
- **Theme Modes** - Perfect Dark/Light mode support
- **Brand Modes** - Multi-brand theme management
- **Device Modes** - Responsive breakpoint adaptation

### Professional Features
- **Variable Optimization** - Ignore Tailwind default palette to simplify exported code
- **Typography Merging** - Automatically merge related typography styles for better variable organization
- **Media Query Support** - CSS media query mode support
- **Variable References** - Maintain variable relationships from design and fully restore reference chains

## ✨ Philosophy

### Single Outlet Principle

Variables Xporter adopts the "Single Outlet Principle" to organize complex multi-mode design systems, which is our core philosophy for solving large-scale design system variable management.

#### What is the Single Outlet Principle?

**The Single Outlet Principle means that in a variable system, all variables use one collection as the sole outlet, which contains only one mode, and implements multi-mode variable management through references to variables in other collections.**

Traditional multi-mode variable organization:
```
Traditional Collection (All variables tightly coupled in one collection)
├── Light Mode                 ├── Dark Mode
├── colors/primary: #3B82F6    ├── colors/primary: #60A5FA
├── colors/secondary: #10B981  ├── colors/secondary: #F59E0B
├── spacing/sm: 8px            ├── spacing/sm: 8px (redundant setting)
└── font/size/base: 16px       └── font/size/base: 16px (redundant setting)
```

Single Outlet Principle variable organization:
```
Design Tokens (Main Collection - Single Outlet)
├── colors/primary/DEFAULT → References Theme Modes collection
├── colors/secondary/DEFAULT → References Theme Modes collection
├── spacing/sm: 8px (direct value, no multi-mode needed)
└── font/size/base: 16px (direct value, no multi-mode needed)

Theme Modes (Auxiliary Collection - Only stores changing variables)
├── Light Mode                         ├── Dark Mode
├── colors/primary/DEFAULT: #3B82F6    ├── colors/primary/DEFAULT: #60A5FA
└── colors/secondary/DEFAULT: #10B981  └── colors/secondary/DEFAULT: #F59E0B
```

#### Core Advantages

- **🎯 Unified Interface** - Designers only need to select variables from the main collection, no switching between multiple collections
- **⚡ Efficient Export** - Only need to select the main collection when exporting, plugin automatically tracks reference chains
- **🔧 Easy to Extend** - Adding new mode dimensions (like brand themes) won't affect existing structure
- **📦 Avoid Redundancy** - Only variables that need to change are placed in mode collections
- **🎨 Flexible Combinations** - Support complex combinations like Dark/Light × Brand × Responsive × Density modes

#### Practical Organization

1. **Create Design Tokens Collection (Main Collection)**
   - Contains all variables with only default mode
   - Serves as the unified outlet for designers

2. **Create Mode Collections (e.g., Theme Modes)**
   - Only contains variables that need to change between modes
   - Connected to main collection through variable references

3. **Establish Reference Relationships**
   - Main collection variables reference corresponding variables in mode collections
   - Form clear variable reference chains

This organization approach makes your design system both powerful and simple, perfectly supporting complex multi-mode scenarios without becoming chaotic.

## 🌍 Internationalization
- 🇨🇳 简体中文 (Simplified Chinese)
- 🇺🇸 English
- 🇫🇷 Français

## 🚀 Quick Start

### 1. Install Plugin
Search for and install [Variables Xporter](https://www.figma.com/community/plugin/1255188943883240897) plugin in Figma.

### 2. Organize Design Variables
Organize your Figma variables according to our [Variable Organization Guidelines](https://variables-xporter.com/docs/organizing-your-variables).

### 3. Export Variables
1. Open the plugin in Figma
2. Select export format (Tailwind CSS or CSS Variables)
3. Choose variable collections and groups to export
4. Click export to get the code

### 4. Use in Your Project

#### Tailwind CSS V3

After exporting to Tailwind CSS V3 format, you'll get two files that need to be integrated into your project:

**tailwind.config.js**
Merge the exported configuration into your Tailwind config file:

```javascript
module.exports = {
  theme: {
    extend: {
      // 🎯 Paste the exported extend content here
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
      // ... other exported configurations
    }
  }
}
```

**global.css**
Add CSS variable definitions to your global style file:

```css
/* Paste exported CSS variables into global.css */
:root {
  --colors-primary-default: 59 130 246;
  --colors-primary-foreground: 255 255 255;
  --spacing-xs: 4;
  --spacing-sm: 8;
}

/* Multi-mode support */
.dark {
  --colors-primary-default: 96 165 250;
}
```

#### ⚡ Tailwind CSS V4

Tailwind CSS V4 adopts a new CSS-first configuration approach, requiring only one file after export:

```css
/* Add exported content to your CSS config file (usually app.css or global.css) */
@theme {
  --color-primary: oklch(0.94 0.024 17.6);
  --color-primary-foreground: oklch(1 0 0);
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
}

/* Multi-mode support */
.dark {
  --color-primary: oklch(0.8 0.15 250);
}
```

> 💡 **Tip**: If your project already has other design system configurations (like shadcn/ui), place Variables Xporter exports at the end of the file to ensure correct priority.

#### CSS Variables

The simplest and most direct approach, suitable for projects not using Tailwind CSS:

```css
/* Directly add exported content to any CSS file */
:root {
  --colors-primary: #3b82f6;
  --colors-primary-foreground: #ffffff;
  --font-size-heading: 1.5rem;
  --line-height-heading: 1.2;
  --spacing-xs: 0.25rem;
}

/* Use anywhere */
.my-component {
  color: var(--colors-primary);
  background-color: var(--colors-primary-foreground);
  font-size: var(--font-size-heading);
  padding: var(--spacing-xs);
}
```

## 📁 Project Structure

```
variables-xporter/
├── figma-plugin/          # Figma plugin source code
│   ├── src/
│   │   ├── app/           # React UI components
│   │   ├── lib/           # Core logic and utilities
│   │   ├── plugin/        # Figma plugin API interaction
│   │   └── types/         # TypeScript type definitions
│   ├── manifest.json      # Figma plugin configuration
│   └── package.json
├── docs/                  # Documentation site
│   ├── app/               # Next.js application
│   ├── content/           # MDX documentation content
│   │   ├── zh/            # Chinese documentation
│   │   ├── en/            # English documentation
│   │   └── fr/            # French documentation
│   └── package.json
└── package.json           # Root project configuration
```

## Development Guide

### Requirements
- Node.js 18+
- pnpm 8+
- Figma Desktop App

### Install Dependencies
```bash
# Install all dependencies
pnpm install
```

### Development Commands

#### Figma Plugin Development
```bash
# Start plugin development mode
pnpm dev:figma-plugin

# Build plugin
pnpm build:figma-plugin
```

#### Documentation Site Development
```bash
# Start documentation development server
pnpm dev:docs

# Build documentation
pnpm build:docs
```

### Tech Stack

#### Figma Plugin
- **Framework**: React 18 + TypeScript
- **Build Tool**: Webpack 5
- **UI Library**: Mantine 7
- **State Management**: React Context + useForm
- **Styling**: PostCSS + Tailwind CSS
- **Utilities**: Lucide React, GSAP, Color.js

#### Documentation Site
- **Framework**: Next.js 15
- **Content**: MDX + Nextra
- **UI Library**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS V4
- **Internationalization**: Built-in multi-language support

### Key Files

- `figma-plugin/src/lib/utils.ts` - Core variable processing logic
- `figma-plugin/src/app/components/App.tsx` - Main plugin interface
- `figma-plugin/src/plugin/controller.ts` - Figma API interaction
- `docs/content/zh/docs/` - Chinese documentation content

## 🤝 Contributing

We welcome community contributions! Please follow these steps:

1. **Fork** this repository
2. Create a new feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

### Development Standards
- Use TypeScript for type-safe development
- Follow ESLint and Prettier code standards
- Update relevant documentation

### Report Issues
If you find bugs or have feature suggestions, please create a new issue in [Issues](https://github.com/Kinsey-LKJ/variables-xporter/issues).

## 🎯 Roadmap

- [ ] **Plugin Optimization**
  - [ ] Export performance optimization

- [ ] **New Features**
  - [ ] GitHub integration for automatic synchronization

## 📄 License

This project is licensed under the [ISC](LICENSE) license.

---

<div align="center">
  <p>If this project helps you, please give us a ⭐ Star!</p>
  <p>Built with ❤️ by Kinsey</p>
</div> 