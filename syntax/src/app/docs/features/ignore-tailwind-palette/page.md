# 忽略 Tailwind 调色板 🎨

当使用 Tailwind CSS 导出模式时，Variables Xporter 提供了一个实用的选项来忽略 Tailwind 默认的调色板，让你的设计系统更加简洁和专注。

## 为什么需要这个功能？

Tailwind CSS 默认包含了丰富的调色板：
- Slate
- Gray
- Zinc
- Neutral
- Stone
等...

虽然这些调色板很实用，但在以下情况下你可能想要忽略它们：
- 使用了自定义的色彩系统
- 需要减小配置文件大小
- 避免与默认颜色产生混淆

## 如何使用

1. 在导出设置中勾选"忽略 Tailwind CSS 默认色板"选项
2. Variables Xporter 将只导出你在 Figma 中定义的颜色变量
3. 生成的配置文件中不会包含 Tailwind 默认颜色

### 示例

```js
// 启用忽略选项前
module.exports = {
  theme: {
    colors: {
      slate: { /* ... */ },
      gray: { /* ... */ },
      zinc: { /* ... */ },
      // 你的自定义颜色
      primary: 'rgb(var(--colors-primary))',
    }
  }
}

// 启用忽略选项后
module.exports = {
  theme: {
    colors: {
      // 只包含你的自定义颜色
      primary: 'rgb(var(--colors-primary))',
    }
  }
}
```

## 最佳实践

1. **评估需求**
   - 确认是否需要 Tailwind 默认颜色
   - 检查自定义颜色是否完整
   - 考虑团队其他成员的需求

2. **颜色命名**
   - 使用清晰的语义化命名
   - 避免与 Tailwind 默认名称冲突
   - 保持命名的一致性

3. **文档记录**
   - 记录色彩系统的使用方式
   - 说明为什么选择忽略默认调色板
   - 提供颜色使用指南

{% callout type="info" %}
如果你使用了 Tailwind 默认颜色的变体（如 slate-100、gray-200 等），建议在忽略默认调色板之前，确保你的设计系统中有对应的替代方案。
{% /callout %}
