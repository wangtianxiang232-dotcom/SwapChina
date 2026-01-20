<template>
  <view class="orders-container" :class="{'dark': theme === 'dark'}">
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header />
    
    <scroll-view scroll-y class="scroll-content">
      <view class="content-wrapper">
        <!-- 头部标题和时间筛选 -->
        <view class="orders-header">
          <view class="header-left">
            <text class="header-title">交易订单</text>
            <text class="header-range">{{ rangeLabels[selectedRange] }}</text>
          </view>
          <view 
            class="time-filter-btn"
            :class="{'active': selectedRange !== 'ALL'}"
            @tap="showTimePicker = true"
          >
            <Icon name="History" :size="40" :style="{ color: '#e2e8f0' }" />
            <text v-if="selectedRange !== 'ALL'" class="filter-badge">!</text>
          </view>
        </view>

        <!-- Tab 栏 -->
        <scroll-view scroll-x class="tabs-scroll" :show-scrollbar="false">
          <view class="tabs-container">
            <view 
              v-for="tab in statusTabs" 
              :key="tab.value"
              class="tab-item"
              :class="{'active': filter === tab.value}"
              @tap="filter = tab.value"
            >
              {{ tab.label }}
            </view>
          </view>
        </scroll-view>

        <!-- 订单列表 -->
        <view class="orders-list">
          <view 
            v-for="order in filteredOrders" 
            :key="order.id"
            class="order-item"
            @tap="goToOrderDetail(order.id)"
          >
            <view class="order-top">
              <view class="order-id-section">
                <text class="order-id-label">订单编号</text>
                <text class="order-id-value">{{ order.id }}</text>
              </view>
              <view class="order-status" :class="order.status.toLowerCase()">
                {{ getStatusText(order.status) }}
              </view>
            </view>
            
            <view class="order-bottom">
              <view class="order-amounts">
                <text class="amount-text">{{ order.fromAmount }} <text class="amount-currency">{{ order.fromCurrency }}</text></text>
                <Icon name="ChevronRight" :size="42" :style="{ color: '#e2e8f0' }" />
                <text class="amount-text primary">{{ order.toAmount }} <text style="font-size: 20rpx;">{{ order.toCurrency }}</text></text>
              </view>
              <view class="order-date">
                <text class="date-label">日期</text>
                <text class="date-value">{{ getOrderDate(order.createdAt) }}</text>
              </view>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-if="filteredOrders.length === 0" class="empty-orders">
            <Icon name="History" :size="128" :style="{ color: '#cbd5e1' }" />
            <text class="empty-text">该筛选条件下<br/>没有找到任何订单</text>
            <view class="reset-btn" @tap="resetFilters">
              <text class="reset-text">重置筛选</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 时间筛选弹窗 -->
    <view v-if="showTimePicker" class="picker-modal" @tap="showTimePicker = false">
      <view class="picker-content" @tap.stop>
        <view class="picker-handle"></view>
        <text class="picker-title">筛选时间范围</text>
        
        <view class="picker-options">
          <view 
            v-for="(label, key) in rangeLabels" 
            :key="key"
            class="picker-option"
            :class="{'selected': selectedRange === key}"
            @tap="selectTimeRange(key)"
          >
            <text class="option-label">{{ label }}</text>
            <view v-if="selectedRange === key" class="option-check"></view>
          </view>
        </view>
        
        <view class="picker-cancel" @tap="showTimePicker = false">
          <text class="cancel-text">取消</text>
        </view>
      </view>
    </view>
    
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
import Icon from '@/components/Icon.vue'

const theme = ref(uni.getStorageSync('theme') || 'light')
const { headerTotalHeight } = useHeaderHeight()

const filter = ref('ALL')
const showTimePicker = ref(false)
const selectedRange = ref('ALL')

const statusTabs = [
  { value: 'ALL', label: '全部状态' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'PROCESSING', label: 'PROCESSING' },
  { value: 'COMPLETED', label: 'COMPLETED' },
  { value: 'CANCELLED', label: 'CANCELLED' }
]

const rangeLabels = {
  ALL: '全部时间',
  TODAY: '今日订单',
  WEEK: '最近7天',
  MONTH: '最近30天'
}

// 筛选订单
const filteredOrders = computed(() => {
  return MOCK_ORDERS.filter(order => {
    // 状态筛选
    const statusMatch = filter.value === 'ALL' || order.status === filter.value
    
    // 时间筛选（简化版，实际应该用日期比较）
    const orderDate = order.createdAt.split(' ')[0]
    let timeMatch = true
    
    if (selectedRange.value === 'TODAY') {
      timeMatch = orderDate === '2024-10-25'
    } else if (selectedRange.value === 'WEEK') {
      timeMatch = orderDate.startsWith('2024-10')
    } else if (selectedRange.value === 'MONTH') {
      timeMatch = orderDate.includes('2024')
    }
    
    return statusMatch && timeMatch
  })
})

const getStatusText = (status) => {
  const statusMap = {
    'PENDING': 'PENDING',
    'PROCESSING': 'PROCESSING',
    'COMPLETED': 'COMPLETED',
    'CANCELLED': 'CANCELLED'
  }
  return statusMap[status] || status
}

const getOrderDate = (createdAt) => {
  return createdAt.split(' ')[0]
}

const selectTimeRange = (range) => {
  selectedRange.value = range
  showTimePicker.value = false
}

const resetFilters = () => {
  filter.value = 'ALL'
  selectedRange.value = 'ALL'
}

const goToOrderDetail = (orderId) => {
  uni.navigateTo({
    url: `/pages/order-detail/order-detail?id=${orderId}`
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.orders-container {
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

.orders-header {
  @include flex(row, space-between, flex-start);
  margin-bottom: 16rpx;
}

.header-left {
  @include flex(column, flex-start, flex-start, 4rpx);
}

.header-title {
  @include text-style(40rpx, $font-weight-black, $color-text-primary); // 增大字体：从 xl 改为 40rpx
  
  @include dark-mode {
    color: #fff;
  }
}

.header-range {
  @include text-style(22rpx, $font-weight-black, $color-primary); // 增大字体：从 18rpx 改为 22rpx
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-top: 4rpx;
}

.time-filter-btn {
  padding: 20rpx;
  border-radius: 24rpx;
  box-shadow: $shadow-sm;
  border: 1rpx solid $color-border-light;
  background-color: #fff;
  @include flex(row, center, center);
  gap: 8rpx;
  transition: all 0.2s;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    border-color: $color-dark-border-light;
  }
  
  &.active {
    background-color: $color-primary;
    border-color: $color-primary;
    color: #fff;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.filter-badge {
  @include text-style(20rpx, $font-weight-black, #fff);
  margin-left: 4rpx;
}

.tabs-scroll {
  width: 100%;
  margin-bottom: 24rpx;
  white-space: nowrap;
  box-sizing: border-box;
}

.tabs-container {
  @include flex(row, flex-start, center, 8rpx); // 减小间距：从 16rpx 改为 8rpx
  padding: 0 0 16rpx 0;
  box-sizing: border-box;
}

.tab-item {
  flex-shrink: 0;
  padding: 20rpx 40rpx;
  border-radius: 24rpx;
  @include text-style(20rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: 1rpx solid transparent;
  background-color: #fff;
  transition: all 0.2s;
  white-space: nowrap;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    color: $color-dark-text-tertiary;
  }
  
  &.active {
    background-color: $color-primary;
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.2);
    border-color: $color-primary;
  }
}

.orders-list {
  @include flex(column, flex-start, flex-start, 24rpx);
  width: 100%;
  box-sizing: border-box;
}

.order-item {
  width: 100%;
  background-color: #fff;
  padding: 40rpx;
  border-radius: 40rpx;
  border: 1rpx solid $color-border-light;
  box-shadow: $shadow-sm;
  transition: all 0.3s;
  cursor: pointer;
  box-sizing: border-box;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    border-color: $color-dark-border-light;
  }
  
  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-md;
  }
}

.order-top {
  @include flex(row, space-between, flex-start);
  margin-bottom: 32rpx;
}

.order-id-section {
  @include flex(column, flex-start, flex-start, 8rpx);
}

.order-id-label {
  @include text-style(20rpx, $font-weight-bold, #94a3b8); // text-[10px] text-slate-400
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 8rpx;
  
  @include dark-mode {
    color: #94a3b8;
  }
}

.order-id-value {
  @include text-style(24rpx, $font-weight-bold, #1e293b); // text-xs font-bold text-slate-800
  font-family: monospace;
  
  @include dark-mode {
    color: #fff;
  }
}

.order-status {
  @include text-style(18rpx, $font-weight-black, #fff); // text-[9px] font-black
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  &.pending {
    background-color: $color-warning-bg;
    color: $color-warning-text;
    
    @include dark-mode {
      background-color: rgba(245, 158, 11, 0.4);
      color: #fbbf24;
    }
  }
  
  &.processing {
    background-color: $color-info-bg;
    color: $color-info-text;
    
    @include dark-mode {
      background-color: rgba(59, 130, 246, 0.4);
      color: #60a5fa;
    }
  }
  
  &.completed {
    background-color: $color-success-bg;
    color: $color-success-text;
    
    @include dark-mode {
      background-color: rgba(16, 185, 129, 0.4);
      color: #34d399;
    }
  }
  
  &.cancelled {
    background-color: $color-error-bg;
    color: $color-error-text;
    
    @include dark-mode {
      background-color: rgba(239, 68, 68, 0.4);
      color: #f87171;
    }
  }
}

.order-bottom {
  @include flex(row, space-between, center);
  padding-top: 32rpx;
  border-top: 1rpx solid $color-border-light;
  
  @include dark-mode {
    border-color: rgba(148, 163, 184, 0.3);
  }
}

.order-amounts {
  @include flex(row, flex-start, center, 24rpx);
  flex: 1;
}

.amount-text {
  @include text-style(36rpx, $font-weight-black, #0f172a); // text-lg font-black text-slate-900
  
  @include dark-mode {
    color: #fff;
  }
  
  &.primary {
    color: $color-primary; // text-blue-600
  }
}

.amount-currency {
  @include text-style(20rpx, $font-weight-bold, #94a3b8); // text-[10px] text-slate-400 font-bold
  
  .amount-text.primary & {
    opacity: 0.7; // opacity-70
  }
}

.order-date {
  @include flex(column, flex-end, flex-end, 8rpx);
}

.date-label {
  @include text-style(18rpx, $font-weight-bold, #94a3b8); // text-[9px] text-slate-400 font-bold
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.date-value {
  @include text-style(20rpx, $font-weight-bold, #475569); // text-[10px] font-bold text-slate-600
  
  @include dark-mode {
    color: #94a3b8; // dark:text-slate-400
  }
}

.empty-orders {
  width: 100%;
  padding: 192rpx 80rpx;
  @include flex(column, center, center, 32rpx);
  opacity: 0.3;
  box-sizing: border-box;
}

.empty-text {
  @include text-style($font-size-sm, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  text-align: center;
  line-height: 1.6;
  width: 100%;
  display: block;
}

.reset-btn {
  margin-top: 16rpx;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.reset-text {
  @include text-style(20rpx, $font-weight-black, $color-primary);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  border-bottom: 2rpx solid $color-primary;
  padding-bottom: 4rpx;
}

// 时间筛选弹窗
.picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20rpx);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.picker-content {
  width: 100%;
  max-width: 750rpx;
  background-color: #fff;
  border-radius: 50rpx 50rpx 0 0;
  padding: 64rpx;
  padding-bottom: 224rpx;
  max-height: 80vh;
  animation: slideUp 0.3s;
  box-sizing: border-box;
  
  @include dark-mode {
    background-color: #0f172a;
  }
}

.picker-handle {
  width: 96rpx;
  height: 8rpx;
  background-color: $color-border-light;
  border-radius: 4rpx;
  margin: 0 auto 48rpx;
  opacity: 0.5;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
  }
}

.picker-title {
  @include text-style($font-size-3xl, $font-weight-black, $color-text-primary);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 64rpx;
  width: 100%;
  display: block;
  box-sizing: border-box;
  
  @include dark-mode {
    color: #fff;
  }
}

.picker-options {
  @include flex(column, flex-start, flex-start, 16rpx);
}

.picker-option {
  width: 100%;
  padding: 40rpx;
  border-radius: 24rpx;
  @include flex(row, space-between, center);
  border: 2rpx solid transparent;
  transition: all 0.2s;
  background-color: #f8fafc; // bg-slate-50
  box-sizing: border-box;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
  }
  
  &.selected {
    background-color: rgba(219, 234, 254, 0.5); // bg-blue-50
    border-color: $color-primary; // border-blue-600
    
    @include dark-mode {
      background-color: rgba(37, 99, 235, 0.1);
    }
  }
  
  &:active {
    transform: scale(0.99);
  }
}

.option-label {
  @include text-style($font-size-lg, $font-weight-bold, $color-text-primary); // 增大字号：从 base 改为 lg
  
  .picker-option.selected & {
    color: $color-primary; // text-blue-600
  }
  
  @include dark-mode {
    color: $color-dark-text-primary;
    
    .picker-option.selected & {
      color: $color-primary;
    }
  }
}

.option-check {
  width: 24rpx;
  height: 24rpx;
  background-color: $color-primary; // bg-blue-600
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.5); // shadow-lg shadow-blue-400/50
  flex-shrink: 0;
}

.picker-cancel {
  width: 100%;
  margin-top: 64rpx;
  padding: 32rpx 0;
}

.cancel-text {
  @include text-style(24rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  text-align: center;
  width: 100%;
  display: block;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.bottom-nav-wrapper {
  position: fixed; // 固定定位，固定在屏幕底部
  bottom: 0;
  left: 50%; // 居中定位
  transform: translateX(-50%); // 居中偏移
  width: 100%;
  max-width: 896rpx; // 与 orders-container 保持一致
  z-index: $z-index-fixed;
  display: flex;
  justify-content: center;
  pointer-events: none; // 让点击事件穿透到子元素
  box-sizing: border-box;
}
</style>
