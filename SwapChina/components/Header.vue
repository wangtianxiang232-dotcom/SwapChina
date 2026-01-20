<template>
  <header 
    class="custom-header" 
    :class="{ 'dark': theme === 'dark' }"
    :style="{ paddingTop: statusBarHeight > 0 ? `${statusBarHeight + 10}px` : '20rpx' }"
  >
    <view class="header-left" @tap="handleLogoClick">
      <view class="logo-box">
        <text class="logo-text">S</text>
      </view>
      <view class="logo-text-wrapper">
        <text class="logo-title">SwapChina</text>
        <text class="logo-subtitle">TEST MODE TOGGLE</text>
      </view>
    </view>
    <view class="header-right">
      <view class="icon-btn">
        <view class="icon-wrapper" @tap.stop="goToMessages">
          <Icon name="Bell" class="icon" :size="36"  style="color: #e6f1f6;" />
        </view>
        <view v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</view>
      </view>
      <view class="avatar-box" @tap="handleAvatarClick">
        <image class="avatar" :src="userAvatar" mode="aspectFill" />
        <view class="avatar-overlay">
          <Icon name="Camera" class="camera-icon" />
        </view>
      </view>
    </view>
  </header>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import store from '@/store/index.js'
import { showToast, toggleBalance } from '@/store/index.js'
import Icon from '@/components/Icon.vue'

// 定义 emits
const emit = defineEmits(['balance-changed'])

// 响应式数据
const theme = ref('light')
const userAvatar = ref('')
const unreadCount = ref(0)
const statusBarHeight = ref(0) // 状态栏高度

// 初始化数据
const initData = () => {
  theme.value = uni.getStorageSync('theme') || 'light'
  userAvatar.value = store.userAvatar || 'https://picsum.photos/seed/user-main/100/100'
  unreadCount.value = store.unreadCount || 0
  
  // 获取状态栏高度（APP 端需要）
  // #ifdef APP-PLUS
  try {
    const systemInfo = uni.getSystemInfoSync()
    statusBarHeight.value = systemInfo.statusBarHeight || 0
  } catch (e) {
    statusBarHeight.value = 0
  }
  // #endif
  
  // #ifndef APP-PLUS
  // H5 端不需要状态栏高度
  statusBarHeight.value = 0
  // #endif
}

// 处理 Logo 点击
const handleLogoClick = () => {
  toggleBalance()
  emit('balance-changed', store.balance)
}

// 跳转到消息页面
const goToMessages = () => {
  uni.navigateTo({
    url: '/pages/messages/messages'
  })
}

// 处理头像点击
const handleAvatarClick = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      userAvatar.value = res.tempFilePaths[0]
      store.userAvatar = res.tempFilePaths[0]
      showToast('头像更新成功', 'success')
    }
  })
}

// 监听 store 变化
watch(() => store.userAvatar, (newVal) => {
  userAvatar.value = newVal
}, { immediate: true })

watch(() => store.unreadCount, (newVal) => {
  unreadCount.value = newVal
}, { immediate: true })

watch(() => store.theme, (newVal) => {
  theme.value = newVal
}, { immediate: true })

// 生命周期
onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>

@import '@/styles/mixins.scss';

.custom-header {
  @include flex(row, space-between, center);
  padding: $spacing-4 $spacing-5;
  @include glass(rgba(255, 255, 255, 0.95), $blur-md);
  border-bottom: 1rpx solid $color-border;
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 896rpx;
  z-index: $z-index-fixed;
  box-sizing: border-box;
  pointer-events: none; // 非交互区域不拦截点击事件
  
  @include dark-mode {
    background-color: rgba(15, 23, 42, 0.95);
    border-bottom-color: $color-dark-border;
  }
}

.header-left {
  @include flex(row, flex-start, center, $spacing-2);
  pointer-events: auto;
}

.logo-box {
  width: 64rpx;
  height: 64rpx;
  background: $gradient-blue;
  border-radius: $radius-xl;
  @include flex(row, center, center);
  color: #fff;
  @include text-style($font-size-xl, $font-weight-black, #fff);
  font-style: italic;
  box-shadow: $shadow-primary;
}

.logo-text-wrapper {
  @include flex(column, flex-start, flex-start);
}

.logo-title {
  @include text-style($font-size-xl, $font-weight-black, $color-primary);
  line-height: $line-height-tight;
  
  @include dark-mode {
    color: $color-primary-light;
  }
}

.logo-subtitle {
  @include text-style($font-size-xs, $font-weight-black, $color-text-disabled);
  text-transform: uppercase;
  letter-spacing: $letter-spacing-widest;
  margin-top: 4rpx;
}

.header-right {
  @include flex(row, flex-start, center, $spacing-3);
  margin: 0;
  padding: 0;
  outline: none;
  border: none;
  box-shadow: none;
}

.icon-btn {
  position: relative;
  width: 68rpx;
  height: 68rpx;
  border-radius: $radius-xl;
  @include flex(row, center, center);
  overflow: visible; // badge 需要超出边界
  box-sizing: border-box;
  pointer-events: none; // 按钮区域不拦截点击，只有图标区域响应
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  outline: none;
  border: none;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    border-color: $color-dark-border-light;
  }
}

.icon-wrapper {
  @include flex(row, center, center);
  position: relative;
  width: 36rpx;
  height: 36rpx;
  pointer-events: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  outline: none;
  border: none;
  box-shadow: none;
  
  // APP 端严格限制点击区域
  // #ifdef APP-PLUS
  min-width: 36rpx;
  min-height: 36rpx;
  max-width: 36rpx;
  max-height: 36rpx;
  // #endif
}

.icon {
  font-size: 36rpx;
  color: $color-text-secondary;
  display: block;
  margin: 0;
  padding: 0;
  outline: none;
  border: none;
  box-shadow: none;
  pointer-events: none; // 图标不响应点击，由 wrapper 处理
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 24rpx;
  height: 24rpx;
  background-color: $color-error;
  color: #fff;
  font-size: 16rpx;
  font-weight: $font-weight-bold;
  border-radius: $radius-6xl;
  border: 4rpx solid #fff;
  box-shadow: $shadow-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;
  z-index: 10;
  animation: pulse 2s ease-in-out infinite;
  pointer-events: none; // 防止 badge 扩大点击区域
  
  @include dark-mode {
    border-color: $color-dark-bg-primary;
  }
}

.avatar-box {
  width: 68rpx;
  height: 68rpx;
  border-radius: $radius-xl;
  border: 2rpx solid rgba(37, 99, 235, 0.1);
  overflow: hidden;
  position: relative;
  pointer-events: auto;
  flex-shrink: 0;
  
  .avatar-overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.3);
    opacity: 0;
    @include flex(row, center, center);
    @include transition(opacity, $transition-base);
    pointer-events: none;
  }
  
  &:active .avatar-overlay {
    opacity: 1;
  }
}

.avatar {
  width: 100%;
  height: 100%;
}

.camera-icon {
  font-size: 32rpx;
  color: #fff;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}
</style>

