<template>
  <view class="detail-container" :class="{'dark': theme === 'dark'}">
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header />
    
    <!-- 行情详情导航栏 -->
    <PageNav :title="symbol || '行情详情'" />
    
    <scroll-view scroll-y class="scroll-content" :style="{ height: `calc(100vh - ${headerTotalHeight}rpx - 120rpx - var(--bottom-nav-height))` }">
      <view class="content-wrapper">
        <view v-if="!apiConnected" class="api-banner">
          <text class="api-text">⚠️ 当前显示为测试数据，服务器连接失败</text>
        </view>
        
        <!-- 价格卡片 -->
        <view v-if="marketDetail" class="price-card">
          <view class="price-left">
            <text class="price-label">当前价格</text>
            <text class="price-value">${{ marketDetail.price?.toLocaleString() || '0' }}</text>
            <view class="price-change-wrapper">
              <text class="price-change-icon" :class="{'up': marketDetail.change24h >= 0, 'down': marketDetail.change24h < 0}">
                {{ marketDetail.change24h >= 0 ? '▲' : '▼' }}
              </text>
              <text class="price-change" :class="{'positive': marketDetail.change24h >= 0, 'negative': marketDetail.change24h < 0}">
                {{ Math.abs(marketDetail.change24h || 0) }}%
              </text>
            </view>
          </view>
          <view class="price-right">
            <text class="volume-label">24H 成交量</text>
            <text class="volume-value">{{ marketDetail.volume || '0' }}</text>
          </view>
        </view>

        <!-- 曲线图 -->
        <view v-if="marketDetail && marketDetail.trend && marketDetail.trend.length >= 2" class="chart-card">
          <view class="chart-container">
            <!-- APP 端使用 image 标签配合 base64 SVG -->
            <!-- #ifdef APP-PLUS -->
            <image 
              v-if="chartImageSrc"
              :src="chartImageSrc" 
              class="chart-image"
              mode="aspectFit"
            />
            <!-- #endif -->
            
            <!-- H5 端使用原生 SVG -->
            <!-- #ifndef APP-PLUS -->
            <svg class="chart-svg" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs>
                <linearGradient :id="`chart-grad-${symbol}`" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" :stop-color="chartColor" stop-opacity="0.2" />
                  <stop offset="100%" :stop-color="chartColor" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path :d="chartPathClosed" :fill="`url(#chart-grad-${symbol})`" />
              <path :d="chartPath" fill="none" :stroke="chartColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <!-- #endif -->
          </view>
        </view>

        <!-- 24h 最高/最低 -->
        <view v-if="marketDetail" class="stats-grid">
          <view class="stat-card">
            <text class="stat-label">24H 最高</text>
            <text class="stat-value">${{ marketDetail.high24h?.toLocaleString() || '0' }}</text>
          </view>
          <view class="stat-card">
            <text class="stat-label">24H 最低</text>
            <text class="stat-value">${{ marketDetail.low24h?.toLocaleString() || '0' }}</text>
          </view>
        </view>

        <!-- 买入/卖出按钮 -->
        <view v-if="marketDetail" class="action-buttons">
          <button class="buy-btn" @tap="handleBuy">买入</button>
          <button class="sell-btn" @tap="handleSell">卖出</button>
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
import { getMarketDetail } from '@/api/index.js'
import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'
import PageNav from '@/components/PageNav.vue'
import store from '@/store/index.js'
import { CURRENCIES } from '@/utils/constants.js'
import { showToast } from '@/utils/toast'

const theme = ref(uni.getStorageSync('theme') || 'light')
const { headerTotalHeight } = useHeaderHeight()
const symbol = ref('')
const marketDetail = ref(null)
const apiConnected = ref(true)

onLoad(async (options) => {
  symbol.value = decodeURIComponent(options.symbol || '').replace('-', '/')
  try {
    marketDetail.value = await getMarketDetail(symbol.value)
    apiConnected.value = marketDetail.value && marketDetail.value.price > 0
  } catch (error) {
    console.error('加载市场详情失败:', error)
    apiConnected.value = false
  }
})

onMounted(() => {
  theme.value = store.theme || 'light'
})

// 计算图表颜色
const chartColor = computed(() => {
  if (!marketDetail.value) return '#10b981'
  return marketDetail.value.change24h >= 0 ? '#10b981' : '#ef4444'
})

// 生成图表路径
const generateChartPath = (data, width, height, close = false) => {
  if (!data || data.length < 2) return ''
  
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 10
  const h = height - padding * 2
  
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - padding - ((val - min) / range) * h
  }))
  
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const cpX = (p0.x + p1.x) / 2
    d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`
  }
  
  if (close) {
    d += ` L ${width} ${height} L 0 ${height} Z`
  }
  
  return d
}

const chartPath = computed(() => {
  if (!marketDetail.value || !marketDetail.value.trend || marketDetail.value.trend.length < 2) {
    return ''
  }
  return generateChartPath(marketDetail.value.trend, 400, 200, false)
})

const chartPathClosed = computed(() => {
  if (!marketDetail.value || !marketDetail.value.trend || marketDetail.value.trend.length < 2) {
    return ''
  }
  return generateChartPath(marketDetail.value.trend, 400, 200, true)
})

// APP 端：生成 base64 编码的 SVG data URI
const chartImageSrc = computed(() => {
  // #ifdef APP-PLUS
  if (!marketDetail.value || !marketDetail.value.trend || marketDetail.value.trend.length < 2) {
    return ''
  }
  
  const path = chartPath.value
  const pathClosed = chartPathClosed.value
  const color = chartColor.value
  
  if (!path) return ''
  
  // 构建完整的 SVG 内容（包含渐变和路径）
  const safeSymbol = symbol.value.replace(/[^a-zA-Z0-9]/g, '-')
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200" preserveAspectRatio="none">
    <defs>
      <linearGradient id="chart-grad-${safeSymbol}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.2" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path d="${pathClosed}" fill="url(#chart-grad-${safeSymbol})" />
    <path d="${path}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`
  
  try {
    // 使用 btoa 进行 base64 编码
    if (typeof btoa !== 'undefined') {
      // 先进行 URI 编码，再 base64 编码
      const encoded = encodeURIComponent(svgContent)
      const base64 = btoa(unescape(encoded))
      return `data:image/svg+xml;base64,${base64}`
    }
  } catch (e) {
    console.error('Chart base64 encoding error:', e)
  }
  
  return ''
  // #endif
  
  // #ifndef APP-PLUS
  return ''
  // #endif
})

// 处理买入
const handleBuy = () => {
  if (!marketDetail.value) return
  const baseCurrency = marketDetail.value.symbol.split('/')[0]
  const isSupported = CURRENCIES.some(c => c.code === baseCurrency)
  
  if (!isSupported) {
    showToast({
      message: `该币种(${baseCurrency})暂未开放买入通道`,
      type: 'none',
      duration: 2000
    })
    return
  }
  
  uni.navigateTo({
    url: `/pages/exchange/exchange?target=${baseCurrency}`
  })
}

// 处理卖出
const handleSell = () => {
  if (!marketDetail.value) return
  const baseCurrency = marketDetail.value.symbol.split('/')[0]
  const isSupported = CURRENCIES.some(c => c.code === baseCurrency)
  
  if (!isSupported) {
    showToast({
      message: `该币种(${baseCurrency})暂未开放卖出通道`,
      type: 'none',
      duration: 2000
    })
    return
  }
  
  uni.navigateTo({
    url: `/pages/deposit/deposit?currency=${baseCurrency}`
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.detail-container {
  min-height: 100vh;
  background-color: #f8fafc;
  
  @include dark-mode {
    background-color: #020617;
  }
}

.header-placeholder {
  width: 100%;
}

.scroll-content {
  height: calc(100vh - var(--header-height) - 120rpx - var(--bottom-nav-height));
}

.content-wrapper {
  padding: 40rpx;
  padding-bottom: 160rpx;
  box-sizing: border-box;
}

.api-banner {
  padding: 24rpx 32rpx;
  background-color: $color-warning-bg;
  border-radius: 40rpx;
  margin-bottom: 32rpx;
}

.api-text {
  @include text-style(24rpx, $font-weight-bold, $color-warning-text);
}

.price-card {
  background-color: #fff;
  padding: 48rpx;
  border-radius: 50rpx;
  border: 1rpx solid $color-border-light;
  box-shadow: $shadow-sm;
  @include flex(row, space-between, flex-end);
  margin-bottom: 32rpx;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
}

.price-left {
  @include flex(column, flex-start, flex-start, 8rpx);
  flex: 1;
}

.price-label {
  @include text-style(20rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.price-value {
  @include text-style(60rpx, $font-weight-black, $color-text-black);
  font-family: monospace;
  line-height: 1.2;
  
  @include dark-mode {
    color: #fff;
  }
}

.price-change-wrapper {
  @include flex(row, flex-start, center, 8rpx);
  margin-top: 8rpx;
}

.price-change-icon {
  font-size: 24rpx;
  
  &.up {
    color: $color-success;
  }
  
  &.down {
    color: $color-error;
  }
}

.price-change {
  @include text-style(28rpx, $font-weight-black, $color-text-black);
  
  &.positive {
    color: $color-success;
  }
  
  &.negative {
    color: $color-error;
  }
}

.price-right {
  @include flex(column, flex-end, flex-end, 8rpx);
  text-align: right;
}

.volume-label {
  @include text-style(20rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.volume-value {
  @include text-style(32rpx, $font-weight-black, $color-text-black);
  font-family: monospace;
  
  @include dark-mode {
    color: #fff;
  }
}

.chart-card {
  background-color: #fff;
  padding: 32rpx;
  border-radius: 50rpx;
  border: 1rpx solid $color-border-light;
  box-shadow: $shadow-sm;
  margin-bottom: 32rpx;
  height: 400rpx;
  position: relative;
  overflow: hidden;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
}

.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.chart-image {
  width: 100%;
  height: 100%;
  display: block;
}

.stats-grid {
  @include flex(row, space-between, center, 24rpx);
  margin-bottom: 32rpx;
}

.stat-card {
  flex: 1;
  background-color: #fff;
  padding: 32rpx;
  border-radius: 40rpx;
  border: 1rpx solid $color-border-light;
  box-shadow: $shadow-sm;
  @include flex(column, center, center, 8rpx);
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
}

.stat-label {
  @include text-style(20rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.stat-value {
  @include text-style(36rpx, $font-weight-black, $color-text-black);
  font-family: monospace;
  
  @include dark-mode {
    color: #fff;
  }
}

.action-buttons {
  @include flex(row, space-between, center, 24rpx);
  margin-top: 32rpx;
}

.buy-btn,
.sell-btn {
  flex: 1;
  padding: 32rpx 0;
  border-radius: 50rpx;
  @include text-style(32rpx, $font-weight-black, #fff);
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  transition: all 0.2s;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  text-align: center; // 居中设置
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    transform: scale(0.98);
  }
  
  &::after {
    border: none !important;
    display: none !important;
  }
}


.buy-btn {
  background-color: $color-success;
  box-shadow: 0 8rpx 24rpx rgba(16, 185, 129, 0.3);
  
  &:active {
    background-color: #059669;
  }
}

.sell-btn {
  background-color: $color-error;
  box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.3);
  
  &:active {
    background-color: #dc2626;
  }
}

.bottom-nav-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $z-index-fixed;
  width: 100%;
  max-width: 896rpx;
  margin: 0 auto;
  box-sizing: border-box;
}
</style>



