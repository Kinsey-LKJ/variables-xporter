---
title: Tailwind CSS
---

选择 Tailwind CSS 导出方式时，Variables Xporter 会生成两个文件：

- `tailwind.config.js` - Tailwind CSS 的配置文件
- `global.css` - 包含所有 CSS 变量定义

## 特性和优化

### 1. 颜色值优化

自动将颜色值转换为 RGB 通道格式，支持 Tailwind 的不透明度修饰符：

```js
// tailwind.config.js
colors: {
  primary: 'rgb(var(--colors-primary-default))'
}

// global.css
:root {
  --colors-primary-default: 192 57 57;  /* RGB 通道格式 */
}
```

使用示例：

```html
<div class="text-primary/80">
  <!-- 80% 不透明度 -->
  Hello World
</div>
```

### 2. 字体变量合并

自动合并相关的字体变量，符合 Tailwind 的约定：

```js
fontSize: {
  'heading-1': ['2.5rem', { lineHeight: '1.2' }]
}
```

### 3. 多模式支持

借助**变量追溯**和**单一出口原则**, Variables Xporter 能够实现复杂的多模式变量导出。

```css
:root {
  --colors-primary: var(--colors-primary-light);
}

.dark {
  --colors-primary: var(--colors-primary-dark);
}
```

{% quick-link title="多模式支持" icon="book-text" href="/docs/features/multi-mode" description="了解多模式支持的更多细节。" /%}

---

## 变量组织建议

要保证 Figma 变量的完美导出，变量的命名需要遵循一定的规则，这是因为需要与 Tailwind CSS 的配置键对应。并且，良好的变量组织方式可以带来诸多好处：

- 提高变量的可维护性
- 保持设计系统的一致性
- 方便团队协作

### 基础原则
你可以先了解变量组织的基础原则，它能帮助你在变量的命名、分组、层级方面做出更好的决策。
{% quick-link title="基本原则" icon="book-text" href="/docs/organizing-your-variables/principles" description="了解基本原则的更多细节。" /%}

### 变量类型
然后，你就可以根据不同的变量类型，进一步组织你的变量。
{% quick-links %}
{% quick-link title="颜色系统" icon="book-text" href="/docs/organizing-your-variables/colors" description="了解颜色系统的组织建议。" /%}
{% quick-link title="排版系统" icon="book-text" href="/docs/organizing-your-variables/typography" description="了解排版系统的组织建议。" /%}
{% quick-link title="间距和尺寸系统" icon="book-text" href="/docs/organizing-your-variables/spacing" description="了解间距和尺寸系统的组织建议。" /%}
{% quick-link title="其他令牌" icon="book-text" href="/docs/organizing-your-variables/other-tokens" description="了解其他令牌的组织建议。" /%}
{% quick-link title="多模式" icon="book-text" href="/docs/organizing-your-variables/multi-mode" description="了解多模式的组织建议。" /%}
{% /quick-links %}
