<template>
  <view class="login-container" :class="{'dark': theme === 'dark'}">
    <view class="login-content">
      <!-- 返回按钮 -->
      <view class="back-btn" @tap="handleBack">
        <Icon name="ChevronRight" :size="48" :style="{ transform: 'rotate(180deg)', color: '#94a3b8' }" />
      </view>

      <!-- Logo 和标题 -->
      <view class="header-section">
        <view class="logo-wrapper">
          <text class="logo-text">S</text>
        </view>
        <text class="welcome-title">{{ t.auth.welcomeBack }}</text>
        <text class="welcome-subtitle">{{ t.auth.welcomeSubtitle }}</text>
      </view>

      <!-- 邮箱/手机切换 -->
      <view class="mode-switch">
        <button 
          class="mode-btn" 
          :class="{ 'active': mode === 'email' }"
          @tap="mode = 'email'"
        >
          {{ t.auth.email }}
        </button>
        <button 
          class="mode-btn" 
          :class="{ 'active': mode === 'phone' }"
          @tap="mode = 'phone'"
        >
          {{ t.auth.phone }}
        </button>
      </view>

      <!-- 表单区域 -->
      <view class="form-section">
        <!-- 邮箱登录 -->
        <template v-if="mode === 'email'">
          <view class="email-input-wrapper">
            <FormInput
              v-model="formData.email"
              :label="t.auth.email"
              placeholder="example@mail.com"
              type="text"
            />
          </view>
          <view class="password-wrapper">
            <FormInput
              v-model="formData.password"
              :label="t.auth.password"
              placeholder="••••••••"
              :type="showPassword ? 'text' : 'password'"
            />
            <view class="eye-btn" @tap="showPassword = !showPassword">
              <Icon :name="showPassword ? 'EyeSlash' : 'Eye'" :size="40" :style="{ color: '#94a3b8' }" />
            </view>
          </view>
        </template>

        <!-- 手机登录 -->
        <template v-else>
          <view class="phone-row">
            <view class="area-code-wrapper">
              <FormInput
                v-model="formData.areaCode"
                :label="t.auth.areaCode"
                placeholder="+86"
                type="text"
                mono
              />
            </view>
            <view class="phone-wrapper">
              <FormInput
                v-model="formData.phone"
                :label="t.auth.phoneNumber"
                :placeholder="t.auth.enterPhone"
                type="tel"
              />
            </view>
          </view>
          <view class="code-wrapper">
            <FormInput
              v-model="formData.code"
              :label="t.auth.code"
              :placeholder="t.auth.enterCode"
              type="text"
            />
            <Button 
              type="text"
              size="small"
              :text="countdown > 0 ? `${countdown}s` : t.auth.sendCode"
              :disabled="countdown > 0"
              @tap="handleSendCode"
              class="get-code-btn"
            />
          </view>
        </template>

        <!-- 登录按钮 -->
        <Button 
          type="primary"
          size="large"
          fullWidth
          :loading="isLoading"
          :disabled="isLoading"
          :text="isLoading ? t.auth.sendingCode : t.auth.login"
          @tap="handleLogin"
        />

        <!-- 一键登录 -->
        <view class="one-click-wrapper">
          <Button 
            type="ghost"
            size="large"
            fullWidth
            :disabled="isLoading"
            @tap="handleOneClickLogin"
            class="one-click-btn"
          >
            <view class="sim-icon">
              <text class="sim-text">SIM</text>
            </view>
            <text class="one-click-text">{{ t.auth.oneClickLogin }}</text>
          </Button>
        </view>

        <!-- 注册链接 -->
        <view class="footer-link">
          <text class="footer-text">{{ t.auth.noAccount }}</text>
          <text class="link-text" @tap="goToRegister">{{ t.auth.registerNow }}</text>
        </view>
      </view>
    </view>

    <!-- Toast 提示 -->
    <Toast 
      v-if="toastMessage" 
      :message="toastMessage" 
      :type="toastType" 
      :duration="2000"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Icon from '@/components/Icon.vue'
import FormInput from '@/components/FormInput.vue'
import Button from '@/components/Button.vue'
import Toast from '@/components/Toast.vue'
import { TRANSLATIONS } from '@/utils/constants.js'
import { loginWithEmail, loginWithPhone, oneClickLogin, sendVerificationCode } from '@/api/index.js'
import store from '@/store/index.js'

const theme = ref(uni.getStorageSync('theme') || 'light')
const lang = ref(uni.getStorageSync('lang') || 'zh')
const mode = ref('phone') // 'email' | 'phone'
const showPassword = ref(false)
const countdown = ref(0)
const isLoading = ref(false)

const t = computed(() => TRANSLATIONS[lang.value] || TRANSLATIONS.zh)

const formData = ref({
  email: '',
  password: '',
  phone: '',
  areaCode: '+86',
  code: ''
})

// Toast 状态
const toastMessage = ref('')
const toastType = ref('none')
let toastTimer = null

// 自定义 Toast 显示函数
const showToast = (msg, type = 'none') => {
  toastMessage.value = msg
  toastType.value = type
  
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
  
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
    toastType.value = 'none'
  }, 2000)
}

// 发送验证码
const handleSendCode = async () => {
  if (!formData.value.phone) {
    showToast(t.value.auth.enterPhone, 'error')
    return
  }
  
  try {
    isLoading.value = true
    await sendVerificationCode(formData.value.phone, formData.value.areaCode)
    showToast(t.value.auth.codeSent, 'success')
    startCountdown()
  } catch (error) {
    console.error('发送验证码失败:', error)
    showToast(t.value.auth.codeSendFailed, 'error')
  } finally {
    isLoading.value = false
  }
}

// 倒计时
const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    if (countdown.value <= 1) {
      clearInterval(timer)
      countdown.value = 0
    } else {
      countdown.value--
    }
  }, 1000)
}

// 登录
const handleLogin = async () => {
  if (mode.value === 'email') {
    if (!formData.value.email) {
      showToast(t.value.auth.enterEmail, 'error')
      return
    }
    if (!formData.value.password) {
      showToast(t.value.auth.enterPassword, 'error')
      return
    }
    
    try {
      isLoading.value = true
      await loginWithEmail(formData.value.email, formData.value.password)
      showToast(t.value.auth.loginSuccess, 'success')
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1000)
    } catch (error) {
      console.error('登录失败:', error)
      showToast('登录失败，请重试', 'error')
    } finally {
      isLoading.value = false
    }
  } else {
    if (!formData.value.phone) {
      showToast(t.value.auth.enterPhone, 'error')
      return
    }
    if (!formData.value.code) {
      showToast(t.value.auth.enterCode, 'error')
      return
    }
    
    try {
      isLoading.value = true
      await loginWithPhone(formData.value.phone, formData.value.code, formData.value.areaCode)
      showToast(t.value.auth.loginSuccess, 'success')
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1000)
    } catch (error) {
      console.error('登录失败:', error)
      showToast('登录失败，请重试', 'error')
    } finally {
      isLoading.value = false
    }
  }
}

// 一键登录
const handleOneClickLogin = async () => {
  try {
    isLoading.value = true
    await oneClickLogin()
    showToast(t.value.auth.oneClickLoginSuccess, 'success')
    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 1000)
  } catch (error) {
    console.error('一键登录失败:', error)
    showToast('一键登录失败，请重试', 'error')
  } finally {
    isLoading.value = false
  }
}

// 返回
const handleBack = () => {
  uni.navigateBack()
}

// 跳转注册
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register'
  })
}

onMounted(() => {
  theme.value = store.theme || 'light'
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.login-container {
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  background-color: $color-bg-primary;
  padding: 40rpx 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
  }
}

.login-content {
  max-width: 896rpx;
  width: 100%;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 32rpx;
  box-sizing: border-box;
  overflow: hidden;
  background-color: #fff;
  border-radius: 56rpx;
  padding: 64rpx 52rpx;
  box-shadow: $shadow-lg;
  border: 1rpx solid rgba(0, 0, 0, 0.05);
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.back-btn {
  padding: 16rpx;
  margin-left: -16rpx;
  margin-top: -16rpx;
  align-self: flex-start;
  @include flex(row, center, center);
  transition: all 0.2s;
  flex-shrink: 0;
  width: auto;
  height: auto;
  
  &:active {
    transform: scale(0.95);
    opacity: 0.7;
  }
}

.header-section {
  @include flex(column, center, center, 16rpx);
  width: 100%;
  text-align: center;
  flex-shrink: 0;
}

.logo-wrapper {
  width: 120rpx;
  height: 120rpx;
  background-color: $color-primary;
  border-radius: 48rpx;
  @include flex(row, center, center);
  box-shadow: 0 12rpx 32rpx rgba(37, 99, 235, 0.3);
  margin-bottom: 24rpx;
}

.logo-text {
  @include text-style(60rpx, $font-weight-black, #fff);
  font-style: italic;
}

.welcome-title {
  @include text-style(48rpx, $font-weight-black, $color-text-primary);
  letter-spacing: -0.02em;
  
  @include dark-mode {
    color: #fff;
  }
}

.welcome-subtitle {
  @include text-style(24rpx, $font-weight-medium, $color-text-secondary);
  
  @include dark-mode {
    color: $color-dark-text-secondary;
  }
}

.mode-switch {
  margin-top: 40rpx;
  width: 100%;
  background-color: $color-bg-tertiary;
  padding: 8rpx;
  border-radius: 40rpx;
  @include flex(row, space-between, center, 0);
  box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  box-sizing: border-box;
  
  @include dark-mode {
    background-color: rgba(30, 41, 59, 0.5);
  }
}

.mode-btn {
  flex: 1;
  padding: 14rpx 0;
  border-radius: 32rpx;
  @include text-style(24rpx, $font-weight-medium, $color-text-tertiary);
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  transition: all 0.2s;
  height: auto;
  line-height: 1.2;
  min-width: 0;
  box-sizing: border-box;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
  
  &::after {
    border: none !important;
    display: none !important;
  }
  
  &.active {
    background-color: #fff;
    color: $color-primary;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    @include text-style(24rpx, $font-weight-bold, $color-primary);
    
    @include dark-mode {
      background-color: $color-dark-bg-secondary;
      color: $color-primary;
    }
  }
  
  &:active:not(.active) {
    opacity: 0.7;
  }
}

.form-section {
  width: 100%;
  max-width: 100%;
  @include flex(column, flex-start, stretch, 32rpx);
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
  margin-top: 32rpx;
  
  > * {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}

.email-input-wrapper {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  min-width: 0;
  
  :deep(.form-item) {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  :deep(.form-input) {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box;
  }
}

.password-wrapper {
  width: 100%;
  max-width: 100%;
  position: relative;
  box-sizing: border-box;
  flex-shrink: 0;
  min-width: 0;
  
  :deep(.form-item) {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  :deep(.form-input) {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box;
  }
}

.eye-btn {
  position: absolute;
  right: 28rpx;
  bottom: 14rpx;
  padding: 16rpx;
  @include flex(row, center, center);
  transition: all 0.2s;
  z-index: 2;
  
  &:active {
    transform: scale(0.95);
    opacity: 0.7;
  }
}

.phone-row {
  width: 100%;
  @include flex(row, space-between, flex-start, 24rpx);
}

.area-code-wrapper {
  width: 192rpx;
  flex-shrink: 0;
  box-sizing: border-box;
  
  :deep(.form-item) {
    width: 100%;
    box-sizing: border-box;
  }
  
  :deep(.form-input) {
    width: 100% !important;
    box-sizing: border-box;
  }
  
  :deep(.form-input-mono) {
    font-size: 32rpx;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    letter-spacing: 0.05em;
  }
}

.phone-wrapper {
  flex: 1;
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;
  
  :deep(.form-item) {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  :deep(.form-input) {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box;
  }
}

.code-wrapper {
  width: 100%;
  max-width: 100%;
  position: relative;
  box-sizing: border-box;
  
  :deep(.form-item) {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  :deep(.form-input) {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box;
  }
}

.get-code-btn {
  position: absolute;
  right: 24rpx;
  bottom: 10rpx;
  z-index: 2;
  
  :deep(.btn) {
    padding: 8rpx 16rpx;
    min-height: auto;
    height: auto;
  }
  
  :deep(.btn-text) {
    font-size: 20rpx;
    font-weight: 600;
  }
}


.one-click-wrapper {
  width: 100%;
  margin-top: 16rpx;
}

.one-click-btn {
  :deep(.btn) {
    gap: 0;
    background-color: rgba(37, 99, 235, 0.08);
    border: 2rpx solid rgba(37, 99, 235, 0.2);
    padding: 20rpx 24rpx;
    min-height: 120rpx;
    height: 120rpx;
    
    @include dark-mode {
      background-color: rgba(37, 99, 235, 0.12);
      border-color: rgba(37, 99, 235, 0.3);
    }
  }
  
  :deep(.btn-slot) {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 16rpx;
    width: 100%;
  }
}

.sim-icon {
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-radius: 16rpx;
  margin-left: 124rpx;
  @include flex(row, center, center);
  box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.25);
  flex-shrink: 0;
}

.sim-text {
  @include text-style(16rpx, $font-weight-bold, #fff);
  letter-spacing: 0.05em;
}

.one-click-text {
  @include text-style(26rpx, $font-weight-medium, $color-primary);
  margin-right: 84rpx;
  flex: 1;
  
  
  @include dark-mode {
    color: rgba(96, 165, 250, 1);
  }
}

.footer-link {
  width: 100%;
  text-align: center;
  padding-top: 24rpx;
  padding-bottom: 16rpx;
  flex-shrink: 0;
}

.footer-text {
  @include text-style(24rpx, $font-weight-medium, $color-text-secondary);
  
  @include dark-mode {
    color: $color-dark-text-secondary;
  }
}

.link-text {
  @include text-style(24rpx, $font-weight-bold, $color-primary);
  margin-left: 8rpx;
  
  &:active {
    opacity: 0.7;
  }
}
</style>
