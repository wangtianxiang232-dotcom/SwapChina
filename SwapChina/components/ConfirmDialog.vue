<template>
  <view v-if="visible" class="confirm-overlay" @tap="handleCancel">
    <view class="confirm-content" @tap.stop>
      <text class="confirm-title">{{ title }}</text>
      <text class="confirm-message">{{ message }}</text>
      <view class="confirm-buttons">
        <button class="confirm-cancel-btn" @tap="handleCancel">{{ cancelText }}</button>
        <button class="confirm-ok-btn" @tap="handleConfirm">{{ confirmText }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { watch, onUnmounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认操作'
  },
  message: {
    type: String,
    default: '确定要执行此操作吗？'
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmColor: {
    type: String,
    default: '#ef4444' // 默认红色
  }
})

const emit = defineEmits(['confirm', 'cancel', 'update:visible'])

const handleConfirm = () => {
  emit('confirm')
  emit('update:visible', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

// 监听页面隐藏事件，自动关闭对话框
const handlePageHide = () => {
  if (props.visible) {
    emit('update:visible', false)
  }
}

// 监听页面显示事件，确保对话框状态正确
const handlePageShow = () => {
  // 页面显示时，如果对话框应该显示，确保状态同步
  // 这里不需要特殊处理，因为 visible prop 会控制显示
}

// 监听 visible 变化，确保页面切换时关闭
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    // 对话框关闭时，确保清理状态
    return
  }
})

// 组件卸载时确保关闭
onBeforeUnmount(() => {
  if (props.visible) {
    emit('update:visible', false)
  }
})

onUnmounted(() => {
  if (props.visible) {
    emit('update:visible', false)
  }
})

// 监听 uni-app 页面生命周期
// #ifdef APP-PLUS || H5
if (typeof uni !== 'undefined') {
  // 监听页面隐藏
  uni.onPageHide && uni.onPageHide(() => {
    handlePageHide()
  })
  
  // 监听页面显示
  uni.onPageShow && uni.onPageShow(() => {
    handlePageShow()
  })
}
// #endif

</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1200;
  @include flex(row, center, center);
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(8rpx);
  -webkit-backdrop-filter: blur(8rpx);
  animation: fadeIn 0.2s ease;
}

.confirm-content {
  width: 640rpx;
  max-width: 90vw;
  background-color: #fff;
  border-radius: 32rpx;
  padding: 64rpx 48rpx 48rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
  @include flex(column, flex-start, center);
  animation: slideUp 0.3s ease;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
  }
}

.confirm-title {
  @include text-style(36rpx, $font-weight-bold, $color-text-primary);
  margin-bottom: 32rpx;
  text-align: center;
  width: 100%;
  
  @include dark-mode {
    color: #fff;
  }
}

.confirm-message {
  @include text-style(28rpx, $font-weight-normal, $color-text-secondary);
  margin-bottom: 48rpx;
  text-align: center;
  line-height: 1.6;
  width: 100%;
  
  @include dark-mode {
    color: $color-dark-text-secondary;
  }
}

.confirm-buttons {
  width: 100%;
  @include flex(row, space-between, center);
  gap: 24rpx;
}

.confirm-cancel-btn,
.confirm-ok-btn {
  flex: 1;
  padding: 24rpx 0;
  height: auto;
  border-radius: 24rpx;
  @include text-style(28rpx, $font-weight-bold, #fff);
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  transition: all 0.2s;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  &::after {
    border: none !important;
    display: none !important;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.confirm-cancel-btn {
  background-color: $color-bg-tertiary;
  color: $color-text-primary;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    color: #fff;
  }
}

.confirm-ok-btn {
  background-color: #ef4444;
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(239, 68, 68, 0.3);
  
  &:active {
    background-color: #dc2626;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(40rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

