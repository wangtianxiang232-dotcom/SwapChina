<template>
  <view class="about-container">
    <view class="about-content">
      <text class="about-title">关于我们</text>
      <text class="about-text">SwapChina - 全球数字资产兑换平台</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.about-container {
  min-height: 100vh;
  background-color: $color-bg-page-light;
  padding: $spacing-4;
  
  @include dark-mode {
    background-color: $color-bg-page-dark;
  }
}

.about-content {
  @include flex(column, flex-start, flex-start, $spacing-4);
}

.about-title {
  @include text-style($font-size-3xl, $font-weight-black, $color-text-primary);
}

.about-text {
  @include text-style($font-size-lg, $font-weight-normal, $color-text-secondary);
}
</style>

