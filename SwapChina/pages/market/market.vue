<template>
  <view class="market-container" :class="{'dark': theme === 'dark'}">
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header />
    
    <view class="tabs">
      <view 
        class="tab-item"
        :class="{'active': activeTab === 'CRYPTO'}"
        @tap="activeTab = 'CRYPTO'"
      >
        Crypto
      </view>
      <view 
        class="tab-item"
        :class="{'active': activeTab === 'FIAT'}"
        @tap="activeTab = 'FIAT'"
      >
        Fiat Rates
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <view class="content-wrapper">
        <view 
          v-for="item in filteredMarket" 
          :key="item.symbol"
          class="market-item"
          @tap="goToDetail(item.symbol)"
        >
          <view class="market-left">
            <view class="market-icon">
              <image 
                v-if="getCurrencySvgPath(item.symbol.split('/')[0])" 
                :src="getCurrencySvgPath(item.symbol.split('/')[0])" 
                class="market-icon-image" 
                mode="aspectFit" 
              />
              <text v-else class="currency-icon">{{ getCurrencyIcon(item.symbol.split('/')[0]) }}</text>
            </view>
            <view class="market-info">
              <text class="market-symbol">{{ item.symbol }}</text>
              <text class="market-volume">Vol: {{ item.volume }}</text>
            </view>
          </view>

          <!-- Sparkline 曲线图 -->
          <view class="market-sparkline">
            <Sparkline 
              v-if="item.trend && item.trend.length >= 2"
              :data="item.trend" 
              :color="item.change24h >= 0 ? '#10b981' : '#ef4444'"
              :width="100"
              :height="30"
            />
          </view>

          <view class="market-right">
            <text class="market-price">${{ item.price.toLocaleString() }}</text>
            <view class="market-change-row">
              <text class="change-arrow" :class="{'positive': item.change24h >= 0, 'negative': item.change24h < 0}">
                {{ item.change24h >= 0 ? '▲' : '▼' }}
              </text>
              <text class="market-change" :class="{'positive': item.change24h >= 0, 'negative': item.change24h < 0}">
                {{ item.change24h > 0 ? '+' : '' }}{{ item.change24h }}%
              </text>
            </view>
          </view>
        </view>

        <!-- Market Insight -->
        <view class="insight-card">
          <view class="insight-header">
            <view class="ai-badge">AI</view>
            <text class="insight-title">Market Insight</text>
          </view>
          <text class="insight-text">
            USDT liquidity in the West African market (NGN/KES) is currently at a 3-month high. Spread rates have tightened, making this an ideal time for cross-continental transfers.
          </text>
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
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { MOCK_MARKET, CURRENCIES } from '@/utils/constants.js'
import { getAllMarkets } from '@/api/index.js'
import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'
import Sparkline from '@/components/Sparkline.vue'

// ==================== 数据源配置 ====================
const USE_MOCK_DATA = true // TODO: 上线前改为 false
// ====================================================

const theme = ref('light')
const activeTab = ref('CRYPTO')
const marketData = ref([])

const { headerTotalHeight } = useHeaderHeight()

const filteredMarket = computed(() => {
  return marketData.value.filter(m => m.type === activeTab.value)
})

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

const goToDetail = (symbol) => {
  uni.navigateTo({
    url: `/pages/market-detail/market-detail?symbol=${encodeURIComponent(symbol.replace('/', '-'))}`
  })
}

// 加载数据
const loadData = async () => {
  if (USE_MOCK_DATA) {
    marketData.value = MOCK_MARKET
  } else {
    marketData.value = await getAllMarkets()
  }
}

onLoad(() => {
  theme.value = uni.getStorageSync('theme') || 'light'
  loadData()
})
</script>

<style scoped>
.market-container {
  min-height: 100vh;
  background-color: #f8fafc;
  transition: background-color 0.3s;
}

.market-container.dark {
  background-color: #0f172a;
}

.header-placeholder {
  width: 100%;
}

.tabs {
  display: flex;
  gap: 32rpx;
  padding: 32rpx;
  border-bottom: 1rpx solid #e2e8f0;
}

.market-container.dark .tabs {
  border-bottom-color: #334155;
}

.tab-item {
  padding-bottom: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #94a3b8;
  transition: all 0.3s;
  position: relative;
}

.tab-item.active {
  color: #2563eb;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background-color: #2563eb;
  border-radius: 2rpx;
}

.scroll-content {
  height: calc(100vh - 200rpx);
  flex: 1;
  padding-bottom: 200rpx;
}

.bottom-nav-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.content-wrapper {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.market-item {
  background-color: #fff;
  padding: 32rpx;
  border-radius: 24rpx;
  border: 1rpx solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.market-item:hover {
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
}

.market-container.dark .market-item {
  background-color: #1e293b;
  border-color: #334155;
}

.market-item:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.market-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.market-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.market-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10rpx;
}

.market-container.dark .market-icon {
  background-color: #0f172a;
}

.currency-icon {
  font-size: 48rpx;
}

.market-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.market-symbol {
  font-size: 28rpx;
  font-weight: 700;
  color: #1e293b;
}

.market-container.dark .market-symbol {
  color: #fff;
}

.market-volume {
  font-size: 20rpx;
  color: #94a3b8;
}

.market-sparkline {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32rpx;
  min-width: 0;
}

.market-right {
  text-align: right;
  flex-shrink: 0;
}

.market-price {
  font-size: 36rpx;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8rpx;
  display: block;
}

.market-container.dark .market-price {
  color: #fff;
}

.market-change-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
  font-size: 24rpx;
}

.change-arrow {
  font-size: 20rpx;
}

.market-change {
  font-size: 24rpx;
  font-weight: 700;
}

.market-change.positive,
.change-arrow.positive {
  color: #10b981;
}

.market-change.negative,
.change-arrow.negative {
  color: #ef4444;
}

.insight-card {
  background-color: #dbeafe;
  padding: 32rpx;
  border-radius: 24rpx;
  border: 1rpx solid #bfdbfe;
}

.market-container.dark .insight-card {
  background-color: rgba(37, 99, 235, 0.2);
  border-color: rgba(37, 99, 235, 0.3);
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.ai-badge {
  width: 48rpx;
  height: 48rpx;
  background-color: #2563eb;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  font-style: italic;
}

.insight-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1e40af;
}

.market-container.dark .insight-title {
  color: #93c5fd;
}

.insight-text {
  font-size: 24rpx;
  color: #1e40af;
  line-height: 1.6;
}

.market-container.dark .insight-text {
  color: #bfdbfe;
}
</style>

