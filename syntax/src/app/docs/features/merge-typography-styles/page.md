# 合并排版样式 📝

合并排版样式是一个专门为 Tailwind CSS 设计的功能，它可以智能地将字体相关的变量组合成符合 Tailwind 约定的配置格式。

## 工作原理

当你在 Figma 中定义了字体相关的变量（如字体大小、行高等），Variables Xporter 会：

1. 识别相关的变量
2. 按照命名规则组合变量
3. 生成 Tailwind 配置

### 示例转换

Figma 变量：
```css
--font-size-heading-1: 2.5rem;
--line-height-heading-1: 1.2;
--font-weight-heading-1: 600;
```

转换后的 Tailwind 配置：
```js
fontSize: {
  'heading-1': ['2.5rem', {
    lineHeight: '1.2',
    fontWeight: '600'
  }]
}
```

---

## 命名约定

为了让 Variables Xporter 正确识别和合并变量，建议遵循以下命名规则：

1. **基础命名格式**
   ```
   {属性}-{组件}-{变体}
   ```

2. **支持的属性前缀**
   - `font-size`
   - `line-height`
   - `font-weight`
   - `letter-spacing`

3. **示例命名**
   ```
   font-size/heading/1
   line-height/heading/1
   font-weight/heading/1
   ```
---
## 使用建议

1. **保持命名一致性**
   - 使用统一的命名模式
   - 确保相关变量使用相同的标识符
   - 避免特殊字符

2. **变量组织**
   - 按组件类型组织变量
   - 保持层级结构清晰
   - 使用有意义的变体名称

3. **检查生成结果**
   - 确认变量合并正确
   - 验证生成的配置
   - 测试实际效果

{% callout type="info" %}
合并排版样式功能可以大大简化 Tailwind 配置的管理，让你的设计变量更容易维护和使用。记得在 Figma 中保持良好的变量命名习惯！
{% /callout %}
