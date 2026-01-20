<template>
  <view class="detail-container" :class="{'dark': theme === 'dark'}">
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header />
    
    <!-- 充值详情导航栏 -->
    <PageNav title="充值详情" />
    
    <scroll-view scroll-y class="scroll-content" :style="{ height: `calc(100vh - ${headerTotalHeight}rpx - 120rpx - var(--bottom-nav-height))` }">
      <view class="content-wrapper">
        <!-- 状态卡片 -->
        <view class="status-card">
          <view class="status-icon-wrapper">
            <view class="status-icon">
              <image 
                v-if="deposit && getCurrencySvgPath(deposit.currency)" 
                :src="getCurrencySvgPath(deposit.currency)" 
                class="currency-icon-image" 
                mode="aspectFit" 
              />
              <text v-else-if="deposit" class="currency-icon-text">{{ getCurrencyIcon(deposit.currency) }}</text>
            </view>
          </view>
          <text class="status-title" :class="getStatusClass(deposit?.status)">{{ getStatusText(deposit?.status) }}</text>
          <view class="deposit-id-badge" :class="getStatusClass(deposit?.status)">
            <text class="deposit-id-text">{{ deposit?.status || 'COMPLETED' }}</text>
            <text class="deposit-id-number">#{{ depositId }}</text>
          </view>
        </view>

        <!-- 资金明细卡片 -->
        <view class="detail-card">
          <text class="detail-card-title">资金明细</text>
          <view class="detail-rows">
            <view class="detail-row">
              <text class="detail-label">充值金额</text>
              <text class="detail-value">{{ deposit?.amount?.toLocaleString() || 0 }} {{ deposit?.currency || '' }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">入账价值</text>
              <text class="detail-value highlight">+${{ deposit?.usdAmount?.toLocaleString() || 0 }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">入账汇率</text>
              <text class="detail-value">1 USD = {{ deposit?.rate || 0 }} {{ deposit?.currency || '' }}</text>
            </view>
            
            <view class="detail-divider"></view>
            
            <view class="detail-row">
              <text class="detail-label">支付方式</text>
              <text class="detail-value">{{ deposit?.paymentMethod || '' }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">提交时间</text>
              <text class="detail-value">{{ deposit?.createdAt || '' }}</text>
            </view>
          </view>
        </view>

        <!-- 支付凭证卡片 -->
        <view v-if="deposit?.proofUrl" class="proof-card">
          <text class="proof-title">支付凭证</text>
          <view class="proof-image-wrapper" @tap="previewProof">
            <image :src="deposit.proofUrl" class="proof-image" mode="aspectFill" />
            <view class="proof-overlay">
              <Icon name="Eye" :size="80" :style="{ color: '#fff' }" />
            </view>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-buttons">
          <view class="primary-btn" @tap="goBack">
            <text class="btn-text">返回列表</text>
          </view>
          <view class="secondary-btn" @tap="appeal">
            <text class="btn-text">金额有误?申诉核对</text>
          </view>
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
import { onLoad } from '@dcloudio/uni-app'
import { MOCK_DEPOSITS, CURRENCIES } from '@/utils/constants.js'
import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'
import PageNav from '@/components/PageNav.vue'
import Icon from '@/components/Icon.vue'
import store, { showToast } from '@/store/index.js'

const theme = ref(uni.getStorageSync('theme') || 'light')
const { headerTotalHeight } = useHeaderHeight()
const depositId = ref('')
const deposit = ref(null)

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
  if (!status) return '充值成功'
  const statusMap = {
    'COMPLETED': '充值成功',
    'PROCESSING': '处理中',
    'PENDING': '待处理',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  if (!status) return 'status-success'
  const classMap = {
    'COMPLETED': 'status-success',
    'PROCESSING': 'status-processing',
    'PENDING': 'status-pending',
    'CANCELLED': 'status-cancelled'
  }
  return classMap[status] || ''
}

onLoad((options) => {
  depositId.value = options.id || ''
  deposit.value = MOCK_DEPOSITS.find(d => d.id === depositId.value)
  
  if (!deposit.value) {
    showToast('充值记录不存在', 'error')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

onMounted(() => {
  theme.value = store.theme || 'light'
})

const goBack = () => {
  uni.navigateBack()
}

const appeal = () => {
  showToast('申诉功能开发中', 'info')
}

const previewProof = () => {
  if (deposit.value?.proofUrl) {
    uni.previewImage({
      urls: [deposit.value.proofUrl],
      current: deposit.value.proofUrl
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.detail-container {
  min-height: 100vh;
  width: 100%; // 自适应屏幕宽度
  max-width: 896rpx; // 最大宽度限制 (448px = 896rpx，基于 750rpx 设计稿)
  margin-left: auto;
  margin-right: auto; // 居中
  background-color: $color-bg-primary; // 白色背景
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
  gap: 48rpx; // space-y-6 = 1.5rem = 24px = 48rpx
  width: 100%;
  max-width: 100%; // 确保不超过父容器宽度
  box-sizing: border-box; // 确保 padding 包含在宽度内
}

// 状态卡片
.status-card {
  background-color: #fff;
  padding: 64rpx;
  border-radius: 50rpx;
  border: 1rpx solid $color-border-light;
  @include flex(column, center, center, 24rpx);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 32rpx;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
}

.status-icon-wrapper {
  width: 160rpx;
  height: 160rpx;
  background-color: $color-info-bg;
  border-radius: 50%;
  @include flex(row, center, center);
  border: 1rpx solid rgba(59, 130, 246, 0.18); // $color-info with fade
  margin-bottom: 16rpx;
  
  @include dark-mode {
    background-color: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.4);
  }
}

.status-icon {
  width: 80rpx;
  height: 80rpx;
  @include flex(row, center, center);
}

.currency-icon-image {
  width: 80rpx;
  height: 80rpx;
}

.currency-icon-text {
  font-size: 80rpx;
  line-height: 1;
}

.status-title {
  @include text-style(48rpx, $font-weight-black, $color-success);
  text-transform: none;
  letter-spacing: 0.02em;
  margin-bottom: 24rpx;
  
  &.status-success {
    color: $color-success;
  }
  
  &.status-processing {
    color: $color-info;
  }
  
  &.status-pending {
    color: $color-warning;
  }
  
  &.status-cancelled {
    color: $color-error;
  }
  
  @include dark-mode {
    &.status-success {
      color: $color-success;
    }
    
    &.status-processing {
      color: $color-info;
    }
    
    &.status-pending {
      color: $color-warning;
    }
    
    &.status-cancelled {
      color: $color-error;
    }
  }
}

.deposit-id-badge {
  @include flex(row, center, center, 16rpx);
  flex-wrap: wrap;
}

.deposit-id-text {
  @include text-style(20rpx, $font-weight-bold, $color-success);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
  
  // 根据状态设置不同的颜色和背景
  .status-success & {
    color: $color-success;
    background-color: $color-success-bg;
    
    @include dark-mode {
      color: $color-success;
      background-color: rgba(16, 185, 129, 0.2);
    }
  }
  
  .status-processing & {
    color: $color-info;
    background-color: $color-info-bg;
    
    @include dark-mode {
      color: $color-info;
      background-color: rgba(59, 130, 246, 0.2);
    }
  }
  
  .status-pending & {
    color: $color-warning;
    background-color: $color-warning-bg;
    
    @include dark-mode {
      color: $color-warning;
      background-color: rgba(245, 158, 11, 0.2);
    }
  }
  
  .status-cancelled & {
    color: $color-error;
    background-color: $color-error-bg;
    
    @include dark-mode {
      color: $color-error;
      background-color: rgba(239, 68, 68, 0.2);
    }
  }
}

.deposit-id-number {
  @include text-style(20rpx, $font-weight-normal, $color-text-tertiary);
  letter-spacing: 0.05em;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

// 资金明细卡片
.detail-card {
  background-color: #fff;
  padding: 64rpx;
  border-radius: 50rpx;
  border: 1rpx solid $color-border-light;
  box-shadow: $shadow-sm;
  margin-bottom: 32rpx;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
}

.detail-card-title {
  @include text-style(20rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  border-bottom: 1rpx solid $color-border-light;
  padding-bottom: 24rpx;
  margin-bottom: 48rpx;
  display: block;
  
  @include dark-mode {
    border-color: rgba(148, 163, 184, 0.3);
  }
}

.detail-rows {
  @include flex(column, flex-start, flex-start, 32rpx);
}

.detail-row {
  width: 100%;
  @include flex(row, space-between, center);
}

.detail-label {
  @include text-style(24rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.detail-value {
  @include text-style(28rpx, $font-weight-black, $color-text-primary);
  font-family: monospace;
  
  @include dark-mode {
    color: #fff;
  }
  
  &.highlight {
    color: $color-primary;
  }
}

.detail-divider {
  width: 100%;
  height: 1rpx;
  background-color: $color-border-light;
  margin: 16rpx 0;
  
  @include dark-mode {
    background-color: rgba(148, 163, 184, 0.3);
  }
}

// 支付凭证卡片
.proof-card {
  background-color: #fff;
  padding: 64rpx;
  border-radius: 50rpx;
  border: 1rpx solid $color-border-light;
  box-shadow: $shadow-sm;
  margin-bottom: 32rpx;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
}

.proof-title {
  @include text-style(20rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  border-bottom: 1rpx solid $color-border-light;
  padding-bottom: 24rpx;
  margin-bottom: 32rpx;
  display: block;
  
  @include dark-mode {
    border-color: rgba(148, 163, 184, 0.3);
  }
}

.proof-image-wrapper {
  position: relative;
  width: 100%;
  height: 320rpx;
  border-radius: 24rpx;
  overflow: hidden;
  background-color: #1a1a1a;
  @include flex(row, center, center);
}

.proof-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.proof-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  @include flex(row, center, center);
  opacity: 1;
  transition: opacity 0.3s;
  z-index: 1;
}

.proof-image-wrapper:active .proof-overlay {
  opacity: 0.7;
}

// 操作按钮
.action-buttons {
  @include flex(column, flex-start, stretch, 24rpx);
  margin-top: 32rpx;
}

.primary-btn,
.secondary-btn {
  padding: 32rpx;
  border-radius: 32rpx;
  @include flex(row, center, center);
  transition: all 0.2s;
  cursor: pointer;
  user-select: none;
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.primary-btn {
  background-color: $color-text-primary;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  
  @include dark-mode {
    background-color: #fff;
  }
  
  .btn-text {
    @include text-style(28rpx, $font-weight-black, #fff);
    
    @include dark-mode {
      color: #0f172a;
    }
  }
}

.secondary-btn {
  background-color: #fff;
  border: 2rpx solid $color-border-light;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
  
  .btn-text {
    @include text-style(28rpx, $font-weight-black, $color-text-tertiary);
    
    @include dark-mode {
      color: $color-dark-text-tertiary;
    }
  }
}

.bottom-nav-wrapper {
  position: fixed; // 固定定位，固定在屏幕底部
  bottom: 0;
  left: 0; // 从左边开始
  right: 0; // 到右边结束
  width: 100%;
  max-width: 896rpx; // 与 detail-container 保持一致
  margin-left: auto;
  margin-right: auto; // 居中
  z-index: $z-index-fixed;
  display: flex;
  justify-content: center;
  pointer-events: none; // 让点击事件穿透到子元素
  box-sizing: border-box;
}
</style>
