<template>
  <view class="profile-container" :class="{'dark': theme === 'dark'}">
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header />
    
    <scroll-view scroll-y class="scroll-content">
      <view class="content-wrapper">
        <!-- 用户信息头部 -->
        <view class="profile-header">
          <view class="avatar-section">
            <view class="avatar-wrapper">
              <image class="avatar" src="https://picsum.photos/seed/profile/200/200" mode="aspectFill" />
            </view>
            <view class="verified-badge" :class="{ 'verified': isVerified }">
              <text class="badge-text">{{ isVerified ? '✓' : '!' }}</text>
            </view>
          </view>
          <text class="username">John Doe</text>
          <view class="uid-badge">
            <text class="uid-text">UID: 8219385012</text>
          </view>
        </view>

        <!-- 快捷按钮组 -->
        <view class="quick-buttons">
          <view 
            v-for="btn in quickButtons" 
            :key="btn.label"
            class="quick-btn"
            @tap="btn.onClick"
          >
            <view class="quick-icon-box" :class="{ 'indigo': btn.color === 'indigo', 'gray': btn.color === 'gray' }">
              <Icon :name="btn.icon" :size="68" :style="{ color: btn.color === 'indigo' ? '#4f46e5' : btn.color === 'gray' ? '#94a3b8' : '#2563eb' }" />
            </view>
            <text class="quick-label">{{ btn.label }}</text>
            <view v-if="btn.badge" class="quick-badge">
              <text class="badge-text-small">{{ btn.badge }}</text>
            </view>
          </view>
        </view>

        <!-- 系统偏好 -->
        <view class="settings-section">
          <text class="section-title">系统偏好</text>
          <view class="menu-card">
            <view class="menu-item" @tap="showLangPicker = true">
              <view class="menu-icon-box">
                <Icon name="Language" :size="34" :style="{ color: '#ffffff' }" />
              </view>
              <text class="menu-label">系统语言</text>
              <view class="menu-right">
                <text class="menu-badge">{{ getCurrentLangLabel() }}</text>
                <Icon name="ChevronRight" :size="32" :style="{ transform: 'rotate(180deg)' }" />
              </view>
            </view>
            
            <view class="menu-item">
              <view class="menu-icon-box">
                <Icon name="Theme" :size="34" :style="{ color: '#ffffff' }"  />
              </view>
              <text class="menu-label">深色模式预览</text>
              <button class="theme-toggle" :class="{ 'active': theme === 'dark' }" @tap="toggleTheme">
                <view class="toggle-dot"></view>
              </button>
            </view>
            
            <view class="menu-item" @tap="goToAboutUs">
              <view class="menu-icon-box menu-icon-box-blue">
                <Icon name="AboutUs" :size="40" :style="{color: '#ffffff'}"/>
              </view>
              <text class="menu-label">关于我们</text>
              <Icon name="ChevronRight" :size="32" :style="{ transform: 'rotate(180deg)' }" />
            </view>
          </view>
        </view>

        <!-- 账户安全 -->
        <view class="settings-section">
          <text class="section-title">账户安全</text>
          <view class="menu-card">
            <view class="menu-item" @tap="goToChangePassword">
              <view class="menu-icon-box">
                <Icon name="ChangePassword" :size="34" :style="{ color: '#ffffff' }"  />
              </view>
              <text class="menu-label">修改登录密码</text>
              <Icon name="ChevronRight" :size="32" :style="{ transform: 'rotate(180deg)' }" />
            </view>
            
            <view class="menu-item" @tap="handleHardwareToggle">
              <view class="menu-icon-box" :class="{ 'green': isHardwareBound }">
                <Icon name="BindHardware" :size="34" :style="{ color: isHardwareBound ? '#ffffff' : '#ffffff' }" />
              </view>
              <view class="menu-label-group">
               
                <text class="menu-sublabel">支持 WebAuthn / 生物特征绑定</text>
              </view>
              <view class="hardware-badge" :class="{ 'active': isHardwareBound }">
                <text class="badge-text-small">{{ isHardwareBound ? '已启用' : '未绑定' }}</text>
              </view>
            </view>
            
            <view class="menu-item" @tap="handleLogout">
              <view class="menu-icon-box menu-icon-orange">
                <Icon name="Logout" :size="34" :style="{ color: '#ffffff' }" />
              </view>
              <text class="menu-label menu-label-orange">退出登录</text>
              <Icon name="ChevronRight" :size="32" :style="{ transform: 'rotate(180deg)' }" />
            </view>
          </view>
        </view>

        <!-- 版本信息 -->
        <view class="version-info">
          <text class="version-text">SwapChina Premium v2.2.0</text>
        </view>
      </view>
    </scroll-view>

    <!-- 语言选择器 -->
    <view v-if="showLangPicker" class="lang-modal-overlay" @tap="showLangPicker = false">
      <view class="lang-modal-content" @tap.stop>
        <view class="lang-modal-drag"></view>
        <view class="lang-modal-header">
          <text class="lang-modal-title">选择系统语言</text>
          <view class="lang-modal-close" @tap="showLangPicker = false">
            <Icon name="Close" :size="48" :style="{ color: '#64748b' }" />
          </view>
        </view>
        
        <view class="lang-list">
          <button 
            v-for="langItem in languages" 
            :key="langItem.code"
            class="lang-item"
            :class="{ 'active': lang === langItem.code }"
            @tap="handleLangChange(langItem.code)"
          >
            <view class="lang-info">
              <text class="lang-flag">{{ langItem.flag }}</text>
              <view class="lang-details">
                <text class="lang-name">{{ langItem.label }}</text>
                <text class="lang-native">{{ langItem.native }}</text>
              </view>
            </view>
            <view v-if="lang === langItem.code" class="lang-check">
              <view class="lang-check-dot"></view>
            </view>
            <view v-else class="lang-check-empty"></view>
          </button>
        </view>
      </view>
    </view>

    <!-- 退出登录确认对话框 -->
    <ConfirmDialog
      :visible="showLogoutConfirm"
      title="确认退出"
      message="确定要退出登录吗？"
      confirm-text="确认退出"
      cancel-text="取消"
      @confirm="handleLogoutConfirm"
      @cancel="showLogoutConfirm = false"
      @update:visible="showLogoutConfirm = $event"
    />

    <view class="bottom-nav-wrapper">
      <BottomNav />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'
import Icon from '@/components/Icon.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import store, { showToast } from '@/store/index.js'

const theme = ref(uni.getStorageSync('theme') || 'light')
const { headerTotalHeight } = useHeaderHeight()
const lang = ref(uni.getStorageSync('lang') || 'zh')
const showLangPicker = ref(false)
const showLogoutConfirm = ref(false)
const isVerified = ref(false)
const isHardwareBound = ref(false)

const languages = [
  { code: 'zh', label: '简体中文', native: 'Chinese', flag: '🇨🇳' },
  { code: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', native: 'French', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', native: 'Arabic', flag: '🇸🇦' }
]

const quickButtons = computed(() => [
  { 
    icon: 'Deposit', 
    label: '充值中心', 
    onClick: () => uni.navigateTo({ url: '/pages/deposit-history/deposit-history' })
  },
  { 
    icon: 'Bell', 
    label: '消息中心', 
    badge: store.unreadCount || 0,
    onClick: () => uni.navigateTo({ url: '/pages/messages/messages' })
  },
  { 
    icon: 'ExchangeRate', 
    label: '国际汇率', 
    onClick: () => uni.navigateTo({ url: '/pages/market/market' })
  },
  { 
    icon: isVerified.value ? 'Verify' : 'Unverified', 
    label: '实名认证', 
    color: isVerified.value ? 'indigo' : 'gray',
    onClick: () => uni.navigateTo({ url: '/pages/kyc/kyc' })
  }
])

const getCurrentLangLabel = () => {
  return languages.find(l => l.code === lang.value)?.label || '简体中文'
}

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  store.setTheme(theme.value)
  uni.setStorageSync('theme', theme.value)
}

const handleHardwareToggle = () => {
  if (isHardwareBound.value) {
    isHardwareBound.value = false
    showToast('硬件密匙已取消绑定', 'info')
  } else {
    showToast('正在调起生物识别传感器...', 'info')
    setTimeout(() => {
      isHardwareBound.value = true
      showToast('硬件密匙绑定成功', 'success')
    }, 1500)
  }
}

const handleLangChange = (code) => {
  lang.value = code
  store.setLang(code)
  uni.setStorageSync('lang', code)
  showLangPicker.value = false
  showToast(`已切换至 ${languages.find(l => l.code === code)?.label}`, 'success')
}

const handleLogout = () => {
  showLogoutConfirm.value = true
}

const handleLogoutConfirm = () => {
  uni.reLaunch({
    url: '/pages/login/login'
  })
}

const goToChangePassword = () => {
  uni.navigateTo({
    url: '/pages/change-password/change-password'
  })
}

const goToAboutUs = () => {
  uni.navigateTo({
    url: '/pages/about-us/about-us'
  })
}

onMounted(() => {
  theme.value = store.theme || 'light'
  lang.value = store.lang || 'zh'
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.profile-container {
  min-height: 100vh;
  // 关键：不设置默认width，完全通过媒体查询控制
  max-width: 896rpx; // 最大宽度限制 (448px = 896rpx，基于 750rpx 设计稿)
  margin-left: auto;
  margin-right: auto; // 居中
  background-color: $color-bg-primary; // 白色背景
  box-shadow: $shadow-2xl; // 外扩阴影
  position: relative;
  overflow-x: hidden; // 防止内容溢出
  display: flex;
  flex-direction: column;
  align-items: stretch; // 让子元素占满宽度
  box-sizing: border-box; // 确保宽度计算包含 padding 和 border
  
  // 确保所有子元素也遵循宽度限制
  > * {
    max-width: 100%;
    box-sizing: border-box;
  }
  
  @include dark-mode {
    background-color: $color-dark-bg-primary; // 深色模式背景
  }
}

.header-placeholder {
  width: 100%;
  flex-shrink: 0;
}

.scroll-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 200rpx; // 为底部导航预留空间
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%; // 确保不超过父容器宽度
  box-sizing: border-box;
}

.content-wrapper {
  padding: 40rpx; // p-5 = 1.25rem = 20px = 40rpx
  display: flex;
  flex-direction: column;
  gap: 32rpx; // 减少间距，使布局更紧凑
  width: 100%;
  max-width: 100%; // 确保不超过父容器宽度
  box-sizing: border-box; // 确保 padding 包含在宽度内
}

.profile-header {
  @include flex(column, center, center);
  padding: 48rpx 0 40rpx;
}

.avatar-section {
  position: relative;
}

.avatar-wrapper {
  width: 192rpx;
  height: 192rpx;
  border-radius: 100rpx;
  padding: 12rpx;
  background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
  box-shadow: 0 8rpx 32rpx rgba(59, 130, 246, 0.4);
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 88rpx;
  border: 8rpx solid #fff;
  
  @include dark-mode {
    border-color: #0f172a;
  }
}

.verified-badge {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: #ef4444;
  border: 8rpx solid #fff;
  @include flex(row, center, center);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
  
  @include dark-mode {
    border-color: #0f172a;
  }
  
  &.verified {
    background-color: #10b981;
  }
}

.badge-text {
  @include text-style(20rpx, $font-weight-black, #fff);
}

.username {
  @include text-style(40rpx, $font-weight-black, $color-text-primary);
  margin-top: 40rpx;
  letter-spacing: 0.02em;
  
  @include dark-mode {
    color: #fff;
  }
}

.uid-badge {
  margin-top: 16rpx;
  padding: 8rpx 28rpx;
  background-color: rgba(241, 245, 249, 0.8);
  border-radius: 40rpx;
  border: 1rpx solid rgba(241, 245, 249, 0.8);
  
  @include dark-mode {
    background-color: rgba(30, 41, 59, 0.6);
    border-color: rgba(51, 65, 85, 0.5);
  }
}

.uid-text {
  @include text-style(20rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.quick-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
  padding: 0 16rpx;
  margin-bottom: 32rpx;
}

.quick-btn {
  @include flex(column, center, center, 16rpx);
  position: relative;
}

.quick-icon-box {
  width: 112rpx;
  height: 112rpx;
  border-radius: 32rpx;
  background-color: #fff;
  border: 1rpx solid rgba(241, 245, 249, 0.8);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  @include flex(row, center, center);
  color: $color-primary;
  transition: all 0.2s;
  
  @include dark-mode {
    background-color: rgba(30, 41, 59, 0.6);
    border-color: rgba(51, 65, 85, 0.5);
  }
  
  &.indigo {
    color: #4f46e5;
  }
  
  &.gray {
    color: #94a3b8;
    background-color: rgba(241, 245, 249, 0.6);
    border-color: rgba(226, 232, 240, 0.8);
    
    @include dark-mode {
      background-color: rgba(30, 41, 59, 0.4);
      border-color: rgba(51, 65, 85, 0.4);
    }
  }
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.08);
  }
}

.quick-label {
  @include text-style(20rpx, $font-weight-black, $color-text-secondary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.quick-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  background-color: #ef4444;
  border-radius: 50%;
  border: 4rpx solid #fff;
  @include flex(row, center, center);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transform: translate(25%, -25%);
  
  @include dark-mode {
    border-color: #0f172a;
  }
}

.badge-text-small {
  @include text-style(18rpx, $font-weight-black, #fff);
}

.settings-section {
  margin-bottom: 32rpx;
}

.section-title {
  @include text-style(20rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  padding-left: 32rpx;
  margin-bottom: 24rpx;
  display: block;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.menu-card {
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 48rpx;
  border: 1rpx solid rgba(241, 245, 249, 0.8);
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  
  @include dark-mode {
    background-color: rgba(30, 41, 59, 0.5);
    border-color: rgba(51, 65, 85, 0.5);
  }
}

.menu-item {
  @include flex(row, space-between, center);
  padding: 20rpx;
  border-bottom: 1rpx solid rgba(202, 209, 214, 0.3);
  transition: background-color 0.2s;
  
  @include dark-mode {
    border-bottom-color: rgba(51, 65, 85, 0.5);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background-color: rgba(241, 245, 249, 0.5);
    
    @include dark-mode {
      background-color: rgba(51, 65, 85, 0.3);
    }
  }
}

.menu-icon-box {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background-color: $color-primary;
  @include flex(row, center, center);
  color: $color-primary;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
  }
  
  &.green {
    background-color: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
  
  &.menu-icon-box-blue {
    background-color: $color-primary;
    color: #fff;
  }
  
  &.menu-icon-orange {
    background-color: $color-warning;
 
  }
}

.menu-icon-text {
  @include text-style(16rpx, $font-weight-black, #fff);
}

.menu-label {
  flex: 1;
  margin-left: 32rpx;
  @include text-style(24rpx, $font-weight-normal, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
  
  &.menu-label-orange {
    color:$color-warning;
  }
}

.menu-label-group {
  flex: 1;
  margin-left: 32rpx;
  @include flex(column, flex-start, flex-start, 4rpx);
}

.menu-sublabel {
  @include text-style(18rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.menu-right {
  @include flex(row, flex-end, center, 16rpx);
}

.menu-badge {
  @include text-style(20rpx, $font-weight-black, $color-primary);
  background-color: rgba(37, 99, 235, 0.1);
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  text-transform: uppercase;
  
  @include dark-mode {
    background-color: rgba(96, 165, 250, 0.3);
    color: $color-primary-light;
  }
}

.theme-toggle {
  width: 104rpx;
  height: 56rpx;
  border-radius: 56rpx;
  background-color: $color-bg-tertiary;
  padding: 4rpx;
  transition: all 0.3s;
  
  @include dark-mode {
    background-color: $color-primary;
  }
  
  &.active {
    background-color: $color-primary;
  }
}

.toggle-dot {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  transition: transform 0.3s;
  
  .theme-toggle.active & {
    transform: translateX(48rpx);
  }
}

.hardware-badge {
  @include text-style(18rpx, $font-weight-black, $color-text-secondary);
  background-color: $color-text-disabled;
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  text-transform: uppercase;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    color: $color-dark-text-disabled;
  }
  
  &.active {
    background-color: #10b981;
    color: #fff;
  }
}

.version-info {
  padding: 36rpx 0;
  text-align: center;
  opacity: 0.2;
}

.version-text {
  @include text-style(20rpx, $font-weight-black, $color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.6em;
  
  @include dark-mode {
    color: #fff;
  }
}

.lang-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  @include flex(row, center, flex-end);
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
}

.lang-modal-content {
  width: 100%;
  max-width: 896rpx;
  background-color: #fff;
  border-radius: 48rpx 48rpx 0 0;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-height: 60vh;
  animation: slideUp 0.3s ease;
  
  @include dark-mode {
    background-color: $color-bg-page-dark;
  }
}

.lang-modal-drag {
  width: 80rpx;
  height: 8rpx;
  background-color: $color-bg-tertiary;
  border-radius: 8rpx;
  margin: 24rpx auto 16rpx;
  opacity: 0.4;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
  }
}

.lang-modal-header {
  @include flex(row, space-between, center);
  padding: 16rpx 40rpx 32rpx;
}

.lang-modal-title {
  @include text-style(32rpx, $font-weight-bold, $color-text-primary);
  letter-spacing: 0.02em;
  
  @include dark-mode {
    color: #fff;
  }
}

.lang-modal-close {
  width: 64rpx;
  height: 64rpx;
  background-color: rgba(241, 245, 249, 0.8);
  border-radius: 32rpx;
  border: 1rpx solid rgba(226, 232, 240, 0.8);
  @include flex(row, center, center);
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.95);
    background-color: rgba(226, 232, 240, 0.9);
  }
  
  @include dark-mode {
    background-color: rgba(30, 41, 59, 0.6);
    border-color: rgba(51, 65, 85, 0.6);
    
    &:active {
      background-color: rgba(51, 65, 85, 0.8);
    }
  }
}

.lang-list {
  padding: 0 40rpx 64rpx;
  @include flex(column, flex-start, flex-start, 16rpx);
}

.lang-item {
  width: 100%;
  padding: 28rpx 32rpx;
  border-radius: 32rpx;
  @include flex(row, space-between, center);
  transition: all 0.2s;
  background-color: $color-bg-tertiary;
  border: 1rpx solid $color-border-light;
  
  @include dark-mode {
    background-color: rgba(30, 41, 59, 0.5);
    border-color: $color-dark-border-light;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &.active {
    background-color: $color-primary;
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(37, 99, 235, 0.25);
    border-color: $color-primary;
  }
}

.lang-info {
  @include flex(row, flex-start, center, 24rpx);
}

.lang-flag {
  font-size: 40rpx;
  line-height: 1;
}

.lang-details {
  @include flex(column, flex-start, flex-start, 4rpx);
}

.lang-name {
  @include text-style(26rpx, $font-weight-bold, $color-text-primary);
  letter-spacing: 0.02em;
  
  .lang-item.active & {
    color: #fff;
  }
  
  @include dark-mode {
    color: $color-dark-text-primary;
    
    .lang-item.active & {
      color: #fff;
    }
  }
}

.lang-native {
  @include text-style(20rpx, $font-weight-normal, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.6;
  
  .lang-item.active & {
    color: rgba(255, 255, 255, 0.8);
    opacity: 1;
  }
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
    
    .lang-item.active & {
      color: rgba(255, 255, 255, 0.8);
      opacity: 1;
    }
  }
}

.lang-check {
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  @include flex(row, center, center);
}

.lang-check-dot {
  width: 18rpx;
  height: 18rpx;
  background-color: #fff;
  border-radius: 50%;
}

.lang-check-empty {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 3rpx solid $color-border-light;
  
  @include dark-mode {
    border-color: $color-dark-border-light;
  }
}

.bottom-nav-wrapper {
  position: fixed; // 固定定位，固定在屏幕底部
  bottom: 0;
  left: 50%; // 居中定位
  transform: translateX(-50%); // 居中偏移
  width: 100%;
  max-width: 896rpx; // 与 profile-container 保持一致
  z-index: $z-index-fixed;
  display: flex;
  justify-content: center;
  pointer-events: none; // 让点击事件穿透到子元素
  box-sizing: border-box;
}
</style>
