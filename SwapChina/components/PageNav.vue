<template>
  <view class="page-nav">
    <view class="nav-back" @tap="handleBack">
      <Icon name="ChevronRight" :size="40" :style="{ transform: 'rotate(180deg)' }" />
    </view>
    <text class="nav-title">{{ title }}</text>
  </view>
</template>

<script setup>
import { defineProps } from 'vue'
import Icon from '@/components/Icon.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  }
})

const handleBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.page-nav {
  background-color: rgba(255, 255, 255, 0.95); // bg-white
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-bottom: 1rpx solid $color-border-light; // border-b border-slate-100
  padding: 32rpx 40rpx; // p-4
  @include flex(row, flex-start, center, 32rpx); // flex items-center gap-4
  box-sizing: border-box;
  position: sticky;
  top: var(--header-height);
  z-index: 99;
  
  @include dark-mode {
    background-color: rgba(15, 23, 42, 0.95); // dark:bg-slate-900
    border-bottom-color: rgba(30, 41, 59, 0.5); // dark:border-slate-800/50
  }
}

.nav-back {
  padding: 20rpx; // p-2.5
  background-color: $color-bg-tertiary; // bg-slate-50
  border-radius: 24rpx; // rounded-2xl
  @include flex(row, center, center);
  border: 1rpx solid $color-border-light;
  transition: all 0.2s;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary; // dark:bg-slate-800
    border-color: $color-dark-border-light; // dark:border-slate-700
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.nav-title {
  @include text-style($font-size-2xl, $font-weight-black, $color-text-primary); // text-2xl font-black
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  @include dark-mode {
    color: #fff; // dark:text-white
  }
}
</style>

