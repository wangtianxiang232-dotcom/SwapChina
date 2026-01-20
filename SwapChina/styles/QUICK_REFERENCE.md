# 设计令牌快速参考

## 快速查找

### 颜色

```scss
// 主色
$color-primary          // #2563eb
$color-primary-light    // #3b82f6
$color-primary-dark     // #1e40af

// 文本
$color-text-primary     // #1e293b (浅) / #ffffff (深)
$color-text-secondary   // #64748b (浅) / #cbd5e1 (深)
$color-text-tertiary    // #94a3b8

// 背景
$color-bg-primary       // #ffffff (浅) / #1e293b (深)
$color-bg-secondary     // #f8fafc (浅) / #0f172a (深)
$color-bg-tertiary      // #f1f5f9 (浅) / #334155 (深)

// 功能色
$color-success          // #10b981
$color-error            // #ef4444
$color-warning          // #f59e0b
```

### 字体大小

```scss
$font-size-xs      // 16rpx
$font-size-sm      // 18rpx
$font-size-base    // 20rpx
$font-size-md      // 24rpx
$font-size-lg      // 28rpx
$font-size-xl      // 32rpx
$font-size-2xl     // 36rpx
$font-size-3xl     // 40rpx
$font-size-4xl     // 48rpx
$font-size-5xl     // 60rpx
$font-size-6xl     // 80rpx
```

### 间距

```scss
$spacing-1    // 8rpx
$spacing-2    // 16rpx
$spacing-3    // 24rpx
$spacing-4    // 32rpx
$spacing-5    // 40rpx
$spacing-6    // 48rpx
$spacing-8    // 64rpx
$spacing-10   // 80rpx
$spacing-12   // 96rpx
```

### 圆角

```scss
$radius-sm    // 12rpx
$radius-md    // 16rpx
$radius-lg    // 20rpx
$radius-xl    // 24rpx
$radius-2xl   // 28rpx
$radius-3xl   // 36rpx
$radius-full  // 9999rpx
```

### 阴影

```scss
$shadow-sm        // 小阴影
$shadow-md        // 中等阴影
$shadow-lg        // 大阴影
$shadow-primary   // 主色阴影
$shadow-inner     // 内阴影
```

### 过渡

```scss
$transition-fast   // 0.1s
$transition-base   // 0.2s
$transition-slow   // 0.3s
```

## 常用代码片段

### 基础容器

```scss
.container {
  min-height: 100vh;
  background-color: $color-bg-page-light;
  padding: $spacing-4;
  
  @include dark-mode {
    background-color: $color-bg-page-dark;
  }
}
```

### 卡片

```scss
.card {
  @include card();
}
```

### 按钮

```scss
.btn {
  @include button();
}
```

### 文本

```scss
.title {
  @include text-style($font-size-3xl, $font-weight-black, $color-text-primary);
}

.subtitle {
  @include text-style($font-size-lg, $font-weight-bold, $color-text-secondary);
}
```

### Flex 布局

```scss
.flex-row {
  @include flex(row, space-between, center, $spacing-4);
}

.flex-col {
  @include flex(column, flex-start, flex-start, $spacing-4);
}
```

### 输入框

```scss
.input {
  @include input();
}
```

## 深色模式

```scss
.element {
  color: $color-text-primary;
  
  @include dark-mode {
    color: $color-dark-text-primary;
  }
}
```

## 状态徽章

```scss
.badge-success {
  @include badge($color-success-bg, $color-success-text);
}

.badge-error {
  @include badge($color-error-bg, $color-error-text);
}
```

