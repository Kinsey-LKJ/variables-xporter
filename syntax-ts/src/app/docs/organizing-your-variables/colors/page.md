
# 颜色系统

颜色类变量的组织建议。

如果你对颜色类变量的组织和命名没有头绪，[shadcn/ui 的命名约定](https://ui.shadcn.com/docs/theming#convention)是一个很好的开始：
一般情况下，`background` 用于背景颜色，`foreground` 用于文本颜色，当 `background` 用于组件的背景颜色时，如 `colors/card/DEFAULT`[^1]，则省略 `background` 后缀。

{% details title="shadcn/ui 颜色变量命名参考" %}

- `colors/background/DEFAULT` - 页面主背景色
- `colors/foreground/DEFAULT` - 主要文本颜色
- `colors/muted/DEFAULT` - 次要背景色，用于柔和的视觉层次
- `colors/muted/foreground` - 次要文本颜色，用于辅助信息
- `colors/popover/DEFAULT` - 弹出层背景色，确保与主背景有适当区分
- `colors/popover/foreground` - 弹出层文本颜色
- `colors/card/DEFAULT` - 卡片背景色，用于内容区块
- `colors/card/foreground` - 卡片内文本颜色
- `colors/border/DEFAULT` - 边框颜色，用于分隔视觉元素
- `colors/input/DEFAULT` - 输入框边框颜色
- `colors/primary/DEFAULT` - 品牌主色调，用于主要按钮和重点元素
- `colors/primary/foreground` - 主色调上的文本颜色
- `colors/secondary/DEFAULT` - 品牌次色调，用于次要操作和界面元素
- `colors/secondary/foreground` - 次色调上的文本颜色
- `colors/accent/DEFAULT` - 强调色，用于突出显示特定元素
- `colors/accent/foreground` - 强调色上的文本颜色
- `colors/destructive/DEFAULT` - 警示色，用于危险操作和错误提示
- `colors/destructive/foreground` - 警示色上的文本颜色
- `colors/ring/DEFAULT` - 焦点环颜色，用于交互反馈

{% /details %}

## 顶层目录

为了确保颜色变量的统一管理和便于维护，我们强烈建议使用 `colors` 作为所有颜色相关变量的顶层目录。这不仅让你的变量结构更加清晰，也确保了与 Tailwind CSS 的完美兼容。

{% figure className="mt-6" src="/organizing-your-variables/colors/colors-1.png" alt="组织颜色类变量" caption="组织颜色类变量" /%}

{% callout type="warning" title="Tailwind CSS 的限制" %}
在 Tailwind CSS 项目中，颜色变量的顶层目录必须是 `colors`。这是因为 Tailwind CSS 的配置系统专门使用 `colors` 配置键来处理颜色相关的样式定义。使用其他名称可能导致颜色变量无法被正确识别和使用。
{% /callout %}

## 不透明度修饰符

Variables Xporter 提供了强大的颜色处理功能，它会自动为你生成[符合 Tailwind CSS 规则](https://tailwindcss.com/docs/customizing-colors#using-css-variables)的颜色变量。在开发过程中，你可以轻松地使用不透明度修饰符来动态调整颜色的透明度，无需额外的变量定义。使用不透明度修饰符可以让你在开发时灵活调整颜色的透明度。以下是一些常见的使用场景：

```html
<!-- 文本透明度调整 -->
<div class="text-primary/80">半透明主要文本</div>
<div class="text-secondary/60">更透明的次要文本</div>

<!-- 背景透明度调整 -->
<div class="bg-primary/10">淡色背景</div>
<div class="bg-accent/90">高对比度背景</div>

<!-- 边框透明度调整 -->
<div class="border-primary/30 border-2">柔和边框效果</div>
```

[^1]: `DEFAULT` 是组织变量层级的一种方式，[了解更多](/docs/organizing-your-variables/principles#use-default-value)
