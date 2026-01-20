<template>
  <view class="home-container" :class="{'dark': theme === 'dark'}">
    <!-- Header 是 fixed，会脱离文档流，所以需要一个占位元素 -->
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header @balance-changed="handleBalanceChanged" />

    <scroll-view scroll-y class="scroll-content">
      <!-- API 连接状态提示（仅在顶部显示一次，不影响页面显示） -->
      <!-- 已隐藏，如需显示请将 v-if 改为 v-show 或移除注释 -->
      <!-- <view v-if="!apiConnected" class="api-status-banner-top">
        <text class="api-status-text">⚠️ 当前显示为测试数据，服务器连接失败</text>
      </view> -->
      <view class="content-wrapper">
        <!-- 资产卡片 -->
        <view class="balance-card" :class="{'zero-balance': balance <= 0}">
          <view class="balance-bg"></view>
          <view class="balance-content">
            <view class="balance-header">
              <view class="balance-label-wrapper">
                <text class="balance-label">Est. Total Balance</text>
                <view class="eye-btn" @tap="toggleShowBalance">
                  <Icon :name="showBalance ? 'Eye' : 'EyeSlash'" class="eye-icon" :style="{ color: '#ffffff' }" />
                </view>
              </view>
              <text class="balance-amount">
                {{ showBalance ? `$${balance.toLocaleString('en-US', {minimumFractionDigits: 2})}` : '••••••' }}
              </text>
            </view>
            <view class="shield-box">
              <Icon name="Shield" :size="148" :style="{ color: '#f0f0f0' }" />
             
            </view>
          </view>
          
          <!-- 按钮区域 -->
          <view class="balance-actions">
            <button 
              v-if="balance <= 0"
              class="action-btn primary full-width"
              @tap="goToDeposit"
            >
              <Icon name="Deposit" :size="42" :style="{ color: '#ffffff' }" />
              <text class="balance-actions-text">立即充值</text>
            </button>
            <view v-else class="action-buttons">
              <button class="action-btn secondary" @tap="goToExchange">
                <Icon name="Exchange" :size="46" :style="{ color: '#2563eb' }" />
                <text  class="balance-actions-text_2">快速兑换</text>
              </button>
              <button class="action-btn outline" @tap="goToDeposit">
                <Icon name="Deposit" :size="36" :style="{ color: '#ffffff' }" />
                <text class="balance-actions-text_2">充值资产</text>
              </button>
            </view>
          </view>
        </view>

        <!-- 全球网关模块 -->
        <view class="section">
          <view class="section-header">
            <text class="section-title">Global Gateways</text>
          </view>
          <view class="gateways-scroll-wrapper">
            <view class="gateways-scroll" :class="{ 'scroll-animation': gateways.length > 0 }" :style="{ '--scroll-distance': `-${132 * gateways.length}rpx` }">
              <view class="gateways-list">
                <!-- 第一组 -->
                <view 
                  v-for="(item, index) in gateways" 
                  :key="`first-${index}`"
                  class="gateway-item"
                  @tap="goToMarket"
                >
                  <view class="gateway-icon" :class="{ 'gateway-icon-small': item.code === 'CNY' }">
                    <image :src="getCurrencySvgPath(item.code)" class="gateway-icon-image" mode="aspectFit" />
                  </view>
                  <text class="gateway-label">{{ item.region }}</text>
                </view>
                <!-- 第二组（用于无缝循环） -->
                <view 
                  v-for="(item, index) in gateways" 
                  :key="`second-${index}`"
                  class="gateway-item"
                  @tap="goToMarket"
                >
                  <view class="gateway-icon" :class="{ 'gateway-icon-small': item.code === 'CNY' }">
                    <image :src="getCurrencySvgPath(item.code)" class="gateway-icon-image" mode="aspectFit" />
                  </view>
                  <text class="gateway-label">{{ item.region }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 热门行情 -->
        <view class="section">
          <view class="markets-list">
            <view class="markets-header">
              <text class="section-title2">HOT MARKETS</text>
              <text class="section-link" @tap="goToMarket">View All</text>
            </view>







            <view 
              v-for="(item, index) in hotMarkets" 
              :key="index"
              class="market-item"
              @tap="goToMarketDetail(item.symbol)"
            >
              <view class="market-left">
                <view class="market-icon">
                  <image 
                    v-if="getCurrencySvgPath(item.symbol.split('/')[0])" 
                    :src="getCurrencySvgPath(item.symbol.split('/')[0])" 
                    class="market-icon-image" 
                    mode="aspectFit" 
                  />
                  <text v-else class="currency-icon-small">{{ getCurrencyIcon(item.symbol.split('/')[0]) }}</text>
                </view>
                <view class="market-info">
                  <text class="market-symbol">{{ item.symbol }}</text>
                  <text class="market-label">LIVE RATE</text>
                </view>
              </view>

              <view class="market-volume">
                <Sparkline 
                  v-if="item.trend && item.trend.length >= 2"
                  :data="item.trend" 
                  :color="item.change24h >= 0 ? '#10b981' : '#ef4444'"
                  :width="100"
                  :height="30"
                />
              </view>

              <view class="market-right">
                <view class="market-price-wrapper">
                  <text class="market-price">${{ item.price.toLocaleString() }}</text>
                  <text class="market-change" :class="{'positive': item.change24h >= 0, 'negative': item.change24h < 0}">
                    {{ item.change24h > 0 ? '+' : '' }}{{ item.change24h }}%
                  </text>
                </view>
              </view>

            </view>




          </view>
        </view>

        <!-- 活动推广 -->
        <view class="section">
          <view class="news-list">
            <view 
              v-for="(news, index) in newsList" 
              :key="news.id || index"
              class="news-card"
              @tap="goToNews(news.id)"
            >
              <image :src="news.imageUrl" class="news-image" mode="aspectFill" @error="handleImageError"></image>
              <view class="news-overlay">
                <text class="news-title">{{ news.title && news.title[lang] ? news.title[lang] : (typeof news.title === 'string' ? news.title : '') }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="bottom-padding"></view>
      </view>
    </scroll-view>
    
    <!-- 底部导航 -->
    <view class="bottom-nav-wrapper">
      <BottomNav />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import store from '@/store/index.js'
import { MOCK_MARKET, MOCK_NEWS, CURRENCIES, FIAT_CURRENCIES } from '@/utils/constants.js'
import { getHotMarkets, getNewsList } from '@/api/index.js'

// ==================== 数据源配置 ====================
// 设置为 true 使用模拟数据，设置为 false 使用 API 数据
// 正式上线时，将此值改为 false 或直接删除此配置，使用 API
const USE_MOCK_DATA = true // TODO: 上线前改为 false
// ====================================================
import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'
import Icon from '@/components/Icon.vue'
import Sparkline from '@/components/Sparkline.vue'

// 响应式数据
const showBalance = ref(true)
const theme = ref('light')
const lang = ref('zh')
const balance = ref(12450.80)
const userAvatar = ref('https://picsum.photos/seed/user-main/100/100')
const unreadCount = ref(3)
const gateways = ref([])
const hotMarkets = ref([])
const newsList = ref([])
// 网关滚动使用 CSS 动画，不需要 JavaScript 定时器

// 使用通用的 Header 高度计算 composable
const { statusBarHeight, headerTotalHeight } = useHeaderHeight()

// 处理余额变化
const handleBalanceChanged = (newBalance) => {
  console.log('首页收到余额变化:', newBalance)
  balance.value = newBalance
}

// 切换余额显示
const toggleShowBalance = () => {
  showBalance.value = !showBalance.value
}

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

// 获取货币信息（用于显示图标和名称）
const getCurrencyInfo = (code) => {
  return CURRENCIES.find(c => c.code === code) || null
}

// 跳转到兑换页面
const goToExchange = () => {
  uni.navigateTo({
    url: '/pages/exchange/exchange'
  })
}

// 跳转到充值页面
const goToDeposit = () => {
  uni.navigateTo({
    url: '/pages/deposit/deposit'
  })
}

// 跳转到市场页面
const goToMarket = () => {
  uni.reLaunch({
    url: '/pages/market/market'
  })
}

// 跳转到市场详情页面
const goToMarketDetail = (symbol) => {
  uni.navigateTo({
    url: `/pages/market-detail/market-detail?symbol=${encodeURIComponent(symbol.replace('/', '-'))}`
  })
}

// 跳转到新闻页面
const goToNews = (id) => {
  if (id) {
    uni.navigateTo({
      url: `/pages/news/news?id=${id}`
    })
  }
}

// 图片加载错误处理
const handleImageError = (e) => {
  console.error('图片加载失败:', e)
}

// 监听 store 变化
watch(() => store.theme, (newVal) => {
  theme.value = newVal
}, { immediate: true })

watch(() => store.lang, (newVal) => {
  lang.value = newVal
}, { immediate: true })

watch(() => store.balance, (newVal) => {
  balance.value = newVal
}, { immediate: true })

// API 连接状态
// API 连接状态（用于显示提示）
const apiConnected = ref(true)

// 网关滚动使用 CSS 动画实现，无需 JavaScript 控制

// 加载数据
const loadData = async () => {
  // 网关列表直接从 constants.js 中的法币列表读取，不需要 API
  // 将法币数据转换为网关格式：{ region: 货币名称, code: 货币代码 }
  gateways.value = FIAT_CURRENCIES.map(currency => ({
    region: currency.name.zh || currency.name.en || currency.code,
    code: currency.code
  }))
  
  if (USE_MOCK_DATA) {
    // ========== 使用模拟数据（开发阶段） ==========
    // 模拟数据来源：@/utils/constants.js 中的 MOCK_MARKET
    // 包含完整的 trend 数组，可以直接用于曲线图显示
    hotMarkets.value = MOCK_MARKET.slice(0, 3) // 取前3条数据
    newsList.value = MOCK_NEWS || []
    apiConnected.value = false // 标记为使用模拟数据
    console.log('📊 使用模拟数据（开发模式）')
    // ============================================
  } else {
    // ========== 使用 API 数据（正式环境） ==========
    // API 函数内部已处理降级，失败时返回默认数据
    // 后端接口：GET /api/v1/markets/hot?limit=3
    // 返回格式要求：见 @/api/index.js 中的 getHotMarkets 函数注释
    hotMarkets.value = await getHotMarkets(3)
    newsList.value = await getNewsList(1, 10)
    
    // 判断是否使用了降级数据（API 失败时的默认数据）
    apiConnected.value = !(hotMarkets.value.length === 3 && 
                          hotMarkets.value[0]?.symbol === 'BTC/USDT' &&
                          newsList.value.length > 0 &&
                          newsList.value[0]?.id === 'news1')
    
    if (!apiConnected.value) {
      console.warn('⚠️ API 连接失败，已使用降级数据')
    } else {
      console.log('✅ API 数据加载成功')
    }
    // ============================================
  }
}

// uni-app 页面生命周期
onLoad(() => {
  theme.value = uni.getStorageSync('theme') || 'light'
  lang.value = uni.getStorageSync('lang') || 'zh'
  balance.value = store.balance || 12450.80
  userAvatar.value = store.userAvatar || 'https://picsum.photos/seed/user-main/100/100'
  unreadCount.value = store.unreadCount || 3
  
  // 状态栏高度已在 useHeaderHeight composable 中初始化（onMounted 时）
  // 但 onLoad 可能在 onMounted 之前执行，所以这里也需要初始化以确保同步
  // #ifdef APP-PLUS
  try {
    const systemInfo = uni.getSystemInfoSync()
    statusBarHeight.value = systemInfo.statusBarHeight || 0
    console.log('状态栏高度:', statusBarHeight.value, 'px')
  } catch (e) {
    console.error('获取系统信息失败:', e)
    statusBarHeight.value = 0
  }
  // #endif
  
  // #ifndef APP-PLUS
  // H5 端不需要状态栏高度
  statusBarHeight.value = 0
  // #endif
  
  // 加载接口数据
  loadData()
})
</script>

<style lang="scss" scoped>

// @import '../../styles/mixins.scss';
@import '@/styles/mixins.scss';
.home-container {
  min-height: 100vh;
  width: 100%; // 自适应屏幕宽度
  max-width: 896rpx; // 最大宽度限制 (448px = 896rpx，基于 750rpx 设计稿)
  margin-left: auto;
  margin-right: auto; // 居中
  background-color: $color-bg-primary; // 白色背景
  box-shadow: $shadow-2xl; // 外扩阴影
  position: relative;
  overflow-x: hidden; // 防止内容溢出
  display: flex;
  flex-direction: column;
  align-items: stretch; // 改为 stretch，让子元素占满宽度
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

// Header 占位元素，用于为 fixed 的 Header 预留空间
.header-placeholder {
  width: 100%;
  flex-shrink: 0;
}

.scroll-content {
  flex: 1;
  overflow-y: auto;
  // 不需要 padding-top，因为 home-container 已经为 Header 预留了空间
  padding-bottom: 200rpx; // 为底部导航预留空间
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%; // 确保不超过父容器宽度
  box-sizing: border-box;
}

.bottom-nav-wrapper {
  position: fixed; // 固定定位，固定在屏幕底部
  bottom: 0;
  left: 50%; // 居中定位
  transform: translateX(-50%); // 居中偏移
  width: 100%;
  max-width: 896rpx; // 与 home-container 保持一致
  z-index: $z-index-fixed;
  display: flex;
  justify-content: center;
  pointer-events: none; // 让点击事件穿透到子元素
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

.balance-card {
  position: relative;
  border-radius: $radius-7xl;
  padding: $spacing-6;
  background: $gradient-primary;
  overflow: hidden;
  
  &.zero-balance {
    background: $color-dark-bg-primary;
    border: 1rpx solid $color-dark-border;
  }
}

.balance-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 512rpx;
  height: 512rpx;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  filter: blur(120rpx);
  transform: translate(50%, -50%);
  animation: pulse 4s ease-in-out infinite;
}

.balance-content {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 72rpx;
}

.balance-header {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.balance-label-wrapper {
  display: flex;
  align-items: center;
  gap: 12rpx;
  opacity: 0.6;
}

.balance-label {
  @include text-style($font-size-sm, $font-weight-black, #fff);
  text-transform: uppercase;
  letter-spacing: $letter-spacing-widest;
}

.eye-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28rpx;
  height: 28rpx;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.9);
  }
}

.eye-icon {
  width: 32rpx;
  height: 32rpx;
  color: #ffffff;
  transition: color 0.2s;
}

.balance-amount {
  @include text-style($font-size-5xl, $font-weight-black, #fff);
  letter-spacing: $letter-spacing-tighter;
  margin-top: -10rpx;
 
}

.shield-box {
  width: 88rpx;
  height: 88rpx;

  border-radius: $radius-xl;
  @include flex(row, center, center);
  border: 1rpx solid rgba(255, 255, 255, 0.05);
}

.shield-icon {
  font-size: 48rpx;
}

.balance-actions {
  position: relative;
  z-index: 10;

 
}

.balance-actions-text {
  font-size: 32rpx;
}
.balance-actions-text_2 {
  font-size: 24rpx;
}
.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-2;
  
  
}

.action-btn {
  height: 72rpx;
  min-width: 250rpx;
  border-radius: $radius-3xl;
  @include text-style($font-size-base, $font-weight-black);
  @include flex(row, center, center, $spacing-1);
  @include transition(all, 0.2s cubic-bezier(0.4, 0, 0.2, 1));
  position: relative;
  overflow: hidden;
  
  // 点击动画
  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
  
  &.primary {
    background-color: $color-primary;
    color: #fff;
    box-shadow: $shadow-primary-lg;
    
    // 添加脉冲动画效果
    animation: buttonPulse 2s ease-in-out infinite;
  }
  
  &.secondary {
    background-color: #fff;
    color: $color-primary;
    box-shadow: $shadow-lg;
    
    &:active {
      background-color: rgba(37, 99, 235, 0.2);
    }
  }
  
  &.outline {
    @include glass(rgba(255, 255, 255, 0.1), $blur-sm);
    border: 1rpx solid rgba(255, 255, 255, 0.2);
    color: #fff;
    
    &:active {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}

.action-btn.full-width {
  width:90%;
  font-size: 40rpx;
  height: 110rpx;
  border-radius: 64rpx;
  /* 增强显眼度的效果 */
  // box-shadow: 0 8rpx 32rpx 0 rgba(37, 99, 235, 0.25), 0 1.5rpx 8rpx 0 rgba(37, 99, 235, 0.18);
  letter-spacing: 2rpx;
  font-weight: bold;
  transition: 
    transform 0.3s cubic-bezier(0.42, 0, 0.58, 1.0), 
    font-size 0.26s cubic-bezier(0.42, 0, 0.58, 1), 
    box-shadow 0.25s cubic-bezier(0.42, 0, 0.58, 1),
    background-color 0.3s ease-in-out;
  
  /* 按钮有轻微的浮起动画和颜色变化 */
  animation: buttonFloat 2s ease-in-out infinite, buttonColorShift 3s ease-in-out infinite;
  
  &:active {
    transform: scale(1.06);
    font-size: 44rpx;
    box-shadow: 0 16rpx 48rpx 0 rgba(37, 99, 235, 0.28), 0 2rpx 12rpx 0 rgba(37, 99, 235, 0.2);
    background-color: rgba(37, 99, 235, 0.95); // 点击时稍微变深
    animation: none; // 点击时停止动画
  }
}

.btn-icon {
  font-size: 32rpx;
}

.section {
  @include flex(column, flex-start, flex-start, $spacing-4);
}

.section-header {
  @include flex(row, space-between, center);
  padding: 0 $spacing-2;
  
  &-right {
    @include flex(row, flex-end, center, $spacing-2);
  }
}

.api-status-banner-top {
  background-color: $color-warning-bg;
  border: 1rpx solid $color-warning;
  border-radius: $radius-lg;
  padding: $spacing-3 $spacing-4;
  margin: $spacing-4 $spacing-5;
  margin-bottom: $spacing-2;
  
  @include dark-mode {
    background-color: rgba(245, 158, 11, 0.2);
    border-color: rgba(245, 158, 11, 0.4);
  }
}

.api-status-text {
  @include text-style($font-size-sm, $font-weight-normal, $color-warning-text);
  
  @include dark-mode {
    color: $color-warning;
  }
}

.section-title2 {
  @include text-style($font-size-base, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
 
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.section-title {
  @include text-style($font-size-base, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: $letter-spacing-widest;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.section-link {
  @include text-style($font-size-base, $font-weight-black, $color-primary);
  padding: $spacing-1 $spacing-4;
  background-color: $color-primary-bg;
  border-radius: $radius-lg;
  
  @include dark-mode {
    background-color: rgba(37, 99, 235, 0.3);
  }
}

.gateways-scroll-wrapper {
  width: 100%;
  overflow: hidden; // 隐藏溢出内容
  position: relative;
}

.gateways-scroll {
  width: 100%;
  overflow: hidden;
  
  &.scroll-animation .gateways-list {
    animation: gatewayScroll 30s linear infinite; // 30秒滚动一轮，可以调整速度
  }
}

.gateways-list {
  @include flex(row, flex-start, flex-start, $spacing-4);
  padding: 0 $spacing-2;
  display: inline-flex; // 确保内容不换行
  min-width: max-content; // 确保内容宽度足够
  width: max-content; // 确保宽度足够
}

// 无缝滚动动画
@keyframes gatewayScroll {
  0% {
    transform: translateX(0);
  }
  100% {
    // 滚动第一组的宽度，实现无缝循环
    // 使用 CSS 变量动态计算滚动距离
    transform: translateX(var(--scroll-distance, -792rpx));
  }
}

.gateway-item {
  @include flex(column, flex-start, center, $spacing-2);
  flex-shrink: 0;
}

.gateway-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: $radius-3xl;
  background-color: $color-bg-primary;
  @include flex(row, center, center);
  box-shadow: $shadow-md;
  border: 1rpx solid $color-border-light;
  overflow: hidden;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    border-color: $color-dark-border-light;
  }
}

.gateway-icon-image {
  width: 60%;
  height: 60%;
  object-fit: contain;
  padding: 8rpx; // 统一内边距，确保所有图标显示大小一致
}

// CNY 图标 viewBox 较小，需要更少的内边距来补偿
.gateway-icon-small .gateway-icon-image {
  padding: 4rpx; // CNY 图标需要更少的内边距，让它显示得更大
}

.currency-icon {
  font-size: 54rpx;
}

.gateway-label {
  @include text-style($font-size-xs, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
}

.markets-list {
  width: 100%;
  margin-right: 0; // 由于 content-wrapper 已有 40rpx padding，这里不需要额外 margin
  @include card($color-bg-primary, $radius-6xl);
  padding: $spacing-6;
  @include flex(column, flex-start, flex-start, $spacing-6);
  box-sizing: border-box; // 确保 padding 包含在宽度内
  
  @include dark-mode {
    background-color: rgba(30, 41, 59, 0.4);
    border-color: $color-dark-border;
  }
}

.markets-header {
  @include flex(row, space-between, center);
  width: 100%;
  .section-title {
    margin: 0;
  }
  
  .section-link {
    margin: 0;
  }
}

.market-item {
  @include flex(row, space-between, center);
  width: 100%;
  padding: $spacing-1 0;
  box-sizing: border-box;
  transition: background-color 0.2s;
  cursor: pointer;
  
  &:active {
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: $radius-md;
  }
  
  @include dark-mode {
    &:active {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
}

.market-left {
  @include flex(row, flex-start, center, $spacing-4);
}

.market-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: $radius-xl;
  background-color: $color-bg-tertiary;
  @include flex(row, center, center);
  box-shadow: $shadow-inner;
  overflow: hidden;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
  }
}

.market-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10rpx; // 统一内边距，确保所有图标显示大小一致
}

.currency-icon-small {
  font-size: 56rpx;
}

.market-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.market-symbol {
  @include text-style($font-size-md, $font-weight-black, $color-text-primary-light);
  line-height: $line-height-tight;
}

.market-label {
  @include text-style($font-size-sm, $font-weight-normal, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5rpx;
}

.market-volume {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 $spacing-4;
  min-width: 0; // 允许 flex 子元素收缩
}

.market-right {
  @include flex(row, flex-end, center, $spacing-2);
  flex-shrink: 0;
  margin-left: auto;
}

.market-price-wrapper {
  @include flex(column, flex-end, baseline, $spacing-2);
  text-align: right;
}

.market-price {
  @include text-style($font-size-md, $font-weight-black, $color-text-primary-light);
  line-height: $line-height-tight;


  white-space: nowrap;
}

.market-change {
  @include text-style($font-size-base, $font-weight-bold);
  white-space: nowrap;
  width: 100%;
  text-align: right;
  line-height: $line-height-tight;
  
  &.positive {
    color: $color-success;
  }
  
  &.negative {
    color: $color-error;
  }
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx; // space-y-4 = 1rem = 32rpx
  width: 100%;
}

.news-card {
  position: relative;
  height: 220rpx !important; // h-40 = 10rem = 160px = 320rpx
  border-radius: 66rpx !important; // rounded-[2.2rem] = 2.2 * 16px = 35.2px = 88rpx
  overflow: hidden !important;
  box-shadow: $shadow-lg;
  border: 1rpx solid $color-border;
  width: 100% !important;
  
  @include dark-mode {
    border-color: $color-dark-border;
  }
  
  // 点击效果
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.news-image {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block;
}

.news-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%);
  padding: 48rpx; // p-6 = 1.5rem = 24px = 48rpx
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.news-title {
  font-size: 28rpx; // text-sm = 14px = 28rpx
  font-weight: 900; // font-black
  color: #fff;
  line-height: 1.2; // leading-tight
  letter-spacing: -1rpx; // tracking-tight
}

.bottom-padding {
  height: 200rpx;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.6;
  }
}

// 按钮浮起动画
@keyframes buttonFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4rpx);
  }
}

// 按钮颜色变化动画（轻微）
@keyframes buttonColorShift {
  0%, 100% {
    background-color: $color-primary; // #2563eb (blue-600)
  }
  50% {
    background-color: rgba(7, 54, 184, 0.8); // 稍微变亮一点
  }
}

// 按钮脉冲动画（阴影变化）
@keyframes buttonPulse {
  0%, 100% {
    box-shadow: 0 8rpx 32rpx 0 rgba(37, 99, 235, 0.25), 0 1.5rpx 8rpx 0 rgba(37, 99, 235, 0.18);
  }
  50% {
    box-shadow: 0 12rpx 40rpx 0 rgba(37, 99, 235, 0.35), 0 2rpx 12rpx 0 rgba(37, 99, 235, 0.25);
  }
}
</style>
