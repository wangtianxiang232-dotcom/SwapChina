<template>
  <view class="password-container">
    <view class="password-content">
      <text class="password-title">修改登录密码</text>
      <view class="form-section">
        <view class="input-wrapper">
          <text class="input-label">旧密码</text>
          <input type="password" placeholder="请输入旧密码" class="form-input" />
        </view>
        <view class="input-wrapper">
          <text class="input-label">新密码</text>
          <input type="password" placeholder="请输入新密码" class="form-input" />
        </view>
        <view class="input-wrapper">
          <text class="input-label">确认新密码</text>
          <input type="password" placeholder="请再次输入新密码" class="form-input" />
        </view>
        <button class="submit-btn">确认修改</button>
      </view>
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

.password-container {
  min-height: 100vh;
  background-color: $color-bg-page-light;
  padding: $spacing-4;
  
  @include dark-mode {
    background-color: $color-bg-page-dark;
  }
}

.password-content {
  @include flex(column, flex-start, flex-start, $spacing-6);
}

.password-title {
  @include text-style($font-size-3xl, $font-weight-black, $color-text-primary);
}

.form-section {
  @include flex(column, flex-start, flex-start, $spacing-4);
}

.input-wrapper {
  @include flex(column, flex-start, flex-start, 12rpx);
}

.input-label {
  @include text-style($font-size-base, $font-weight-bold, $color-text-secondary);
  text-transform: uppercase;
}

.form-input {
  @include input($color-bg-primary, $color-border);
}

.submit-btn {
  margin-top: $spacing-4;
  padding: $spacing-4;
  @include button();
}
</style>

