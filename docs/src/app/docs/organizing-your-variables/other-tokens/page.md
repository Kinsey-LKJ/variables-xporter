---
title: 其他设计变量
nextjs:
  metadata:
    title: 其他设计变量
    description: Variables Xporter 中其他设计变量的组织方式和最佳实践
---

# 其他设计变量

在设计系统中，除了颜色、排版和间距外，还有许多其他重要的设计变量。让我们来看看如何组织这些变量，以保持设计系统的一致性和可维护性。

## 其他样式

### `box-shadow`

使用 `box-shadow` 作为顶层目录：
- `box-shadow/sm` 
- `box-shadow/md` 
- `box-shadow/lg`
- `box-shadow/inner` 

### `border-width`

使用 `border-width` 作为顶层目录：
- `border-width/1`
- `border-width/2` 
- `border-width/3` 

### `border-radius`

使用 `border-radius` 作为顶层目录：
- `border-radius/sm`
- `border-radius/md`
- `border-radius/lg`

### `blur`

使用 `blur` 作为顶层目录：
- `blur/sm`
- `blur/md`
- `blur/lg`

你可以在 [Tailwind CSS 主题配置参考](https://tailwindcss.com/docs/theme#configuration-reference) 中查看完整的配置键列表。

## 组件级变量

对于组件级变量，顶层目录请依然遵循前面的原则，组件名称作为第二层，例如：
- `colors/button/DEFAULT`
- `colors/button/foreground`
- `colors/button/border`

- `colors/input/DEFAULT`

- `colors/card/DEFAULT`
- `colors/card/foreground`
- `colors/card/border`
