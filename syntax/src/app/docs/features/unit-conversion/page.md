# 单位转换 📏

Variables Xporter 提供了强大的单位转换功能，可以自动将 Figma 中的 px 单位转换为更适合开发环境的 rem 单位。

## 为什么使用 rem？

rem（root em）是一个相对单位，它相对于根元素（html）的字体大小。使用 rem 的好处包括：

- 更好的可访问性：用户可以通过调整浏览器字体大小来缩放整个界面
- 响应式设计：更容易实现不同屏幕尺寸的适配
- 一致性：基于相对单位的设计更容易保持比例关系

---

## 如何使用

1. 在 Figma 中正常使用像素（px）单位
2. 导出时勾选"使用 Rem 单位"选项
3. Variables Xporter 会自动将 px 转换为 rem（基于 16px = 1rem）

例如：
```css
/* Figma 中的值 */
--spacing-lg: 24px;
--font-size-base: 16px;

/* 导出后的值（启用 rem 转换） */
--spacing-lg: 1.5rem;    /* 24/16 = 1.5 */
--font-size-base: 1rem;  /* 16/16 = 1 */
```
---

## 支持的属性

单位转换支持所有带有长度单位的属性，包括但不限于：

- 字体大小（fontSize）
- 间距（spacing）
- 宽度（width）
- 高度（height）
- 边框宽度（borderWidth）
- 边框半径（borderRadius）

{% callout type="info" %}
Variables Xporter 会保持精确的数值转换，确保设计规范在开发环境中得到准确实现。
{% /callout %}

---

## 最佳实践

1. **保持基础字号一致**
   - 确保 Figma 中使用 16px 作为基础字号
   - 这样可以保证 rem 转换的准确性

2. **使用 4px 的倍数**
   - 推荐使用 4px 的倍数作为间距值
   - 这样转换后的 rem 值会更加整洁（如 4px = 0.25rem）

3. **考虑特殊场景**
   - 某些需要精确像素对齐的场景可能不适合使用 rem
   - 这种情况下可以选择不启用单位转换
