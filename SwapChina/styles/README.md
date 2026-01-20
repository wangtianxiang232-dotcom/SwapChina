# SwapChina 设计令牌系统使用指南

## 概述

设计令牌系统统一管理项目的颜色、字体、间距、圆角等设计规范，确保整个应用的设计一致性。

## 文件结构

```
styles/
├── tokens.scss    # 设计令牌定义（颜色、字体、间距等）
├── mixins.scss    # SCSS 混入函数（常用样式组合）
└── README.md      # 使用文档
```

## 使用方法

### 1. 在页面中引入令牌

```vue
<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.my-component {
  // 使用令牌变量
  background-color: $color-bg-primary;
  color: $color-text-primary;
  padding: $spacing-4;
  border-radius: $radius-xl;
  
  // 使用深色模式混入
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    color: $color-dark-text-primary;
  }
}
</style>
```

### 2. 使用混入函数

```vue
<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.card {
  // 使用卡片混入
  @include card();
}

.button {
  // 使用按钮混入
  @include button();
}

.text {
  // 使用文本样式混入
  @include text-style($font-size-lg, $font-weight-bold, $color-text-primary);
}

.container {
  // 使用 Flex 布局混入
  @include flex(row, space-between, center, $spacing-4);
}
</style>
```

## 令牌分类

### 颜色令牌

#### 主色调
- `$color-primary`: 主色 (#2563eb)
- `$color-primary-light`: 浅主色
- `$color-primary-dark`: 深主色
- `$color-primary-bg`: 主色背景

#### 功能色
- `$color-success`: 成功色
- `$color-error`: 错误色
- `$color-warning`: 警告色
- `$color-info`: 信息色

#### 文本颜色
- `$color-text-primary`: 主要文本
- `$color-text-secondary`: 次要文本
- `$color-text-tertiary`: 第三级文本
- `$color-text-disabled`: 禁用文本

#### 背景颜色
- `$color-bg-primary`: 主要背景
- `$color-bg-secondary`: 次要背景
- `$color-bg-tertiary`: 第三级背景
- `$color-bg-page-light`: 页面背景（浅色）
- `$color-bg-page-dark`: 页面背景（深色）

### 字体令牌

#### 字体大小
- `$font-size-xs`: 16rpx
- `$font-size-sm`: 18rpx
- `$font-size-base`: 20rpx
- `$font-size-md`: 24rpx
- `$font-size-lg`: 28rpx
- `$font-size-xl`: 32rpx
- `$font-size-2xl`: 36rpx
- `$font-size-3xl`: 40rpx
- `$font-size-4xl`: 48rpx
- `$font-size-5xl`: 60rpx
- `$font-size-6xl`: 80rpx

#### 字体粗细
- `$font-weight-normal`: 400
- `$font-weight-medium`: 500
- `$font-weight-semibold`: 600
- `$font-weight-bold`: 700
- `$font-weight-extrabold`: 800
- `$font-weight-black`: 900

### 间距令牌

- `$spacing-1`: 8rpx
- `$spacing-2`: 16rpx
- `$spacing-3`: 24rpx
- `$spacing-4`: 32rpx
- `$spacing-5`: 40rpx
- `$spacing-6`: 48rpx
- `$spacing-8`: 64rpx
- `$spacing-10`: 80rpx
- `$spacing-12`: 96rpx
- `$spacing-16`: 128rpx

### 圆角令牌

- `$radius-sm`: 12rpx
- `$radius-md`: 16rpx
- `$radius-lg`: 20rpx
- `$radius-xl`: 24rpx
- `$radius-2xl`: 28rpx
- `$radius-3xl`: 36rpx
- `$radius-full`: 9999rpx

### 阴影令牌

- `$shadow-sm`: 小阴影
- `$shadow-md`: 中等阴影
- `$shadow-lg`: 大阴影
- `$shadow-xl`: 超大阴影
- `$shadow-primary`: 主色阴影
- `$shadow-inner`: 内阴影

### 过渡动画令牌

- `$transition-fast`: 0.1s
- `$transition-base`: 0.2s
- `$transition-slow`: 0.3s
- `$transition-slower`: 0.5s

## 常用混入函数

### dark-mode
深色模式混入

```scss
.element {
  color: $color-text-primary;
  
  @include dark-mode {
    color: $color-dark-text-primary;
  }
}
```

### card
卡片样式混入

```scss
.card {
  @include card();
}
```

### button
按钮样式混入

```scss
.btn {
  @include button();
}
```

### text-style
文本样式混入

```scss
.title {
  @include text-style($font-size-3xl, $font-weight-black, $color-text-primary);
}
```

### flex
Flex 布局混入

```scss
.container {
  @include flex(row, space-between, center, $spacing-4);
}
```

### input
输入框样式混入

```scss
.input {
  @include input();
}
```

## 最佳实践

1. **始终使用令牌变量**：不要硬编码颜色、间距等值
2. **使用混入函数**：对于重复的样式模式，使用混入函数
3. **深色模式支持**：使用 `@include dark-mode` 混入支持深色模式
4. **保持一致性**：使用统一的间距、圆角、字体大小

## 示例

### 完整页面示例

```vue
<template>
  <view class="page-container">
    <view class="card">
      <text class="title">标题</text>
      <text class="content">内容</text>
      <button class="btn-primary">按钮</button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.page-container {
  min-height: 100vh;
  background-color: $color-bg-page-light;
  padding: $spacing-4;
  
  @include dark-mode {
    background-color: $color-bg-page-dark;
  }
}

.card {
  @include card();
  margin-bottom: $spacing-4;
}

.title {
  @include text-style($font-size-3xl, $font-weight-black, $color-text-primary);
  margin-bottom: $spacing-3;
}

.content {
  @include text-style($font-size-lg, $font-weight-normal, $color-text-secondary);
  line-height: $line-height-relaxed;
  margin-bottom: $spacing-4;
}

.btn-primary {
  @include button();
  width: 100%;
}
</style>
```

## 注意事项

1. 确保在 `<style>` 标签中添加 `lang="scss"`
2. 使用 `scoped` 属性避免样式污染
3. 令牌文件会自动被 `uni.scss` 引入，无需在每个页面重复引入
4. 但为了更好的 IDE 提示，建议在页面中显式引入

