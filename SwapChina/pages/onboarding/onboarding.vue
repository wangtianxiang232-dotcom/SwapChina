<template>
  <view class="onboarding-container" :class="{'dark': theme === 'dark'}">
    <view class="skip-btn" @tap="finish">
      <text class="skip-text">Skip</text>
    </view>

    <view class="content-wrapper">
      <view class="icon-box" :class="slides[current].color">
        <text class="icon-text">{{ slides[current].icon }}</text>
      </view>

      <view class="text-content">
        <text class="subtitle">{{ slides[current].subtitle }}</text>
        <text class="title">{{ slides[current].title }}</text>
        <text class="desc">{{ slides[current].desc }}</text>
      </view>
    </view>

    <view class="footer">
      <view class="dots">
        <view 
          v-for="(slide, index) in slides" 
          :key="index"
          class="dot"
          :class="{'active': current === index}"
        ></view>
      </view>

      <button class="next-btn" @tap="next">
        {{ current === slides.length - 1 ? '立即开启' : '继续下一步' }}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      current: 0,
      theme: 'light',
      slides: [
        {
          title: "极速全球换汇",
          subtitle: "GLOBAL EXCHANGE",
          desc: "覆盖中、欧、非各大主流币种，法币与数字货币实时锁价，极速到账。",
          color: "bg-blue",
          icon: "💱"
        },
        {
          title: "安全合规保障",
          subtitle: "SECURE & COMPLIANT",
          desc: "多重身份认证，全链路加密传输，您的每一笔资产都在平台的严密保护下。",
          color: "bg-indigo",
          icon: "🛡️"
        },
        {
          title: "全天候专业支持",
          subtitle: "24/7 SUPPORT",
          desc: "无论是深夜还是凌晨，我们的专业客服团队随时为您解决跨境交易中的难题。",
          color: "bg-dark",
          icon: "🔔"
        }
      ]
    }
  },
  onLoad() {
    this.theme = uni.getStorageSync('theme') || 'light'
  },
  methods: {
    next() {
      if (this.current < this.slides.length - 1) {
        this.current++
      } else {
        this.finish()
      }
    },
    finish() {
      uni.setStorageSync('has_onboarded', 'true')
      uni.reLaunch({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.onboarding-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $color-bg-primary;
  @include flex(column);
  transition: background-color $transition-slower;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
  }
}

.skip-btn {
  padding: 64rpx;
  display: flex;
  justify-content: flex-end;
}

.skip-text {
  @include text-style($font-size-md, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: $letter-spacing-widest;
}

.content-wrapper {
  flex: 1;
  @include flex(column, center, center);
  padding: $spacing-8;
  gap: $spacing-12;
}

.icon-box {
  width: 256rpx;
  height: 256rpx;
  border-radius: $radius-6xl;
  @include flex(row, center, center);
  box-shadow: $shadow-primary-lg;
  @include animation(zoomIn, 0.5s, $ease-out);
  
  &.bg-blue {
    background-color: $color-primary;
  }
  
  &.bg-indigo {
    background-color: #4f46e5;
  }
  
  &.bg-dark {
    background-color: $color-dark-bg-secondary;
  }
}

.icon-text {
  font-size: 128rpx;
}

.text-content {
  @include flex(column, flex-start, center, $spacing-4);
  @include animation(fadeInUp, 0.7s, $ease-out);
}

.subtitle {
  @include text-style($font-size-base, $font-weight-bold, $color-primary);
  letter-spacing: $letter-spacing-ultra;
  text-transform: uppercase;
}

.title {
  @include text-style($font-size-5xl, $font-weight-black, $color-text-primary);
  letter-spacing: $letter-spacing-tighter;
  text-align: center;
  
  @include dark-mode {
    color: #fff;
  }
}

.desc {
  @include text-style($font-size-lg, $font-weight-normal, $color-text-secondary);
  line-height: $line-height-relaxed;
  text-align: center;
  max-width: 600rpx;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.footer {
  padding: $spacing-12 $spacing-6;
  @include flex(column, flex-start, center, 80rpx);
}

.dots {
  @include flex(row, flex-start, center, $spacing-2);
}

.dot {
  height: 6rpx;
  width: 8rpx;
  border-radius: 3rpx;
  background-color: $color-border;
  @include transition(all, $transition-slow);
  
  @include dark-mode {
    background-color: $color-dark-border;
  }
  
  &.active {
    width: 64rpx;
    background-color: $color-primary;
  }
}

.next-btn {
  width: 100%;
  max-width: 600rpx;
  @include button($color-primary, #fff, $radius-5xl);
  padding: $spacing-5;
  box-shadow: $shadow-primary-lg;
  @include text-style($font-size-xl, $font-weight-black, #fff);
  text-transform: uppercase;
  letter-spacing: $letter-spacing-widest;
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
</style>

