# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Variables Xporter is a Figma plugin that bridges design and development by exporting Figma variables to various code formats (shadcn/ui, Tailwind CSS, CSS variables). The project follows a monorepo structure with a pnpm workspace.

## Development Commands

### Root Level Commands
```bash
# Install all dependencies
pnpm install

# Development
pnpm dev:figma-plugin    # Start Figma plugin development
pnpm dev:docs           # Start documentation site
pnpm dev:syntax         # Start syntax package development  
pnpm dev:syntax-ts      # Start syntax-ts package development

# Build
pnpm build:figma-plugin # Build Figma plugin
pnpm build:docs        # Build documentation site
pnpm build:syntax      # Build syntax package
pnpm build:syntax-ts   # Build syntax-ts package
```

### Figma Plugin Development
```bash
cd figma-plugin
pnpm dev                # Webpack development with watch mode
pnpm build             # Production build
pnpm build:watch       # Development build with watch
pnpm prettier:format   # Format code with Prettier
```

### Documentation Site
```bash
cd docs
pnpm dev               # Next.js development server (with Turbopack)
pnpm build             # Build documentation site
pnpm start             # Start production server
pnpm types:check       # TypeScript type checking
```

## Architecture Overview

### Monorepo Structure
- **figma-plugin/**: React-based Figma plugin with TypeScript and Mantine UI
- **docs/**: Next.js documentation site with Nextra, supporting multiple languages
- **syntax/**: Syntax processing package (referenced but not in current structure)
- **syntax-ts/**: TypeScript syntax processing package (referenced but not in current structure)

### Figma Plugin Architecture

#### Core Components
- **src/app/components/App.tsx**: Main plugin interface with carousel navigation
- **src/plugin/controller.ts**: Figma API bridge and plugin lifecycle management
- **src/lib/utils.ts**: Core variable processing and export logic
- **src/types/app.ts**: TypeScript interfaces for variables and collections
- **src/lib/data.ts**: Figma API data fetching utilities

#### Key Features
1. **Variable Processing Pipeline**:
   - Figma API communication via `controller.ts`
   - Variable collection and parsing in `data.ts`
   - Export format generation in `utils.ts`
   - Color processing with `@texel/color` and `colorjs.io`

2. **Export Formats**:
   - shadcn/ui theme variables (Tailwind CSS v3/v4)
   - Tailwind CSS configuration
   - CSS variables
   - Multi-mode support (dark/light, brand themes, responsive)

3. **UI Architecture**:
   - Mantine component library for consistent design
   - React Context for state management (`variables-export-form-context.ts`)
   - Embla Carousel for multi-step navigation
   - Internationalization with JSON dictionaries

### Documentation Site Architecture
- **Next.js 15** with React 19
- **Nextra** for MDX-based documentation
- **Tailwind CSS v4** for styling
- **shadcn/ui** components with Radix UI primitives
- **Multi-language support**: English, Chinese, French

## Key Development Patterns

### Variable Processing
The plugin follows the "Single Outlet Principle" for managing complex multi-mode design systems:
- Main collection serves as the single source of truth
- Mode collections contain only variables that change between modes
- Variable references maintain design relationships

### Figma Plugin Communication
- UI-to-plugin communication via `postMessage`
- Plugin-to-UI responses with typed message handling
- Persistent storage using `figma.clientStorage`

### Color Processing
- RGB/RGBA color space conversion
- Support for color aliases and variable references
- Color format optimization for different export targets

### Export Logic
- Variable name normalization with `change-case`
- Unit conversion and responsive value handling
- CSS variable generation and optimization

## Important Files to Know

### Core Logic
- `figma-plugin/src/lib/utils.ts`: Main export processing logic
- `figma-plugin/src/lib/data.ts`: Figma API data fetching
- `figma-plugin/src/plugin/controller.ts`: Figma plugin controller

### Type Definitions
- `figma-plugin/src/types/app.ts`: Core TypeScript interfaces
- `figma-plugin/global.d.ts`: Global type declarations

### Configuration
- `figma-plugin/manifest.json`: Figma plugin configuration
- `figma-plugin/webpack.config.js`: Build configuration
- `docs/next.config.ts`: Documentation site configuration

## Development Notes

### Cursor Rules Integration
The project includes comprehensive development guidelines in `.cursorrules` covering:
- Project structure and workspace organization
- Core features and export modes
- Multi-mode system architecture
- Variable organization principles
- Documentation structure and internationalization

### Code Quality
- Prettier for code formatting
- ESLint for code quality (docs)
- Husky for git hooks
- TypeScript strict mode enabled

### Testing
No specific test commands are configured. Testing should be done manually through the Figma plugin interface.

### Internationalization
- Plugin UI supports English, Chinese, and French
- Documentation available in multiple languages
- Language dictionaries in JSON format
- Locale detection and switching implemented