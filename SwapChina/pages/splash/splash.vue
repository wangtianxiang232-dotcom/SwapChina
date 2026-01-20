<template>
  <view class="splash-container">
    <!-- 核心 Logo 动画 -->
    <view class="logo-wrapper">
      <view class="logo-blur"></view>
      <view class="logo-box">
        S
      </view>
    </view>
    
    <!-- 文字展示 -->
    <view class="text-wrapper">
      <text class="title">SwapChina</text>
      <text class="subtitle">Connecting Global Markets</text>
    </view>

    <!-- 底部加载指示 -->
    <view class="loading-bar">
      <view class="loading-progress"></view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  onLoad() {
    // 2.5秒后跳转到引导页或首页
    setTimeout(() => {
      const hasOnboarded = uni.getStorageSync('has_onboarded')
      if (hasOnboarded) {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      } else {
        uni.reLaunch({
          url: '/pages/onboarding/onboarding'
        })
      }
    }, 2500)
  }
}
</script>

<style lang="scss" scoped>
// @import '../../styles/tokens.scss';
@import '@/styles/mixins.scss';

.splash-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $color-dark-bg-primary;
  @include flex(column, center, center);
  z-index: $z-index-toast;
}

.logo-wrapper {
  position: relative;
  margin-bottom: $spacing-12;
}

.logo-blur {
  position: absolute;
  inset: 0;
  background-color: $color-primary;
  border-radius: $radius-6xl;
  filter: blur(50px);
  opacity: 0.4;
  @include animation(pulse, 4s, $ease-in-out, 0s, infinite);
}

.logo-box {
  width: 224rpx;
  height: 224rpx;
  background: $gradient-blue;
  border-radius: $radius-6xl;
  @include flex(row, center, center);
  color: #fff;
  @include text-style($font-size-6xl, $font-weight-black, #fff);
  font-style: italic;
  box-shadow: $shadow-primary-lg;
  position: relative;
  z-index: $z-index-base;
  @include animation(zoomIn, 1s, $ease-out);
}

.text-wrapper {
  @include flex(column, flex-start, center, $spacing-3);
  @include animation(fadeInUp, 1s, $ease-out, 0.5s, 1, both);
}

.title {
  @include text-style($font-size-5xl, $font-weight-black, #fff);
  letter-spacing: $letter-spacing-tighter;
  text-transform: uppercase;
}

.subtitle {
  @include text-style($font-size-base, $font-weight-bold, #60a5fa);
  letter-spacing: 0.4em;
  text-transform: uppercase;
}

.loading-bar {
  position: absolute;
  bottom: 160rpx;
  width: 384rpx;
  height: 2rpx;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2rpx;
  overflow: hidden;
}

.loading-progress {
  height: 100%;
  background-color: $color-primary;
  @include animation(loading, 2.5s, $ease-in-out);
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes zoomIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    transform: translateY(64rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes loading {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}
</style>

