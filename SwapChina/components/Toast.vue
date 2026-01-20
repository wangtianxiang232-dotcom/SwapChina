<template>
  <view v-if="visible" class="toast-container" :class="{ 
    'toast-error': type === 'error', 
    'toast-success': type === 'success',
    'toast-warning': type === 'warning',
    'toast-info': type === 'info'
  }">
    <view class="toast-content">
      <view class="toast-icon-wrapper" v-if="iconName">
        <Icon :name="iconName" class="toast-icon" :size="80" style="color: #fff;" />
      </view>
      <text class="toast-message">{{ message }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, computed, onBeforeUnmount, onUnmounted } from 'vue'
import Icon from '@/components/Icon.vue'

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'none' // 'success' | 'error' | 'warning' | 'info' | 'none'
  },
  duration: {
    type: Number,
    default: 2000
  }
})

// 根据类型获取图标名称
const iconName = computed(() => {
  const iconMap = {
    success: 'CheckCircle',
    error: 'XCircle',
    warning: 'ExclamationCircle',
    info: 'InformationCircle',
    none: null
  }
  return iconMap[props.type] || null
})

const visible = ref(false)
let timer = null

const show = () => {
  // 先清除之前的定时器
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  
  // 确保先隐藏再显示，避免状态混乱
  visible.value = false
  
  // 使用 nextTick 确保 DOM 更新后再显示
  setTimeout(() => {
    visible.value = true
    
    // 设置自动隐藏定时器
    timer = setTimeout(() => {
      visible.value = false
      timer = null
    }, props.duration)
  }, 50)
}

const hide = () => {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// 监听页面隐藏事件，自动关闭 Toast
const handlePageHide = () => {
  hide()
}

watch(() => props.message, (newVal, oldVal) => {
  if (newVal && newVal.trim()) {
    // 如果消息有值，显示 Toast
    show()
  } else {
    // 如果消息为空，立即隐藏
    hide()
  }
}, { immediate: true })

// 同时监听 type 变化，确保类型变化时也能正确显示
watch(() => props.type, () => {
  if (props.message && props.message.trim()) {
    show()
  }
})

// 组件卸载时确保关闭
onBeforeUnmount(() => {
  hide()
})

onUnmounted(() => {
  hide()
  // 确保清理所有定时器
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
})

// 监听 uni-app 页面生命周期
// #ifdef APP-PLUS || H5
if (typeof uni !== 'undefined') {
  // 监听页面隐藏
  uni.onPageHide && uni.onPageHide(() => {
    handlePageHide()
  })
  
  // 监听页面显示，确保页面切换回来时状态正确
  uni.onPageShow && uni.onPageShow(() => {
    // 如果 message 为空，确保隐藏
    if (!props.message || !props.message.trim()) {
      hide()
    }
  })
}
// #endif

defineExpose({
  show,
  hide
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';

.toast-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  pointer-events: none;
  max-width: 90%;
  min-width: 200rpx;
}

.toast-content {
  background-color: rgba(0, 0, 0, 0.75);
  color: #fff;
  width: 100%;
  padding: 24rpx 40rpx;
  border-radius: 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  @include flex(row, center, center, 16rpx);
}

.toast-icon-wrapper {
  flex-shrink: 0;
  @include flex(row, center, center);
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
}

.toast-icon {
  font-size: 40rpx;
  color: #fff;
}

.toast-error .toast-content {
  background-color: rgba(239, 68, 68, 0.85) !important;
}

.toast-success .toast-content {
  background-color: rgba(16, 185, 129, 0.85) !important;
  box-shadow: 0 8rpx 32rpx rgba(16, 185, 129, 0.3);
  
  .toast-icon-wrapper {
    background-color: rgba(255, 255, 255, 0.25);
  }
}

.toast-warning .toast-content {
  background-color: rgba(245, 158, 11, 0.85) !important;
}

.toast-info .toast-content {
  background-color: rgba(59, 130, 246, 0.85) !important;
}

.toast-message {
  font-size: 28rpx;
  line-height: 1.5;
  text-align: center;
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
  flex: 1;
}
</style>

