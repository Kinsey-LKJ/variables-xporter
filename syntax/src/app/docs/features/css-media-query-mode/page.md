# CSS 媒体查询模式 📱

CSS 媒体查询模式让你能够为不同的视口尺寸或设备特性定义变量值，实现响应式设计。

## 工作原理

Variables Xporter 支持在变量模式名中使用标准的媒体查询语法：

```plaintext
变量模式命名规则：
{media-feature}:{value}

例如：
min-width:768px
max-width:1024px
```

### 支持的媒体特性

- `min-width`
- `max-width`
- `min-height`
- `max-height`
- `orientation`
- `prefers-color-scheme`
等...

## 使用示例

### 1. 响应式间距
在 Figma 中设置不同断点的容器宽度：

```css
/* 生成的 CSS */
:root {
  --spacing-container: 1rem;
}

@media (min-width: 640px) {
  --spacing-container: 2rem;
}

@media (min-width: 768px) {
  --spacing-container: 4rem;
}
```

### 2. 响应式字体大小
为不同屏幕尺寸设置合适的字体大小：

```css
:root {
  --font-size-heading: 2rem;
}

@media (min-width: 768px) {
  --font-size-heading: 2.5rem;
}

@media (min-width: 1024px) {
  --font-size-heading: 3rem;
}
```

## 最佳实践

1. **断点策略**
   - 使用一致的断点值
   - 从小到大规划断点
   - 避免过多的断点

2. **变量管理**
   - 只对需要响应式的属性使用媒体查询
   - 保持基础值的可读性
   - 记录断点的用途

3. **测试验证**
   - 在不同设备上测试
   - 检查断点切换效果
   - 确保平滑的响应式体验

{% callout type="info" %}
结合多模式支持，你可以创建复杂的响应式设计系统。例如，可以为不同的断点设置不同的主题样式。
{% /callout %}

## 使用提示

1. **常用断点参考**
   ```css
   /* 移动优先的断点 */
   sm: min-width: 640px
   md: min-width: 768px
   lg: min-width: 1024px
   xl: min-width: 1280px
   2xl: min-width: 1536px
   ```

2. **组合使用**
   可以组合多个媒体特性：
   ```css
   @media (min-width: 768px) and (orientation: landscape) {
     /* 样式定义 */
   }
   ```

3. **性能考虑**
   - 避免过于复杂的媒体查询
   - 优先使用 min-width 而不是 max-width
   - 保持媒体查询的可维护性
