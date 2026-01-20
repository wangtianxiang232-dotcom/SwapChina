<template>
  <view class="history-container" :class="{'dark': theme === 'dark'}">
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header />
    
    <!-- 充值记录导航栏 -->
    <view class="page-nav-wrapper">
      <PageNav title="充值记录" />
      <view class="deposit-btn" @tap="goToDeposit">
        <text class="deposit-btn-text">我要充值</text>
      </view>
    </view>
    
    <scroll-view scroll-y class="scroll-content">
      <view class="content-wrapper">
        <view 
          v-for="deposit in deposits" 
          :key="deposit.id"
          class="deposit-item"
          @tap="goToDetail(deposit.id)"
        >
          <view class="deposit-header">
            <view class="deposit-info">
              <view class="deposit-icon-box">
                <image 
                  v-if="getCurrencySvgPath(deposit.currency)" 
                  :src="getCurrencySvgPath(deposit.currency)" 
                  class="deposit-icon-image" 
                  mode="aspectFit" 
                />
                <text v-else class="deposit-icon-text">{{ getCurrencyIcon(deposit.currency) }}</text>
              </view>
              <view class="deposit-text-info">
                <text class="deposit-id">{{ deposit.id }}</text>
                <text class="deposit-time">{{ deposit.createdAt }}</text>
              </view>
            </view>
            <view class="status-badge" :class="getStatusClass(deposit.status)">
              <text class="status-text">{{ getStatusText(deposit.status) }}</text>
            </view>
          </view>
          <view class="deposit-divider"></view>
          <view class="deposit-body">
            <view class="deposit-amount-section">
              <text class="deposit-label">充值金额</text>
              <text class="deposit-amount">{{ deposit.amount.toLocaleString() }} {{ deposit.currency }}</text>
            </view>
            <view class="deposit-usd-section">
              <text class="deposit-label">入账价值 (USD)</text>
              <text class="deposit-usd">+${{ deposit.usdAmount.toLocaleString() }}</text>
            </view>
          </view>
        </view>
        
        <view v-if="deposits.length === 0" class="empty-state">
          <text class="empty-text">暂无充值记录</text>
        </view>
      </view>
    </scroll-view>
    
    <view class="bottom-nav-wrapper">
      <BottomNav />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MOCK_DEPOSITS, CURRENCIES } from '@/utils/constants.js'
import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'
import PageNav from '@/components/PageNav.vue'
import Icon from '@/components/Icon.vue'
import store from '@/store/index.js'

const theme = ref(uni.getStorageSync('theme') || 'light')
const { headerTotalHeight } = useHeaderHeight()
const deposits = ref(MOCK_DEPOSITS)

// 获取货币图标（符号）
const getCurrencyIcon = (code) => {
  const currency = CURRENCIES.find(c => c.code === code)
  return currency?.symbol || '💵'
}

// 获取货币 SVG 路径
const getCurrencySvgPath = (code) => {
  const currency = CURRENCIES.find(c => c.code === code)
  return currency?.svgPath || null
}

const getStatusText = (status) => {
  const statusMap = {
    'COMPLETED': '已完成',
    'PROCESSING': '处理中',
    'PENDING': '待处理',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    'COMPLETED': 'status-success',
    'PROCESSING': 'status-processing',
    'PENDING': 'status-pending',
    'CANCELLED': 'status-cancelled'
  }
  return classMap[status] || ''
}

const goToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/deposit-detail/deposit-detail?id=${id}`
  })
}

const goToDeposit = () => {
  uni.navigateTo({
    url: '/pages/deposit/deposit'
  })
}

onMounted(() => {
  theme.value = store.theme || 'light'
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.history-container {
  min-height: 100vh;
  width: 100%; // 自适应屏幕宽度
  max-width: 896rpx; // 最大宽度限制 (448px = 896rpx，基于 750rpx 设计稿)
  margin-left: auto;
  margin-right: auto; // 居中
  background-color: #f8fafc;
  box-shadow: $shadow-2xl; // 外扩阴影
  position: relative;
  overflow-x: hidden; // 防止内容溢出
  overflow-y: visible; // 允许底部导航溢出
  display: flex;
  flex-direction: column;
  align-items: stretch; // 让子元素占满宽度
  box-sizing: border-box; // 确保宽度计算包含 padding 和 border
  
  // 确保所有子元素也遵循宽度限制，但排除底部导航
  > *:not(.bottom-nav-wrapper) {
    max-width: 100%;
    box-sizing: border-box;
  }
  
  @include dark-mode {
    background-color: #020617;
  }
}

.header-placeholder {
  width: 100%;
}

.page-nav-wrapper {
  position: sticky;
  top: var(--header-height);
  z-index: 99;
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  
  padding: 32rpx 40rpx;
  box-sizing: border-box;
  @include flex(row, space-between, center);
  
  @include dark-mode {
    background-color: rgba(15, 23, 42, 0.95);
    border-bottom-color: rgba(30, 41, 59, 0.5);
  }
  
  :deep(.page-nav) {
    background-color: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    border-bottom: none;
    padding: 0;
    position: static;
    flex: 1;
  }
}

.deposit-btn {
  position: relative;
  background-color: $color-error;
  padding: 16rpx 24rpx;
  border-radius: 24rpx;
  border: 2rpx solid $color-error;
  box-shadow: 0 4rpx 12rpx rgba(239, 68, 68, 0.25);
  transition: all 0.2s;
  @include flex(row, center, center);
  cursor: pointer;
  user-select: none;
  animation: pulse 2s ease-in-out infinite;
  overflow: visible;
  
  // 光晕效果
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    border-radius: 24rpx;
    background-color: $color-error;
    opacity: 0.6;
    z-index: -1;
    animation: glow 2s ease-in-out infinite;
  }
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(239, 68, 68, 0.3);
    opacity: 0.9;
    animation: none; // 点击时停止动画
    
    &::before {
      animation: none; // 点击时停止光晕动画
    }
  }
}

// 脉冲动画（大小变化）
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

// 光晕放大缩小动画
@keyframes glow {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0;
  }
}

.deposit-btn-text {
  @include text-style(22rpx, $font-weight-black, #fff);
  line-height: 1.2;
  white-space: nowrap;
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
  padding: 40rpx;
  padding-bottom: 160rpx;
  box-sizing: border-box;
}

.deposit-item {
  background-color: #fff;
  padding: 48rpx;
  border-radius: 50rpx;
  border: 1rpx solid $color-border-light;
  box-shadow: $shadow-sm;
  margin-bottom: 32rpx;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
}

.deposit-header {
  @include flex(row, space-between, flex-start);
  margin-bottom: 32rpx;
}

.deposit-info {
  @include flex(row, flex-start, center, 24rpx);
  flex: 1;
}

.deposit-icon-box {
  width: 80rpx;
  height: 80rpx;
  background-color: #f1f5f9;
  border-radius: 24rpx;
  @include flex(row, center, center);
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
  }
}

.deposit-icon-image {
  width: 58rpx;
  height: 58rpx;
}

.deposit-icon-text {
  font-size: 48rpx;
  line-height: 1;
}

.deposit-text-info {
  @include flex(column, flex-start, flex-start, 8rpx);
  flex: 1;
}

.deposit-id {
  @include text-style(24rpx, $font-weight-black, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
}

.deposit-time {
  @include text-style(20rpx, $font-weight-normal, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.deposit-divider {
  width: 100%;
  height: 1rpx;
  background-color: $color-border-light;
  margin-bottom: 32rpx;
  
  @include dark-mode {
    background-color: rgba(148, 163, 184, 0.2);
  }
}

.deposit-body {
  @include flex(row, space-between, flex-end);
}

.deposit-amount-section,
.deposit-usd-section {
  @include flex(column, flex-start, flex-start, 8rpx);
}

.deposit-label {
  @include text-style(20rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.deposit-amount {
  @include text-style(28rpx, $font-weight-black, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
}

.deposit-usd {
  @include text-style(36rpx, $font-weight-black, $color-primary);
}

.status-badge {
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  @include flex(row, center, center);
  line-height: 1;
  
  &.status-success {
    background-color: $color-success-bg;
    
    .status-text {
      color: $color-success;
    }
  }
  
  &.status-processing {
    background-color: $color-info-bg;
    
    .status-text {
      color: $color-info;
    }
  }
  
  &.status-pending {
    background-color: $color-warning-bg;
    
    .status-text {
      color: $color-warning;
    }
  }
  
  &.status-cancelled {
    background-color: $color-error-bg;
    
    .status-text {
      color: $color-error;
    }
  }
}

.status-text {
  @include text-style(20rpx, $font-weight-black, $color-success);
  text-transform: uppercase;
  line-height: 1;
}

.empty-state {
  width: 100%;
  padding: 192rpx 0;
  @include flex(column, center, center);
}

.empty-text {
  @include text-style(28rpx, $font-weight-black, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.bottom-nav-wrapper {
  position: fixed; // 固定定位，固定在屏幕底部
  bottom: 0;
  left: 0; // 从左边开始
  right: 0; // 到右边结束
  width: 100%;
  max-width: 896rpx; // 与 history-container 保持一致
  margin-left: auto;
  margin-right: auto; // 居中
  z-index: $z-index-fixed;
  display: flex;
  justify-content: center;
  pointer-events: none; // 让点击事件穿透到子元素
  box-sizing: border-box;
}
</style>
