---
title: 变量引用
nextjs:
  metadata:
    title: 变量引用
    description: Variables Xporter 的变量引用功能，支持跨集合的变量引用关系
---

# 变量引用 🔗

变量引用是 Variables Xporter 的核心特性之一，它允许你在不同的变量集合之间建立引用关系，实现更灵活和可维护的设计系统。

## 什么是变量引用？

变量引用允许一个变量使用另一个变量的值，这种引用可以：
- 跨越不同的变量集合
- 建立多层级的引用链
- 最终追溯到原始类型的值（颜色、数字、字符串等）

## 使用场景

### 1. 主题模式切换
```plaintext
Design Tokens (主集合)
└── colors/primary/DEFAULT ────────────┐
                                      │
Theme Modes (主题模式集合)               │
└── colors/primary/DEFAULT ◄───────────┘
    └── modes
        ├── light: #E55517
        └── dark:  #EE6D21
```

### 2. 品牌主题管理
```plaintext
colors/primary/DEFAULT
├── Brand A: colors/brandA/500
└── Brand B: colors/brandB/500
```

### 3. 响应式设计
```plaintext
spacing/container/DEFAULT
├── min-width:1024px: 64rem
└── min-width:1280px: 72rem
```

## 最佳实践

1. **[使用单一出口原则](/docs/organizing-your-variables/multi-mode#single-export-principle)**
   - 所有变量访问通过主集合进行
   - 在主集合中建立引用关系
   - 避免直接使用其他集合的变量

2. **保持引用链清晰**
   - 避免过深的引用层级
   - 使用有意义的变量名
   - 记录关键引用关系

3. **合理组织变量集合**
   - 每个集合专注于特定功能
   - 明确集合之间的依赖关系
   - 避免循环引用

{% callout type="info" %}
使用变量引用时，Variables Xporter 会自动追踪并解析完整的引用链，你只需要在主集合中使用变量，无需关心背后的引用关系。
{% /callout %}
