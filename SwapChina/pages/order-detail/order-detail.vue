<template>
  <view class="detail-container" :class="{'dark': theme === 'dark'}">
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header />
    
    <!-- 订单详情导航栏 -->
    <PageNav title="订单明细" />
    
    <scroll-view scroll-y class="scroll-content">
      <view class="content-wrapper">
        <!-- 状态卡片 -->
        <view class="status-card">
          <view class="status-icon-wrapper">
            <view class="status-icon">
              <Icon name="Check" :size="80" :style="{ color: '#10b981' }" />
            </view>
          </view>
          <text class="status-title">{{ getStatusText(order?.status) }}</text>
          <view class="order-id-badge">
            <text class="order-id-text">Order ID: {{ orderId }}</text>
          </view>
        </view>

        <!-- 状态时间线 -->
        <view class="timeline-card">
          <text class="timeline-title">交易生命周期</text>
          <view class="timeline-container">
            <view class="timeline-line"></view>
            <view 
              v-for="(step, index) in steps" 
              :key="index"
              class="timeline-step"
            >
              <view 
                class="timeline-dot"
                :class="{'active': step.active}"
              ></view>
              <view class="timeline-label">
                <text class="step-label" :class="{'active': step.active}">{{ step.label }}</text>
                <text class="step-time">{{ step.time }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 订单详情表格 -->
        <view class="detail-card">
          <text class="detail-card-title">交易结算账单</text>
          <view class="detail-rows">
            <view class="detail-row">
              <text class="detail-label">支付总额</text>
              <text class="detail-value">{{ order?.fromAmount || 0 }} {{ order?.fromCurrency || '' }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">实收到账</text>
              <text class="detail-value highlight">{{ order?.toAmount || 0 }} {{ order?.toCurrency || '' }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">成交价格</text>
              <text class="detail-value">1 {{ order?.fromCurrency || '' }} = {{ order?.rate || 0 }} {{ order?.toCurrency || '' }}</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">服务费 (SwapFee)</text>
              <text class="detail-value">0.00 {{ order?.fromCurrency || '' }}</text>
            </view>
            
            <view class="detail-divider"></view>
            
            <view class="detail-row">
              <text class="detail-label">结算卡号</text>
              <text class="detail-value">招商银行 (**** 9901)</text>
            </view>
            <view class="detail-row">
              <text class="detail-label">交易时间</text>
              <text class="detail-value">{{ order?.createdAt || '' }}</text>
            </view>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-buttons">
          <button class="primary-btn" @tap="goBack">
            <text class="btn-text">返回列表</text>
          </button>
          <button class="secondary-btn" @tap="contactSupport">
            <text class="btn-text">遇到问题？联系客服</text>
          </button>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部导航 -->
    <view class="bottom-nav-wrapper">
      <BottomNav />
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { MOCK_ORDERS } from '@/utils/constants.js'
import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'
import PageNav from '@/components/PageNav.vue'
import Icon from '@/components/Icon.vue'
import store, { showToast } from '@/store/index.js'

const theme = ref(uni.getStorageSync('theme') || 'light')
const { headerTotalHeight } = useHeaderHeight()
const orderId = ref('')
const order = ref(null)

const steps = computed(() => {
  if (!order.value) return []
  
  return [
    { label: '提交成功', active: true, time: '14:20' },
    { label: '系统锁价', active: order.value.status !== 'PENDING', time: '14:22' },
    { label: '渠道结算', active: order.value.status === 'COMPLETED' || order.value.status === 'PROCESSING', time: '14:25' },
    { label: '已到账', active: order.value.status === 'COMPLETED', time: '14:30' },
  ]
})

const getStatusText = (status) => {
  if (!status) return ''
  const statusMap = {
    'PENDING': 'PENDING',
    'PROCESSING': 'PROCESSING',
    'COMPLETED': 'COMPLETED',
    'CANCELLED': 'CANCELLED'
  }
  return statusMap[status] || status
}

onLoad((options) => {
  orderId.value = options.id || ''
  // 从 MOCK_ORDERS 中查找订单
  order.value = MOCK_ORDERS.find(o => o.id === orderId.value)
  
  if (!order.value) {
    showToast('订单不存在', 'error')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

const goBack = () => {
  uni.navigateBack()
}

const contactSupport = () => {
  showToast('客服功能开发中', 'info')
}
</script>


<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.detail-container {
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
  gap: 48rpx; // space-y-6 = 1.5rem = 24px = 48rpx
  width: 100%;
  max-width: 100%; // 确保不超过父容器宽度
  box-sizing: border-box; // 确保 padding 包含在宽度内
}

.status-card {
  background-color: #fff;
  padding: 64rpx;
  border-radius: 50rpx; // rounded-[2.5rem]
  border: 1rpx solid $color-border-light;
  @include flex(column, center, center, 24rpx);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1); // shadow-xl shadow-slate-200/20
  margin-bottom: 32rpx;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
}

.status-icon-wrapper {
  width: 160rpx; // w-20 = 80px = 160rpx
  height: 160rpx;
  background-color: rgba(16, 185, 129, 0.1); // bg-green-50
  border-radius: 50%;
  @include flex(row, center, center);
  border: 1rpx solid rgba(16, 185, 129, 0.2); // border-green-100
  margin-bottom: 16rpx;
  
  @include dark-mode {
    background-color: rgba(16, 185, 129, 0.3);
    border-color: rgba(16, 185, 129, 0.4);
  }
}

.status-icon {
  width: 80rpx; // w-10 = 40px = 80rpx
  height: 80rpx;
  color: #10b981; // text-green-600
}

.status-title {
  @include text-style(60rpx, $font-weight-black, $color-text-primary); // text-3xl
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  @include dark-mode {
    color: #fff;
  }
}

.order-id-badge {
  background-color: $color-bg-tertiary; // bg-slate-50
  padding: 12rpx 32rpx;
  border-radius: 20rpx;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
  }
}

.order-id-text {
  @include text-style(20rpx, $font-weight-bold, $color-text-tertiary); // text-[10px]
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.timeline-card {
  background-color: #fff;
  padding: 56rpx;
  border-radius: 50rpx; // rounded-[2.5rem]
  border: 1rpx solid $color-border-light;
  box-shadow: $shadow-sm;
  margin-bottom: 32rpx;
  overflow: hidden;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
}

.timeline-title {
  @include text-style(20rpx, $font-weight-bold, $color-text-tertiary); // text-[10px]
  text-transform: uppercase;
  letter-spacing: 0.2em;
  text-align: center;
  display: block;
  margin-bottom: 80rpx; // mb-10
}

.timeline-container {
  position: relative;
  @include flex(row, space-between, flex-start);
  padding-top: 36rpx; // pt-4.5
}

.timeline-line {
  position: absolute;
  top: 36rpx; // top-4.5
  left: 0;
  width: 100%;
  height: 8rpx; // h-1
  background-color: $color-bg-tertiary; // bg-slate-50
  border-radius: 4rpx;
  z-index: 0;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
  }
}

.timeline-step {
  @include flex(column, flex-start, center, 24rpx);
  position: relative;
  z-index: 10;
}

.timeline-dot {
  width: 72rpx; // w-9 = 36px = 72rpx
  height: 72rpx;
  border-radius: 50%;
  border: 8rpx solid #fff; // border-4
  background-color: #fff;
  transition: all 0.7s;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-bg-primary;
  }
  
  &.active {
    background-color: $color-primary; // bg-blue-600
    border-color: rgba(219, 234, 254, 0.5); // border-blue-50
    box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.3); // shadow-xl shadow-blue-600/30
  }
}

.timeline-label {
  @include flex(column, center, center, 4rpx);
}

.step-label {
  @include text-style(18rpx, $font-weight-black, #cbd5e1); // text-[9px] text-slate-300
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  &.active {
    color: $color-primary; // text-blue-600
  }
}

.step-time {
  @include text-style(16rpx, $font-weight-bold, #cbd5e1); // text-[8px] text-slate-300
  
  @include dark-mode {
    color: #475569; // dark:text-slate-600
  }
}

.detail-card {
  background-color: #fff;
  padding: 64rpx;
  border-radius: 50rpx; // rounded-[2.5rem]
  border: 1rpx solid $color-border-light;
  box-shadow: $shadow-sm;
  margin-bottom: 32rpx;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
}

.detail-card-title {
  @include text-style(20rpx, $font-weight-bold, $color-text-tertiary); // text-[10px]
  text-transform: uppercase;
  letter-spacing: 0.2em;
  display: block;
  padding-bottom: 24rpx; // pb-3
  border-bottom: 1rpx solid $color-border-light; // border-b border-slate-50
  
  @include dark-mode {
    border-color: $color-dark-border-light;
  }
}

.detail-rows {
  @include flex(column, flex-start, flex-start, 32rpx); // space-y-4
  margin-top: 24rpx;
}

.detail-row {
  width: 100%;
  @include flex(row, space-between, center);
}

.detail-label {
  @include text-style(24rpx, $font-weight-bold, $color-text-tertiary); // text-xs
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  @include text-style(28rpx, $font-weight-black, $color-text-primary); // text-sm
  font-family: monospace;
  
  @include dark-mode {
    color: $color-dark-text-primary;
  }
  
  &.highlight {
    color: $color-primary; // text-blue-600
  }
}

.detail-divider {
  width: 100%;
  height: 1rpx;
  background-color: $color-border-light; // border-t border-slate-50
  margin: 32rpx 0; // pt-4 mt-2
  
  @include dark-mode {
    background-color: $color-dark-border-light;
  }
}

.action-buttons {
  @include flex(column, flex-start, flex-start, 32rpx);
  padding-top: 64rpx; // pt-8
}

.primary-btn {
  width: 100%;
  background-color: #0f172a; // bg-slate-900
  padding: 30rpx 0; // py-5
  border-radius: 50rpx; // rounded-[1.8rem]
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2); // shadow-xl
  @include flex(row, center, center);
  border: none;
  transition: all 0.2s;
  
  @include dark-mode {
    background-color: #fff;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.secondary-btn {
  width: 100%;
  background-color: #fff;
  padding: 30rpx 0; // py-5
  border-radius: 50rpx; // rounded-[1.8rem]
  border: 1rpx solid $color-border-light;
  box-shadow: $shadow-sm;
  @include flex(row, center, center);
  transition: all 0.2s;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.bottom-nav-wrapper {
  position: sticky; // 使用sticky定位，相对于容器
  bottom: 0;
  width: 100%; // 继承容器宽度，自动包含padding
  z-index: $z-index-fixed;
  display: flex;
  justify-content: center;
  pointer-events: none; // 让点击事件穿透到子元素
  box-sizing: border-box;
  // 自动继承容器的padding和max-width限制，与内容区完美对齐
}

.btn-text {
  @include text-style($font-size-2xl, $font-weight-black, #fff); // text-sm
  text-transform: uppercase;
  letter-spacing: 0.2em;
  
  .primary-btn & {
    color: #fff;
    
    @include dark-mode {
      color: #0f172a; // dark:text-slate-900
    }
  }
  
  .secondary-btn & {
    color: #475569; // text-slate-600
    
    @include dark-mode {
      color: #94a3b8; // dark:text-slate-400
    }
  }
}
</style>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

// DetailRow 组件样式
.detail-row {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  @include text-style(24rpx, $font-weight-bold, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  @include text-style(28rpx, $font-weight-black, $color-text-primary);
  font-family: monospace;
  
  &.highlight {
    color: $color-primary;
  }
}

.bottom-nav-wrapper {
  position: fixed; // 固定定位，固定在屏幕底部
  bottom: 0;
  left: 50%; // 居中定位
  transform: translateX(-50%); // 居中偏移
  width: 100%;
  max-width: 896rpx; // 与 detail-container 保持一致
  z-index: $z-index-fixed;
  display: flex;
  justify-content: center;
  pointer-events: none; // 让点击事件穿透到子元素
  box-sizing: border-box;
}
</style>
