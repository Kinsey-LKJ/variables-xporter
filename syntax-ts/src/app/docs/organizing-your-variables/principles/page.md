---
title: 变量组织原则
---

在使用 Variables Xporter 时，变量的组织方式直接影响导出结果的质量。让我们一起学习如何在 Figma 中合理组织变量，确保导出的代码能完美适配你的开发环境，并让你的设计变量更统一并易于维护。


## 命名原则

为了让变量更易于理解和维护，我们建议遵循以下命名原则：

- 使用英文命名：这不仅确保了与开发环境的兼容性，也让变量在导出为 Tailwind CSS 配置或 CSS 变量时保持一致性
- 选择语义化命名：变量名应清晰表达其用途，让团队成员一眼就能理解
- 保持简洁明了：避免过于冗长或复杂的命名，让代码更易读、更易维护


### 顶层名称
如果你的项目使用 Tailwind CSS，请确保变量的顶层名称与 Tailwind CSS 的主题配置键保持一致。以下是一些常用的配置键示例：

- `colors`
- `spacing`
- `fontSize`
- `fontWeight`
- `borderRadius`
- `opacity`

你可以在 [Tailwind CSS 主题配置参考](https://tailwindcss.com/docs/theme#configuration-reference) 中查看完整的配置键列表。

---

## 分隔原则
在设计系统中，我们经常需要使用多个单词来描述一个变量。Variables Xporter 在导出时会根据目标格式自动转换命名格式：

- Tailwind CSS 配置文件：使用 camelCase 格式（如：fontSize、fontWeight）
- CSS 变量：使用 kebab-case 格式（如：font-size、font-weight）

以下是几种常用的命名格式供参考：
- camelCase -> twoWords
- constantCase -> TWO_WORDS
- kebabCase -> two-words
- pascalCase -> TwoWords
- pascalSnakeCase -> Two_Words
- snakeCase -> two_words
- trainCase -> Two-Words
- capitalCase -> Two Words
- sentenceCase -> Two words

{% callout title="在导出变量时，Varibales Xporter 会自动将变量名统一转换为符合规范的格式：" %}
  - Tailwind CSS 配置文件：使用 camelCase 格式（如：fontSize、fontWeight）
  - CSS 变量：使用 kebab-case 格式（如：font-size、font-weight）
{% /callout %}

---

## 分组原则
合理的变量分组能大大提升工作效率。我们建议使用 `/` 符号来组织变量层级，就像管理文件系统一样：

想象一下，如果把所有文件都堆在电脑的根目录里，查找起来会有多麻烦。同样的道理，我们也需要给变量创建清晰的层级结构：

{% file-tree %}
  {% folder name="colors" %}
    {% file name="primary" /%}
    {% file name="secondary" /%}
    {% file name="tertiary" /%}
    {% file name="..." /%}
  {% /folder %}
{% /file-tree %}

这分别对应以下 Figma 中的变量：

- `colors/primary`
- `colors/secondary`
- `colors/tertiary`

### 使用默认值组织变量层级
在设计系统中，`DEFAULT` 关键字具有双重作用：一方面它可以设置默认值，更重要的是，它能够统一相同层级变量的级别，使得变量管理更加清晰和系统化。让我们来看一个具体的例子：

- `colors/primary`
- `colors/primary/foreground`

仅这样命名有时是不够的，我们依然用文件管理的方式来思考，例如：

{% file-tree %}
  {% folder name="colors" %}
    {% file name="primary" /%}
    {% folder name="primary" %}
      {% file name="foreground" /%}
    {% /folder %}
  {% /folder %}
{% /file-tree %}

这里我们遇到了一个有趣的挑战：虽然从逻辑上来说，`colors/primary` 和 `colors/primary/foreground` 这两个变量应该在同一个目录下，但实际上它们却分散在不同的位置。让我们看看在 Figma 中的表现：


{% figure className="mt-6" src="/organizing-your-variables/organizing-your-variables-1.png" alt="在 colors -> primary 目录中找不到 `colors/primary` 变量" caption="在 colors -> primary 目录中找不到 `colors/primary` 变量" /%}

如果需要找到 `colors/primary` 这个变量，需要到 colors 目录下，然后才能看到 `colors/primary` 这个变量：

{% figure className="mt-6" src="/organizing-your-variables/organizing-your-variables-2.png" alt="在 colors 目录中找到 `colors/primary` 变量" caption="在 colors 目录中找到 `colors/primary` 变量" /%}

想想当我们的变量变得越来越多时，要想找到 `colors/primary` 这个变量，会变得更麻烦，**因为我们无法依靠左边栏快速定位，而是要在 colors 这个目录下寻找**。
这种情况不仅影响我们的工作效率，更重要的是，当我们尝试将这个结构转换为 Tailwind CSS 配置时，会遇到一个技术限制：JavaScript 对象不允许同名键同时作为值和对象使用。让我们看看具体的问题：

```ts 
// @errors: 1117
export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--colors-primary)', // 错误：同名键同时作为值和对象使用
        primary: {
          foreground: 'var(--colors-primary-foreground)',
        },
      },
    },
  },
  plugins: [],
};

```

不过别担心，Tailwind CSS 为我们提供了一个优雅的解决方案 —— 使用 `DEFAULT` 关键字：
```ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--colors-primary)', // 使用 DEFAULT 关键字
          foreground: 'var(--colors-primary-foreground)',
        },
      },
    },
  },
  plugins: [],
};
```
最棒的是，在实际使用时，你完全不需要写出 `DEFAULT` 这个关键字。Tailwind CSS 会自动处理这个细节，让你的代码保持简洁：

```html
<div class="text-primary">
  <p>你好，世界！</p>
</div>
```

有了这个技巧，我们就可以在 Figma 中优雅地组织我们的变量了。只需要使用 `DEFAULT` 作为默认值的标记：

- `colors/primary/DEFAULT` - 主色调的默认值
- `colors/primary/foreground` - 主色调上的文字颜色

他们便会出现在同一个目录下：

{% figure className="mt-6" src="/organizing-your-variables/organizing-your-variables-3.png" alt="用默认值组织变量层级" caption="用默认值组织变量层级" /%}

