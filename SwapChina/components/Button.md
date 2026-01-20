# Button 按钮组件

通用的按钮组件，提供多种样式和尺寸，符合平台设计规范。

## 基本用法

```vue
<template>
  <!-- 主要按钮 -->
  <Button type="primary" text="登录" @tap="handleLogin" />
  
  <!-- 次要按钮 -->
  <Button type="secondary" text="取消" @tap="handleCancel" />
  
  <!-- 轮廓按钮 -->
  <Button type="outline" text="了解更多" @tap="handleMore" />
  
  <!-- 幽灵按钮 -->
  <Button type="ghost" text="一键登录" @tap="handleOneClick" />
  
  <!-- 文本按钮 -->
  <Button type="text" text="获取验证码" @tap="handleGetCode" />
</template>

<script setup>
import Button from '@/components/Button.vue'
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| type | 按钮类型 | String | `primary` | `primary`, `secondary`, `outline`, `ghost`, `text` |
| size | 按钮尺寸 | String | `medium` | `small`, `medium`, `large` |
| text | 按钮文字 | String | `''` | - |
| disabled | 是否禁用 | Boolean | `false` | - |
| loading | 是否加载中 | Boolean | `false` | - |
| fullWidth | 是否全宽 | Boolean | `false` | - |
| icon | 图标名称 | String | `''` | - |
| iconSize | 图标大小 | Number | `0` (自动) | - |

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| tap | 点击事件 | event |
| click | 点击事件（同tap） | event |

## 样式类型

### primary - 主要按钮
蓝色背景，白色文字，带阴影效果。用于主要操作。

```vue
<Button type="primary" text="确认" />
```

### secondary - 次要按钮
白色背景，蓝色文字，带阴影效果。用于次要操作。

```vue
<Button type="secondary" text="取消" />
```

### outline - 轮廓按钮
透明背景，蓝色边框和文字。用于次要操作，更轻量。

```vue
<Button type="outline" text="了解更多" />
```

### ghost - 幽灵按钮
浅蓝色背景，蓝色文字。用于辅助操作。

```vue
<Button type="ghost" text="一键登录" />
```

### text - 文本按钮
纯文本样式，无背景和边框。用于链接式操作。

```vue
<Button type="text" text="获取验证码" />
```

## 尺寸

### small - 小尺寸
```vue
<Button size="small" text="小按钮" />
```

### medium - 中等尺寸（默认）
```vue
<Button size="medium" text="中等按钮" />
```

### large - 大尺寸
```vue
<Button size="large" text="大按钮" />
```

## 使用插槽

```vue
<Button type="primary">
  <text>自定义内容</text>
</Button>
```

## 带图标

```vue
<!-- 使用图标 -->
<Button type="primary" icon="Deposit" text="充值" />

<!-- 自定义图标大小 -->
<Button type="primary" icon="Exchange" :iconSize="40" text="兑换" />
```

## 加载状态

```vue
<Button type="primary" :loading="isLoading" text="提交" />
```

## 禁用状态

```vue
<Button type="primary" :disabled="true" text="不可点击" />
```

## 全宽按钮

```vue
<Button type="primary" fullWidth text="全宽按钮" />
```

## 完整示例

```vue
<template>
  <view class="button-demo">
    <!-- 主要按钮 -->
    <Button 
      type="primary" 
      size="large"
      fullWidth
      :loading="isSubmitting"
      :disabled="!canSubmit"
      @tap="handleSubmit"
    >
      提交订单
    </Button>
    
    <!-- 带图标的按钮 -->
    <Button 
      type="secondary" 
      icon="Deposit" 
      text="立即充值"
      @tap="goToDeposit"
    />
    
    <!-- 文本按钮 -->
    <Button 
      type="text" 
      text="获取验证码"
      :disabled="countdown > 0"
      @tap="handleGetCode"
    >
      {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
    </Button>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import Button from '@/components/Button.vue'

const isSubmitting = ref(false)
const canSubmit = ref(true)
const countdown = ref(0)

const handleSubmit = () => {
  isSubmitting.value = true
  // ... 提交逻辑
}

const handleGetCode = () => {
  countdown.value = 60
  // ... 获取验证码逻辑
}
</script>
```

