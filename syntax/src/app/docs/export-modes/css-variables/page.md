# CSS Variables

选择 CSS Variables 导出方式时，Variables Xporter 会生成一个包含所有 CSS 变量定义的 CSS 文件。这种方式更加简单和灵活，适合不使用 Tailwind CSS 的项目。

## 特点

### 1. 简单直观
直接输出标准的 CSS 自定义属性：

```css
:root {
  --colors-primary: #c03939;
  --colors-primary-foreground: #ffffff;
  --font-size-heading-1: 2.5rem;
  --line-height-heading-1: 1.2;
}
```

### 2. 灵活的使用方式
可以在任何 CSS 规则中使用这些变量：

```css
.button {
  background-color: var(--colors-primary);
  color: var(--colors-primary-foreground);
  font-size: var(--font-size-heading-1);
  line-height: var(--line-height-heading-1);
}
```

### 3. 主题模式支持
支持使用 CSS 类切换主题：

```css
:root {
  --colors-primary: var(--colors-primary-light);
}

.dark {
  --colors-primary: var(--colors-primary-dark);
}
```

## 变量组织建议

虽然 CSS Variables 方式对变组织的要求较低，但我们仍然建议你遵循良好的组织原则，这样可以：

- 提高变量的可维护性
- 保持设计系统的一致性
- 方便团队协作
- 为将来可能的框架迁移做准备

{% quick-links %}
{% quick-link title="基本原则" icon="box" href="/docs/organizing-your-variables/principles" description="建立适合团队的变量命名方式，让代码更易读" /%}
{% quick-link title="颜色系统" icon="palette" href="/docs/organizing-your-variables/colors" description="设计系统中的颜色变量组织方式" /%}
{% quick-link title="排版系统" icon="type" href="/docs/organizing-your-variables/typography" description="文字排版相关的变量组织" /%}
{% /quick-links %}

{% callout type="info" %}
即使你现在不使用 Tailwind CSS，遵循这些组织原则也能让你的设计系统更加规范和专业。如果将来需要迁移到 Tailwind CSS，也会更加容易。
{% /callout %}
