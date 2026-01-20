<template>
  <view class="exchange-container" :class="{'dark': theme === 'dark'}">
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header />
    
    <scroll-view scroll-y class="scroll-content">
      <view class="content-wrapper">
        <!-- 资产状态 -->
        <view class="balance-card">
          <view class="balance-info">
            <text class="balance-label">{{ t.exchange.balance }}</text>
            <text class="balance-amount">${{ balance.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</text>
          </view>
          <view class="wallet-btn" @tap="goToDeposit">
            <Icon name="Wallet" :size="48" :style="{ color: '#2563eb' }" />
          </view>
        </view>

        <!-- 兑换输入区域 -->
        <view class="exchange-section">
          <view class="input-box">
            <text class="input-label">{{ t.exchange.send }}</text>
            <view class="input-row">
              <input 
                ref="amountInputRef"
                type="digit"
                v-model="fromAmount" 
                placeholder="0.00" 
                class="amount-input"
                placeholder-style="color:#9ca3af; opacity: 0.8;"
                :focus="isInputFocused"
              />
              <view class="currency-tag">
                <text class="currency-tag-text">USD</text>
              </view>
            </view>
          </view>

          <!-- 交换图标 -->
          <view class="swap-icon-wrapper">
           
              <view class="swap-icon-box">    
                <Icon name="ArrowUpDown" :size="88" :style="{ color: '#2563eb' }" />
              </view>
           
          </view>

          <view class="input-box">
            <text class="input-label">{{ t.exchange.receive }}</text>
            <view class="input-row">
              <text class="amount-output">{{ estimatedOutput }}</text>
              <view class="currency-selector" @tap="showCurrencyPicker = true">
                <view class="currency-icon-wrapper">
                  <image 
                    v-if="getCurrencySvgPath(toCurrencyCode)" 
                    :src="getCurrencySvgPath(toCurrencyCode)" 
                    class="currency-icon-image" 
                    mode="aspectFit" 
                  />
                  <text v-else class="currency-icon-text">{{ getCurrencyIcon(toCurrencyCode) }}</text>
                </view>
                <text class="currency-code">{{ toCurrencyCode }}</text>
                <text class="chevron-icon">▼</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 收款账户选择 -->
        <view class="accounts-section">
          <text class="section-title">
            {{ toCurrencyCode === 'USDT' || toCurrencyCode === 'BTC' ? '接收钱包' : '收款账户' }}
          </text>
          
          <view v-if="availableAccounts.length > 0" class="accounts-list">
            <view 
              v-for="acc in availableAccounts" 
              :key="acc.id"
              class="account-item"
              :class="{'selected': selectedAccount?.id === acc.id}"
              @tap="selectedAccount = acc"
            >
              <view class="account-left">
                <view class="account-icon-box" :class="{'selected': selectedAccount?.id === acc.id}">
                  <Icon 
                    :name="acc.type === 'BANK' ? 'BankIcon' : (acc.type === 'CRYPTO' ? 'CryptoIcon' : 'Wallet')" 
                    :size="44" 
                    :style="{ color: selectedAccount?.id === acc.id ? '#ffffff' : '#2563eb' }" 
                  />
                </view>
                <view class="account-info">
                  <text class="account-provider">{{ acc.provider }} {{ acc.network ? `(${acc.network})` : '' }}</text>
                  <text class="account-number">{{ acc.accountNumber }}</text>
                </view>
              </view>
              <view v-if="selectedAccount?.id === acc.id" class="check-mark">✓</view>
            </view>
          </view>
          
          <view v-else class="empty-accounts" @tap="goToAssets">
           
            <text class="empty-text">改币种暂无收款方式，去选择添加</text>
          </view>
        </view>

        <!-- 底部按钮 -->
        <view class="footer-actions">
          <button 
            class="submit-btn"
            :class="{'disabled': balance <= 0 || availableAccounts.length === 0}"
            @tap="handleSubmit"
            :disabled="balance <= 0 || availableAccounts.length === 0"
          >
            {{ balance <= 0 ? '可用余额不足' : (availableAccounts.length === 0 ? '请先添加收款方式' : '立即兑换并结算') }}
          </button>
          <text class="tip-text">
            提示：加密货币结算通常在15-30分钟内完成，法币银行营业可能需要1个工作日。
          </text>
        </view>
      </view>
    </scroll-view>

    <!-- 币种选择弹窗 -->
    <view v-if="showCurrencyPicker" class="picker-modal" @tap="showCurrencyPicker = false">
      <view class="picker-content" @tap.stop>
        <text class="picker-title">选择结算币种</text>
        <scroll-view scroll-y class="picker-list">
          <view 
            v-for="curr in CURRENCIES" 
            :key="curr.code"
            class="picker-item"
            :class="{'selected': toCurrencyCode === curr.code}"
            @tap="selectCurrency(curr.code)"
          >
            <view class="picker-item-left">
              <view class="picker-icon-wrapper">
                <image 
                  v-if="getCurrencySvgPath(curr.code)" 
                  :src="getCurrencySvgPath(curr.code)" 
                  class="picker-icon-image" 
                  mode="aspectFit" 
                />
                <text v-else class="picker-icon">{{ getCurrencyIcon(curr.code) }}</text>
              </view>
              <view class="picker-item-info">
                <text class="picker-code">{{ curr.code }}</text>
                <text class="picker-type">{{ curr.type === 'CRYPTO' ? '加密网络' : '本地法币' }}</text>
              </view>
            </view>
            <view v-if="toCurrencyCode === curr.code" class="picker-check"></view>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 底部导航 -->
    <view class="bottom-nav-wrapper">
      <BottomNav />
    </view>
    
    <!-- Toast 提示 -->
    <Toast :message="toastMessage" :type="toastType" />
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import store from '@/store/index.js'
import { CURRENCIES, MOCK_ACCOUNTS } from '@/utils/constants.js'
import { TRANSLATIONS } from '@/utils/constants.js'
import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'
import Icon from '@/components/Icon.vue'
import Toast from '@/components/Toast.vue'

const theme = ref('light')
const lang = ref('zh')
const balance = ref(12450.80)
const fromAmount = ref('')
const toCurrencyCode = ref('CNY')
const selectedAccount = ref(null)
const showCurrencyPicker = ref(false)
const amountInputRef = ref(null)
const isInputFocused = ref(false)

// Toast 状态
const toastMessage = ref('')
const toastType = ref('none')
let toastTimer = null

// 自定义 Toast 显示函数
const showToast = (msg, type = 'none') => {
  toastMessage.value = msg
  toastType.value = type
  
  // 清除之前的定时器
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
  
  // 2秒后隐藏
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
    toastType.value = 'none'
  }, 2000)
}

const { headerTotalHeight } = useHeaderHeight()

const t = computed(() => {
  return TRANSLATIONS[lang.value] || TRANSLATIONS.zh
})

const currentRate = computed(() => {
  const rates = {
    'CNY': 7.24,
    'EUR': 0.92,
    'NGN': 1540.0,
    'USDT': 1.0,
    'BTC': 0.000015
  }
  return rates[toCurrencyCode.value] || 1.0
})

const estimatedOutput = computed(() => {
  if (!fromAmount.value || isNaN(parseFloat(fromAmount.value))) return '0.00'
  const result = parseFloat(fromAmount.value) * currentRate.value
  return toCurrencyCode.value === 'BTC' ? result.toFixed(8) : result.toFixed(2)
})

const availableAccounts = computed(() => {
  return MOCK_ACCOUNTS.filter(acc => acc.currency === toCurrencyCode.value)
})

// 监听币种变化，自动选择第一个账户
watch(toCurrencyCode, () => {
  if (availableAccounts.value.length > 0) {
    selectedAccount.value = availableAccounts.value[0]
  } else {
    selectedAccount.value = null
  }
}, { immediate: true })

const getCurrencyIcon = (code) => {
  const currency = CURRENCIES.find(c => c.code === code)
  return currency?.symbol || '💵'
}

const getCurrencySvgPath = (code) => {
  const currency = CURRENCIES.find(c => c.code === code)
  return currency?.svgPath || null
}

const selectCurrency = (code) => {
  toCurrencyCode.value = code
  showCurrencyPicker.value = false
}

const goToDeposit = () => {
  uni.navigateTo({
    url: '/pages/deposit/deposit'
  })
}

const goToAssets = () => {
  uni.switchTab({
    url: '/pages/assets/assets'
  })
}

const handleSubmit = () => {
  if (balance.value <= 0) {
    showToast('账户余额不足，请先充值', 'error')
    goToDeposit()
    return
  }
  if (!fromAmount.value || parseFloat(fromAmount.value) <= 0) {
    showToast('请输入有效的支付金额', 'error')
    return
  }
  if (!selectedAccount.value) {
    showToast(`请先添加 ${toCurrencyCode.value} 的收款方式`, 'error')
    goToAssets()
    return
  }
  showToast('兑换申请已提交', 'success')
  uni.switchTab({
    url: '/pages/orders/orders'
  })
}

// 页面加载完成后自动聚焦输入框
onMounted(() => {
  // 延迟一下确保 DOM 已渲染
  setTimeout(() => {
    isInputFocused.value = true
  }, 100)
})

onReady(() => {
  // 在 uni-app 中，使用 focus 属性而不是 focus() 方法
  nextTick(() => {
    isInputFocused.value = true
  })
})

onLoad((options) => {
  theme.value = uni.getStorageSync('theme') || 'light'
  lang.value = uni.getStorageSync('lang') || 'zh'
  balance.value = store.balance || 12450.80
  
  // 从路由参数获取目标币种
  if (options.target && CURRENCIES.some(c => c.code === options.target)) {
    toCurrencyCode.value = options.target
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.exchange-container {
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

.bottom-nav-wrapper {
  position: fixed; // 固定定位，固定在屏幕底部
  bottom: 0;
  left: 50%; // 居中定位
  transform: translateX(-50%); // 居中偏移
  width: 100%;
  max-width: 896rpx; // 与 exchange-container 保持一致
  z-index: $z-index-fixed;
  display: flex;
  justify-content: center;
  pointer-events: none; // 让点击事件穿透到子元素
  box-sizing: border-box;
}

.content-wrapper {
  width: 100%;
  padding: $spacing-4; // p-4 = 16rpx
  @include flex(column, flex-start, flex-start, $spacing-4); // space-y-4 = 16rpx
  padding-bottom: 200rpx;
  min-height: 100%;
  box-sizing: border-box;
}

.balance-card {
  width: 100%;
  background-color: $color-bg-primary;
  padding: $spacing-6; // p-6 = 24rpx
  border-radius: 44rpx; // rounded-[2.2rem] = 2.2 * 20rpx = 44rpx
  border: 1rpx solid $color-border-light;
  @include flex(row, space-between, center);
  box-shadow: $shadow-sm;
  box-sizing: border-box;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border;
  }
}

.balance-info {
  @include flex(column, flex-start, flex-start, $spacing-1);
}

.balance-label {
  @include text-style($font-size-sm, $font-weight-black, $color-text-tertiary); // 增大字体：从 text-[10px] 改为 text-sm (14px)
  text-transform: uppercase;
  letter-spacing: $letter-spacing-widest;
  opacity: 0.8;
  display: block;
  margin-bottom: 4rpx; // space-y-1
}

.balance-amount {
  @include text-style($font-size-4xl, $font-weight-black, $color-text-primary); // text-2xl
  letter-spacing: $letter-spacing-tighter;
  line-height: 1.2;
}

.wallet-btn {
  width: 88rpx; // w-11 = 44px = 88rpx
  height: 88rpx; // h-11 = 44px = 88rpx
  background-color: $color-primary-bg; // bg-blue-50
  border-radius: $radius-xl; // rounded-2xl = 24rpx
  @include flex(row, center, center);
  box-shadow: $shadow-inner;
  border: 1rpx solid $color-primary-bg-light; // border-blue-100
  
  @include dark-mode {
    background-color: rgba(37, 99, 235, 0.3); // dark:bg-blue-900/30
    border-color: rgba(37, 99, 235, 0.1); // dark:border-blue-900/10
  }
}

.wallet-icon {
  font-size: 48rpx;
}

.exchange-section {
  width: 100%;
  @include flex(column, flex-start, flex-start, $spacing-1); // space-y-1
  position: relative;
  box-sizing: border-box;
}

.input-box {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.6); // bg-white/60
  padding: 40rpx 48rpx; // py-5 px-6 = 20rpx 24rpx
  border-radius: 36rpx; // rounded-[1.8rem] = 1.8 * 20rpx = 36rpx
  border: 1rpx solid $color-border-light; // border-slate-100
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08), -4rpx 0 12rpx rgba(0, 0, 0, 0.05); // 底部和左侧投影
  box-sizing: border-box;
  
  @include dark-mode {
    background-color: rgba(30, 41, 59, 0.6); // dark:bg-slate-800/60
    border-color: $color-dark-border; // dark:border-slate-800
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3), -4rpx 0 12rpx rgba(0, 0, 0, 0.2); // 深色模式下的阴影
  }
}

.input-label {
  @include text-style($font-size-sm, $font-weight-black, $color-text-tertiary); // 增大字体：从 text-[9px] 改为 text-sm (14px)
  text-transform: uppercase;
  letter-spacing: $letter-spacing-widest; // tracking-[0.2em]
  display: block;
  margin-bottom: $spacing-3; // mb-3 = 12rpx
}

.input-row {
  @include flex(row, space-between, center, $spacing-3);
}

.amount-input {
  flex: 1;
  background: transparent;
  @include text-style($font-size-4xl, $font-weight-black, $color-text-primary); // text-2xl
  outline: none;
  min-width: 0;
  border: none;
  
  // 占位符颜色（uni-app 需要使用 placeholder-style 属性，这里作为备用）
  &::-webkit-input-placeholder {
    color: $color-text-disabled;
    opacity: 0.6;
  }
  
  &::placeholder {
    color: $color-text-disabled;
    opacity: 0.6;
  }
  
  @include dark-mode {
    &::-webkit-input-placeholder {
      color: $color-dark-text-disabled;
      opacity: 0.5;
    }
    
    &::placeholder {
      color: $color-dark-text-disabled;
      opacity: 0.5;
    }
  }
}

.amount-output {
  flex: 1;
  @include text-style($font-size-4xl, $font-weight-black, $color-primary);
  min-width: 0;
}

.currency-tag {
  background-color: $color-bg-tertiary; // bg-slate-100
  padding: 8rpx 14rpx; // py-1.5 px-3 = 6rpx 12rpx
  border-radius: $radius-lg; // rounded-xl = 20rpx
  border: 1rpx solid $color-border-light; // border-slate-200
  
  @include dark-mode {
    background-color: $color-dark-bg-tertiary; // dark:bg-slate-700
    border-color: $color-dark-border-dark; // dark:border-slate-600
  }
}

.currency-tag-text {
  @include text-style($font-size-md, $font-weight-black, $color-text-secondary); // 增大字体：从 text-[10px] 改为 text-sm (14px)
  text-transform: uppercase;
}

.currency-selector {
  @include flex(row, flex-start, center, $spacing-2); // gap-2 = 8rpx
  background-color: $color-bg-tertiary; // bg-slate-50
  padding: $spacing-2 $spacing-3; // py-2 px-3 = 8rpx 12rpx
  border-radius: $radius-xl; // rounded-2xl = 24rpx
  border: 1rpx solid $color-border-light; // border-slate-100
  box-shadow: $shadow-sm;
  flex-shrink: 0;
  
  @include dark-mode {
    background-color: $color-dark-bg-tertiary; // dark:bg-slate-700
    border-color: $color-dark-border-dark; // dark:border-slate-600
  }
}

.currency-icon-wrapper {
  width: 40rpx; // w-5 = 20px = 40rpx
  height: 40rpx; // h-5 = 20px = 40rpx
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.currency-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.currency-icon-text {
  font-size: 40rpx;
}

.currency-code {
  @include text-style($font-size-md, $font-weight-black, $color-text-primary); // 增大字体：从 text-[10px] 改为 text-sm (14px)
  text-transform: uppercase;
  
  @include dark-mode {
    color: $color-bg-primary; // dark:text-white
  }
}

.chevron-icon {
  @include text-style($font-size-xs, $font-weight-normal, #cbd5e1); // text-[10px] text-slate-300
  margin-left: 4rpx; // ml-1 = 4rpx
  transform: rotate(90deg);
  display: inline-block;
}

.swap-icon-wrapper {
  @include flex(row, center, center);
  width: 100%;
  text-align: center;

  margin-top: -20rpx; // -my-3.5 = -14rpx
  position: relative;
  z-index: $z-index-base;
}


.swap-icon-box {
  
  padding: $spacing-2; // p-2 = 8rpx
  border-radius: $radius-full; // rounded-full
  border: none; // 移除边框，因为外层有红色框
  color: $color-primary;
  width: 400rpx; // 固定宽度
  height: 64rpx; // 固定高度
  
  align-items: center;
  justify-content: center;
  
  @include dark-mode {
    background-color: rgba(148, 163, 184, 0.3); // dark mode 下的浅灰色
  }
}

.swap-icon {
  font-size: 28rpx;
  transform: rotate(90deg);
  display: block;
}

.accounts-section {
  width: 100%;
  @include flex(column, flex-start, flex-start, $spacing-3);
  padding-top: $spacing-2;
  box-sizing: border-box;
}

.section-title {
  @include text-style($font-size-base, $font-weight-black, $color-text-tertiary); // 增大字体：从 text-sm 改为 text-base (16px)
  text-transform: uppercase;
  letter-spacing: $letter-spacing-ultra;
  padding: 0 $spacing-2;
}

.accounts-list {
  width: 100%;
  @include flex(column, flex-start, flex-start, $spacing-3);
  box-sizing: border-box;
}

.account-item {
  width: 100%;
  padding: 32rpx 40rpx; // px-5 py-4 = 20rpx 16rpx
  border-radius: 40rpx; // rounded-[2rem] = 2 * 20rpx = 40rpx
  border: 1rpx solid $color-border-light; // border-slate-100
  @include flex(row, space-between, center);
  height: 164rpx; // h-[82px] = 82px = 164rpx
  box-shadow: $shadow-sm;
  @include transition(all, $transition-slow);
  cursor: pointer;
  box-sizing: border-box;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary; // dark:bg-slate-800
    border-color: $color-dark-border-light; // dark:border-slate-700
  }
  
  &.selected {
    background-color: rgba(219, 234, 254, 0.5); // bg-blue-50/50
    border-color: $color-primary; // border-blue-500
    
    @include dark-mode {
      background-color: rgba(37, 99, 235, 0.1); // dark:bg-blue-900/10
    }
  }
}

.exchange-container.dark .account-item.selected {
  background-color: rgba(37, 99, 235, 0.1);
}

.account-left {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.account-icon-box {
  width: 88rpx; // w-11 = 44px = 88rpx
  height: 88rpx; // h-11 = 44px = 88rpx
  border-radius: 24rpx; // rounded-2xl = 24rpx
  background-color: #f1f5f9; // bg-slate-50
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-inner;
  transition: all 0.3s;
  
  @include dark-mode {
    background-color: #0f172a; // dark:bg-slate-900
  }
  
  &.selected {
    background-color: #2563eb; // bg-blue-600
    color: #ffffff;
    box-shadow: 0 16rpx 48rpx rgba(37, 99, 235, 0.3); // shadow-lg shadow-blue-500/30
  }
}

.account-icon {
  font-size: 44rpx;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.account-provider {
  @include text-style($font-size-lg, $font-weight-medium, $color-text-primary); // 增大字体：从 text-[14px] 改为 text-base (16px)
  line-height: 1.2; // leading-tight
  
  .account-item.selected & {
    color: #1d4ed8; // text-blue-700
    
    @include dark-mode {
      color: #93c5fd; // dark:text-blue-400
    }
  }
}

.account-number {
  @include text-style($font-size-md, $font-weight-medium, $color-text-disabled); // text-[10px]
  font-family: monospace;
  letter-spacing: 1rpx; // tracking-tight
  
  .account-item.selected & {
    color: rgba(37, 99, 235, 0.6); // text-blue-600/60
  }
}

.check-mark {
  width: 40rpx; // w-5 = 20px = 40rpx
  height: 40rpx; // h-5 = 20px = 40rpx
  background-color: #2563eb; // bg-blue-600
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  @include text-style($font-size-xs, $font-weight-black, #fff); // text-[8px]
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.3); // shadow-lg shadow-blue-500/30
}

.empty-accounts {
  width: 100%;
  background-color: #fef9c3; // 淡黄色背景 (yellow-100)
  
  border-radius: 40rpx; // rounded-[2rem] = 2 * 20rpx = 40rpx
  border: 2rpx dashed #fbbf24; // 黄色虚线边框 (yellow-400)
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32rpx; // 图标和文字之间的间距
  transition: all 0.3s;
  box-sizing: border-box;
  cursor: pointer;
  min-height: 100rpx; // 控制高度，确保有足够的空间
  
  // hover 效果
  &:active {
    transform: scale(0.98); // active-scale
    border-color: #f59e0b; // hover 时稍微深一点的黄色
  }
  
  @include dark-mode {
    background-color: rgba(251, 191, 36, 0.1); // dark mode 下的淡黄色背景
    border-color: #f59e0b; // dark mode 下的黄色边框
  }
}

.empty-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 216rpx; // 108rpx * 2，为图标提供足够的空间
  height: 216rpx;
}

.empty-text {
  @include text-style($font-size-base, $font-weight-normal, #92400e); // 使用 base 字体大小，黄色文字 (yellow-800)
  text-align: center;
  line-height: 1.5;
  
  @include dark-mode {
    color: #fbbf24; // dark mode 下的黄色文字
  }
}

.footer-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32rpx; // space-y-4 = 16px = 32rpx
  
  padding-bottom: 16rpx; // pb-2 = 8px = 16rpx
  
  text-align: center;
  box-sizing: border-box;
}

.submit-btn {
  width: 100%;
  font-weight: 900;
  height: 108rpx; // h-[54px] = 54px = 108rpx
  border-radius: 36rpx; // rounded-[1.8rem] = 1.8 * 20rpx = 36rpx
  box-shadow: 0 40rpx 120rpx rgba(37, 99, 235, 0.3); // shadow-2xl shadow-blue-500/30
  @include text-style($font-size-lg, $font-weight-black, #fff); // 增大字号：从 text-[13px] 改为 text-base (16px)
  text-transform: uppercase;
  letter-spacing: 0.15em; // tracking-[0.15em]
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center; // 垂直居中
  justify-content: center;
}

.submit-btn:not(.disabled) {
  background-color: #2563eb; // bg-blue-600
  color: #fff;
  
  &:active {
    transform: scale(0.98); // active-scale
    background-color: #3b82f6; // hover:bg-blue-500
  }
}

.submit-btn.disabled {
  background-color: #f1f5f9; // bg-slate-100
  color: #94a3b8; // text-slate-400
  box-shadow: none;
  cursor: not-allowed;
  
  @include dark-mode {
    background-color: #1e293b; // dark:bg-slate-800
    color: #64748b; // dark:text-slate-500
  }
}

.tip-text {
  @include text-style($font-size-xs, $font-weight-black, $color-text-tertiary); // text-[8px] text-slate-400
  line-height: 1.6; // leading-relaxed
  padding: 0 96rpx; // px-12 = 48px = 96rpx
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 1rpx; // tracking-tighter
}

.picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10rpx);
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
  padding: 56rpx;
  padding-bottom: 112rpx;
  max-height: 80vh;
  animation: slideUp 0.3s;
}

.exchange-container.dark .picker-content {
  background-color: #0f172a;
}

.picker-title {
  font-size: 36rpx;
  font-weight: 900;
  color: #1e293b;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1rpx;
  margin-bottom: 64rpx;
  width: 100%;
  display: block;
  box-sizing: border-box;
}

.exchange-container.dark .picker-title {
  color: #fff;
}

.picker-list {
  max-height: 60vh;
}

.picker-item {
  padding: 40rpx;
  border-radius: 36rpx;
  border: 2rpx solid transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  transition: all 0.3s;
}

.picker-item.selected {
  background-color: #dbeafe;
  border-color: #2563eb;
}

.exchange-container.dark .picker-item.selected {
  background-color: rgba(37, 99, 235, 0.1);
}

.picker-item-left {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.picker-icon-wrapper {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.picker-icon {
  font-size: 72rpx;
}

.picker-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.picker-item-info {
  display: flex;
  flex-direction: column;
}

.picker-code {
  font-size: 30rpx;
  font-weight: 900;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.exchange-container.dark .picker-code {
  color: #fff;
}

.picker-type {
  font-size: 18rpx;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.picker-check {
  width: 40rpx;
  height: 40rpx;
  background-color: #2563eb;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.3);
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
</style>



