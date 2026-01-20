<template>
  <button
    :class="[
      'btn',
      `btn-${type}`,
      `btn-${size}`,
      {
        'btn-full-width': fullWidth,
        'btn-disabled': disabled || loading,
        'btn-loading': loading
      }
    ]"
    :disabled="disabled || loading"
    @tap="handleTap"
  >
    <view v-if="loading" class="btn-loading-icon">
      <view class="btn-loading-spinner" :style="{ borderColor: loadingColor }"></view>
    </view>
    <view v-else-if="icon && !$slots.default" class="btn-icon">
      <Icon :name="icon" :size="computedIconSize" :style="{ color: iconColor }" />
    </view>
    <text v-if="text && !$slots.default" class="btn-text">
      {{ text }}
    </text>
    <view v-if="$slots.default && !text" class="btn-slot">
      <slot></slot>
    </view>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  // 按钮类型：primary, secondary, outline, ghost, text
  type: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'ghost', 'text'].includes(value)
  },
  // 按钮尺寸：small, medium, large
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  // 按钮文字
  text: {
    type: String,
    default: ''
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 是否全宽
  fullWidth: {
    type: Boolean,
    default: false
  },
  // 图标名称
  icon: {
    type: String,
    default: ''
  },
  // 图标大小
  iconSize: {
    type: Number,
    default: 0 // 0表示使用默认大小
  }
})

const emit = defineEmits(['tap', 'click'])

// 计算图标大小
const computedIconSize = computed(() => {
  if (props.iconSize > 0) return props.iconSize
  const sizeMap = {
    small: 32,
    medium: 36,
    large: 42
  }
  return sizeMap[props.size] || 36
})


// 计算图标颜色
const iconColor = computed(() => {
  const colorMap = {
    primary: '#fff',
    secondary: '#2563eb',
    outline: '#2563eb',
    ghost: '#2563eb',
    text: '#2563eb'
  }
  return colorMap[props.type] || '#fff'
})

// 计算加载图标颜色
const loadingColor = computed(() => {
  const colorMap = {
    primary: '#fff',
    secondary: '#2563eb',
    outline: '#2563eb',
    ghost: '#2563eb',
    text: '#2563eb'
  }
  return colorMap[props.type] || '#fff'
})

const handleTap = (e) => {
  if (props.disabled || props.loading) return
  emit('tap', e)
  emit('click', e)
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  font-family: inherit;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  
  &::after {
    border: none !important;
    display: none !important;
  }
  
  &::before {
    border: none !important;
    display: none !important;
  }
  
  // 尺寸样式
  &.btn-small {
    padding: 16rpx 32rpx;
    border-radius: 24rpx;
    @include text-style(24rpx, $font-weight-medium);
    min-height: 64rpx;
    height: 64rpx;
  }
  
  &.btn-medium {
    padding: 20rpx 40rpx;
    border-radius: 32rpx;
    @include text-style(26rpx, $font-weight-bold);
    min-height: 80rpx;
    height: 80rpx;
  }
  
  &.btn-large {
    padding: 24rpx 48rpx;
    border-radius: 40rpx;
    @include text-style(28rpx, $font-weight-bold);
    min-height: 96rpx;
    height: 96rpx;
  }
  
  // 全宽
  &.btn-full-width {
    width: 100%;
  }
  
  // 主要按钮 - 蓝色背景，白色文字
  &.btn-primary {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #312e81 100%);
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.25);
    
    &:active:not(.btn-disabled) {
      transform: scale(0.98);
      box-shadow: 0 4rpx 16rpx rgba(37, 99, 235, 0.2);
    }
    
    @include dark-mode {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
    }
  }
  
  // 次要按钮 - 白色背景，蓝色文字
  &.btn-secondary {
    background-color: #fff;
    color: $color-primary;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    
    &:active:not(.btn-disabled) {
      transform: scale(0.98);
      background-color: rgba(37, 99, 235, 0.05);
    }
    
    @include dark-mode {
      background-color: $color-dark-bg-secondary;
      color: $color-primary-light;
    }
  }
  
  // 轮廓按钮 - 透明背景，蓝色边框
  &.btn-outline {
    background-color: transparent;
    color: $color-primary;
    border: 2rpx solid $color-primary;
    
    &:active:not(.btn-disabled) {
      transform: scale(0.98);
      background-color: rgba(37, 99, 235, 0.05);
    }
    
    @include dark-mode {
      border-color: $color-primary-light;
      color: $color-primary-light;
    }
  }
  
  // 幽灵按钮 - 透明背景，无边框
  &.btn-ghost {
    background-color: rgba(37, 99, 235, 0.05);
    color: $color-primary;
    
    &:active:not(.btn-disabled) {
      transform: scale(0.98);
      background-color: rgba(37, 99, 235, 0.1);
    }
    
    @include dark-mode {
      background-color: rgba(37, 99, 235, 0.1);
      color: $color-primary-light;
    }
  }
  
  // 文本按钮 - 纯文本样式
  &.btn-text {
    background-color: transparent;
    color: $color-primary;
    padding: 12rpx 24rpx;
    
    &:active:not(.btn-disabled) {
      opacity: 0.7;
    }
    
    @include dark-mode {
      color: $color-primary-light;
    }
  }
  
  // 禁用状态
  &.btn-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:active {
      transform: none !important;
    }
  }
  
  // 加载状态
  &.btn-loading {
    cursor: wait;
    
    .btn-loading-icon {
      animation: rotate 1s linear infinite;
    }
  }
  
  .btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .btn-text {
    flex: 1;
    text-align: center;
    white-space: nowrap;
  }
  
  .btn-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    width: 100%;
    gap: inherit;
  }
  
  .btn-loading-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .btn-loading-spinner {
    width: 28rpx;
    height: 28rpx;
    border: 3rpx solid;
    border-top-color: transparent;
    border-right-color: transparent;
    border-radius: 50%;
    animation: rotate 0.8s linear infinite;
  }
  
  &.btn-small .btn-loading-spinner {
    width: 24rpx;
    height: 24rpx;
    border-width: 2rpx;
  }
  
  &.btn-large .btn-loading-spinner {
    width: 32rpx;
    height: 32rpx;
    border-width: 4rpx;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

