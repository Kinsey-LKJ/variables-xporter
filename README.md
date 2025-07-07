# Variables Xporter

<div align="center">
  <img src="docs/public/logo.svg" alt="Variables Xporter Logo" width="120" height="120">
  
  **A powerful Figma plugin that seamlessly bridges design and development**
  
  [![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
  [![Figma Plugin](https://img.shields.io/badge/Figma-Plugin-purple.svg)](https://www.figma.com/community/plugin/1522142900835722038/variables-xporter)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
</div>

> 🌏 **Other Languages**: [中文版](README.zh.md)

## 📚 Documentation

For complete usage documentation and API reference, visit: [variables-xporter.com](https://variables-xporter.com)

## 📖 Introduction

Variables Xporter is a professional Figma plugin that supports exporting Figma Variables as **shadcn/ui theme variables**, **Tailwind CSS configuration files**, or **CSS variables**, perfectly solving the synchronization problem between design and development. Make your design system effortlessly integrate into your development environment!

## ✨ Core Features

### Multiple Export Formats
- **shadcn/ui (Tailwind CSS V4)** ⭐ - Generate shadcn/ui theme variables with Tailwind CSS V4 configuration
- **shadcn/ui (Tailwind CSS V3)** ⭐ - Generate shadcn/ui theme variables with Tailwind CSS V3 configuration  
- **Tailwind CSS V4** - Generate Tailwind CSS V4 configuration files and corresponding CSS
- **Tailwind CSS V3** - Generate Tailwind CSS V3 configuration files and corresponding CSS
- **CSS Variables** - Generate standard CSS Variables

### Powerful Multi-Mode Support
- **Theme Modes** - Perfect Dark/Light mode support
- **Brand Modes** - Multi-brand theme management
- **Density Modes** - Interface different density adaptation
- **Device Modes** - Responsive breakpoint adaptation
- ...

### Professional Features
- **shadcn/ui Theme Support** - Direct export to shadcn/ui theme format with perfect component compatibility
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

## ☕ Support This Project

If Variables Xporter has been helpful to you, please consider buying me a coffee to support the continued development of this project!

<div align="center">
  <a href="https://www.buymeacoffee.com/kinseylkj" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
  </a>
</div>

Your support helps me:
- 🚀 Continue developing new features
- 🐛 Fix bugs and improve performance
- 📚 Maintain and update documentation
- 🎯 Respond to community feedback

## 🚀 Quick Start

### 1. Install Plugin
Search for and install [Variables Xporter](https://www.figma.com/community/plugin/1522142900835722038/variables-xporter) plugin in Figma.

### 2. Organize Design Variables
Organize your Figma variables according to our [Variable Organization Guidelines](https://variables-xporter.com/docs/organizing-your-variables).

### 3. Export Variables
1. Open the plugin in Figma
2. Select export format (shadcn/ui, Tailwind CSS, or CSS Variables)
3. Choose variable collections and groups to export
4. Click export to get the code

### 4. Use in Your Project

#### 🎨 shadcn/ui Theme Variables

Perfect for shadcn/ui projects! Variables Xporter generates theme variables that work seamlessly with shadcn/ui components.

**For shadcn/ui (Tailwind CSS V4):**

Add the exported theme variables to your CSS file:

```css
/* Add to your app.css or global.css */
@theme {
  /* shadcn/ui theme variables */
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

/* Dark mode support */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  /* ... other dark mode variables */
}
```

**For shadcn/ui (Tailwind CSS V3):**

You'll get two files to integrate:

1. **tailwind.config.js** - Add to your Tailwind configuration
2. **global.css** - Add CSS variables to your global styles

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
        // ... other theme colors
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

Your shadcn/ui components will automatically use these theme variables! 🎉

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