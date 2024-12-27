# Tailwind CSS

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
<div class="text-primary/80">  <!-- 80% 不透明度 -->
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

### 3. 主题模式支持
自动处理主题切换相关的变量：

```css
/* global.css */
:root {
  --colors-primary: var(--colors-primary-light);
}

.dark {
  --colors-primary: var(--colors-primary-dark);
}
```

## 必须遵守的规则

### 1. 顶层结构
变量集合必须使用 Tailwind CSS 的主题配置名：

- `colors` - 颜色变量
- `spacing` - 间距、宽度、高度等
- `fontSize` - 字体大小
- `fontWeight` - 字重
- `borderRadius` - 圆角
- `opacity` - 透明度
等。

### 2. 变量层级
使用 `DEFAULT` 作为基础值的标记：

```
colors/
  primary/
    DEFAULT     -> text-primary
    foreground  -> text-primary-foreground
```

## 变量组织建议

虽然只有上述规则是必须遵守的，但我们仍建议你遵循以下组织原则：

{% quick-links %}
{% quick-link title="基本原则" icon="box" href="/docs/organizing-your-variables/principles" description="建立适合团队的变量命名方式，让代码更易读" /%}
{% quick-link title="颜色系统" icon="palette" href="/docs/organizing-your-variables/colors" description="设计系统中的颜色变量组织方式" /%}
{% quick-link title="排版系统" icon="type" href="/docs/organizing-your-variables/typography" description="文字排版相关的变量组织" /%}
{% /quick-links %}

这些原则能帮助你建立一个更易于维护和使用的设计系统。
