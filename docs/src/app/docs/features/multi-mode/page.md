---
title: 多模式支持
nextjs:
  metadata:
    title: 多模式支持
    description: Variables Xporter 的多模式支持功能，支持明暗主题、品牌主题等多种模式
---

# 多模式支持 🎨

多模式支持是 Variables Xporter 的一个强大特性，它让你能够轻松管理不同场景下的设计变量，如明暗主题、品牌主题等。查看[多模式变量的组织建议](docs/organizing-your-variables/multi-mode)

## 什么是多模式？

多模式允许一个变量在不同情况下拥有不同的值。常见的模式包括：

- 明暗主题（Light/Dark）
- 品牌主题（不同品牌的样式）
- 响应式断点（不同屏幕尺寸）
- 状态变化（Normal/Hover/Active）

{% quick-links %}
{% quick-link title="多模式变量的组织建议" icon="theming" href="/docs/organizing-your-variables/multi-mode" description="了解如何组织和管理多模式变量，建立清晰的变量结构。" /%}
{% /quick-links %}

## 工作原理

### 1. 模式定义
在 Figma 中创建不同的模式：
```plaintext
Theme Modes（主题模式）
├── light
└── dark

Brand Modes（品牌模式）
├── default
├── brand-a
└── brand-b
```

### 2. 变量映射
为每个模式设置对应的变量值：
```css
/* 明暗主题示例 */
:root {
  --colors-primary: var(--colors-primary-light);
}

.dark {
  --colors-primary: var(--colors-primary-dark);
}

/* 品牌主题示例 */
.brand-a {
  --colors-primary: var(--colors-brand-a-primary);
}
```

### 3. 自动追踪
Variables Xporter 会自动：
- 识别所有可用的模式
- 生成对应的 CSS 变量
- 处理模式切换的逻辑

## 使用建议

1. **模式命名规范**
   - 使用清晰的模式名称
   - 遵循一致的命名模式
   - 避免特殊字符

2. **模式组织**
   - 按功能分组模式
   - 保持模式层级简单
   - 记录模式用途

3. **值的管理**
   - 确保所有模式都有对应的值
   - 使用合适的默认值
   - 测试模式切换效果

{% callout type="info" %}
结合变量引用功能，你可以创建更复杂的模式组合，如"深色模式下的品牌主题"。Variables Xporter 会自动处理这些组合情况。
{% /callout %}
