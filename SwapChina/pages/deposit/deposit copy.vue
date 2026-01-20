<template>
  <view class="deposit-container" :class="{'dark': theme === 'dark'}">
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header />
    
    <!-- 充值页面导航栏 -->
    <PageNav title="充值" />
    
    <scroll-view scroll-y class="scroll-content" :style="{ height: `calc(100vh - ${headerTotalHeight}rpx - 120rpx - var(--bottom-nav-height))` }">
      <view class="content-wrapper">
        <!-- USD 通知卡片 -->
        <view class="notice-card">
          <view class="notice-icon-box">
            <Icon name="Bell" :size="40" :style="{ color: '#fff' }" />
          </view>
          <text class="notice-text">{{ t.deposit.usdNotice }}</text>
        </view>

        <!-- Tab 切换 -->
        <view class="tab-container">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            class="tab-btn"
            :class="{ 'active': activeTab === tab.value }"
            @tap="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </view>

        <!-- 充值金额输入 -->
        <view class="amount-card">
          <text class="amount-label">{{ t.deposit.amount }}</text>
          <view class="amount-input-row">
            <input 
              v-model="amount" 
              type="number" 
              class="amount-input" 
              :placeholder="'0.00'"
            />
            <view class="currency-selector-wrapper">
              <view class="currency-selector-btn" @tap="showCurrencyDrawer = true">
                <view class="select-icon-wrapper">
                  <image 
                    v-if="getCurrencySvgPath(selectedCurrency)" 
                    :src="getCurrencySvgPath(selectedCurrency)" 
                    class="select-icon-image" 
                    mode="aspectFit" 
                  />
                  <text v-else class="select-icon-text">{{ getCurrencyIcon(selectedCurrency) }}</text>
                </view>
                <text class="select-text">{{ selectedCurrency }}</text>
                <text class="select-arrow">▼</text>
              </view>
            </view>
          </view>
          <view class="amount-divider"></view>
          <view class="rate-info-row">
            <view class="rate-label-wrapper">
              <text class="rate-label">当前汇率模拟</text>
              <text class="rate-value">{{ currentRateText }}</text>
            </view>
            <view class="usd-amount-wrapper">
              <text class="usd-label">预计到账 (USD)</text>
              <text class="usd-value">≈ ${{ usdAmount }}</text>
            </view>
          </view>
        </view>

        <!-- 加密货币充值内容 -->
        <view v-if="activeTab === 'CRYPTO'" class="crypto-content">
          <!-- 网络选择 -->
          <view class="network-card">
            <text class="amount-label">选择网络</text>
            <view class="network-grid">
              <view 
                v-for="net in availableNetworks" 
                :key="net"
                class="network-btn"
                :class="{ 'active': network === net }"
                @tap="network = net"
              >
                <text class="network-btn-text">{{ net }}</text>
              </view>
            </view>
          </view>

          <!-- 二维码和地址 -->
          <view class="address-card">
            <view v-if="isLoadingAddress" class="loading-wrapper">
              <text class="loading-text">加载中...</text>
            </view>
            <template v-else>
              <view v-if="qrCodeUrl" class="qr-wrapper">
                <image :src="qrCodeUrl" class="qr-image" mode="aspectFit" />
              </view>
              <text class="address-label">充值地址 ({{ network }})</text>
              <view class="address-row">
                <text class="address-text">{{ depositAddress || '加载中...' }}</text>
                <button class="copy-btn" @tap="handleCopy" :disabled="!depositAddress">
                  <Icon name="Copy" :size="40" :style="{ color: '#64748b' }" />
                </button>
              </view>
            </template>
          </view>
        </view>

        <!-- 法币充值内容 -->
        <view v-if="activeTab === 'FIAT'" class="fiat-content">
          <!-- 平台收款信息卡片 -->
          <view class="receipt-card">
            <view class="receipt-header">
              <text class="amount-label">平台收款信息</text>
              <view class="switch-card-btn" @tap="showCardDrawer = true">
                <text class="switch-card-text">切换卡号</text>
              </view>
            </view>
            
            <view class="bank-info-card">
              <view class="bank-icon-box">
                <Icon name="BankIcon" :size="48" :style="{ color: '#fff' }" />
              </view>
              <view class="bank-info">
                <text class="bank-name">{{ currentReceiptCard.bankName }}</text>
                <text class="bank-label">官方结算通道</text>
              </view>
            </view>
            
            <view class="info-row">
              <view class="info-label-wrapper">
                <text class="info-label">持卡人姓名</text>
                <text class="info-value">{{ currentReceiptCard.firstName }} {{ currentReceiptCard.lastName }}</text>
              </view>
              <button class="copy-info-btn" @tap="handleCopyCardholder">
                <Icon name="Copy" :size="28" :style="{ color: '#64748b' }" />
                <text class="copy-info-btn-text">复制</text>
              </button>
            </view>
            
            <view class="info-row">
              <view class="info-label-wrapper">
                <text class="info-label">收款账号</text>
                <text class="info-value">{{ currentReceiptCard.accountNumber }}</text>
              </view>
              <button class="copy-info-btn" @tap="handleCopyAccount">
                <Icon name="Copy" :size="30" :style="{ color: '#64748b' }" />
                <text class="copy-info-btn-text">复制</text>
              </button>
            </view>
            
            <view class="receipt-tip">
              <text class="tip-text">温馨：请务必按上方信息转账，转账时请勿填敏感备注。</text>
            </view>
          </view>
        </view>
        
        <!-- 第三方充值内容 -->
        <view v-if="activeTab === 'THIRD'" class="fiat-content">
          <!-- 支付通道选择 -->
          <view class="payment-channel-card">
            <text class="amount-label">选择支付通道</text>
            <view class="channel-list">
              <!-- 支付宝 -->
              <view 
                class="channel-item"
                :class="{ 'active': selectedPaymentChannel === 'alipay' }"
                @tap="selectedPaymentChannel = 'alipay'"
              >
                <view class="channel-icon-box">
                  <text class="channel-icon-text">💳</text>
                </view>
                <text class="channel-name">支付宝 (ALIPAY)</text>
                <view v-if="selectedPaymentChannel === 'alipay'" class="channel-check">
                  <Icon name="CheckCircle" :size="32" :style="{ color: '#2563eb' }" />
                </view>
              </view>
              
              <!-- 微信支付 -->
              <view 
                class="channel-item"
                :class="{ 'active': selectedPaymentChannel === 'wechat' }"
                @tap="selectedPaymentChannel = 'wechat'"
              >
                <view class="channel-icon-box">
                  <text class="channel-icon-text">💬</text>
                </view>
                <text class="channel-name">微信支付 (WECHAT)</text>
                <view v-if="selectedPaymentChannel === 'wechat'" class="channel-check">
                  <Icon name="CheckCircle" :size="32" :style="{ color: '#2563eb' }" />
                </view>
              </view>
              
              <!-- WISE汇款 -->
              <view 
                class="channel-item"
                :class="{ 'active': selectedPaymentChannel === 'wise' }"
                @tap="selectedPaymentChannel = 'wise'"
              >
                <view class="channel-icon-box">
                  <text class="channel-icon-text">🦉</text>
                </view>
                <text class="channel-name">WISE 汇款</text>
                <view v-if="selectedPaymentChannel === 'wise'" class="channel-check">
                  <Icon name="CheckCircle" :size="32" :style="{ color: '#2563eb' }" />
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 支付凭证上传（所有充值方式共用） -->
        <view class="proof-upload-card">
          <text class="amount-label">支付凭证</text>
          <view class="upload-area" @tap="handleUploadProof">
            <view v-if="!proofImage" class="upload-placeholder">
              <Icon name="Camera" :size="80" :style="{ color: 'rgba(148, 163, 184, 0.6)' }" />
              <text class="upload-text">点击拍照或上传截图</text>
            </view>
            <view v-else class="upload-preview">
              <image :src="proofImage" class="proof-preview-image" mode="aspectFill" />
              <view class="proof-remove-btn" @tap.stop="removeProof">
                <Icon name="Close" :size="32" :style="{ color: '#fff' }" />
              </view>
            </view>
          </view>
        </view>

        <!-- 确认充值按钮 -->
        <view class="confirm-btn" @tap="handleConfirm">
          <text class="confirm-btn-text">确认充值</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- APP端币种选择抽屉 -->
    <!-- #ifdef APP-PLUS -->
    <view v-if="showCurrencyDrawer" class="currency-drawer-overlay" @tap="showCurrencyDrawer = false">
      <view class="currency-drawer-content" @tap.stop>
        <view class="drawer-header">
          <text class="drawer-title">选择币种</text>
          <button class="drawer-close" @tap="showCurrencyDrawer = false">
            <Icon name="Close" :size="40" />
          </button>
        </view>
        <scroll-view scroll-y class="drawer-list">
          <view 
            v-for="currency in availableCurrencies" 
            :key="currency.code"
            class="drawer-item"
            :class="{ 'selected': selectedCurrency === currency.code }"
            @tap="selectCurrencyFromDrawer(currency.code)"
          >
            <view class="drawer-item-icon">
              <image 
                v-if="getCurrencySvgPath(currency.code)" 
                :src="getCurrencySvgPath(currency.code)" 
                class="drawer-icon-image" 
                mode="aspectFit" 
              />
              <text v-else class="drawer-icon-text">{{ getCurrencyIcon(currency.code) }}</text>
            </view>
            <text class="drawer-item-text">{{ currency.code }}</text>
            <view v-if="selectedCurrency === currency.code" class="drawer-item-indicator"></view>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 切换卡号抽屉 -->
    <view v-if="showCardDrawer" class="currency-drawer-overlay" @tap="showCardDrawer = false">
      <view class="currency-drawer-content" @tap.stop>
        <view class="drawer-header">
          <text class="drawer-title">切换卡号</text>
          <button class="drawer-close" @tap="showCardDrawer = false">
            <Icon name="Close" :size="40" />
          </button>
        </view>
        <scroll-view scroll-y class="drawer-list">
          <view 
            v-for="(card, index) in PLATFORM_RECEIPT_CARDS" 
            :key="card.id"
            class="card-drawer-item"
            :class="{ 'selected': selectedCardIndex === index }"
            @tap="selectReceiptCard(index)"
          >
            <view class="card-item-header">
              <view class="card-item-icon-box">
                <Icon name="BankIcon" :size="40" :style="{ color: '#fff' }" />
              </view>
              <view class="card-item-info">
                <text class="card-item-bank-name">{{ card.bankName }}</text>
                <text class="card-item-label">官方结算通道</text>
              </view>
              <view v-if="selectedCardIndex === index" class="card-item-check">
                <Icon name="CheckCircle" :size="48" :style="{ color: '#2563eb' }" />
              </view>
            </view>
            <view class="card-item-divider"></view>
            <view class="card-item-details">
              <view class="card-item-detail-row">
                <text class="card-item-detail-label">持卡人</text>
                <text class="card-item-detail-value">{{ card.firstName }} {{ card.lastName }}</text>
              </view>
              <view class="card-item-detail-row">
                <text class="card-item-detail-label">账号</text>
                <text class="card-item-detail-value">{{ card.accountNumber }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <view class="bottom-nav-wrapper">
      <BottomNav />
    </view>
    
    <!-- Toast 提示 -->
    <Toast :message="toastMessage" :type="toastType" />
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { TRANSLATIONS, CURRENCIES, CRYPTO_CONFIG, FIAT_CURRENCIES, CRYPTO_CURRENCIES, PLATFORM_RECEIPT_CARDS } from '@/utils/constants.js'
import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'
import PageNav from '@/components/PageNav.vue'
import Icon from '@/components/Icon.vue'
import FormSelect from '@/components/FormSelect.vue'
import Toast from '@/components/Toast.vue'
import store from '@/store/index.js'
import { getDepositAddress } from '@/api/index.js'

const theme = ref(uni.getStorageSync('theme') || 'light')
const { headerTotalHeight } = useHeaderHeight()
const lang = ref(uni.getStorageSync('lang') || 'zh')
const t = computed(() => TRANSLATIONS[lang.value] || TRANSLATIONS.zh)

const activeTab = ref('FIAT')
const amount = ref('2000')
const selectedCurrency = ref('CNY')
const cryptoCurrency = ref('USDT')
const network = ref('TRC20')
const showCurrencyDrawer = ref(false) // 币种选择抽屉
const showCardDrawer = ref(false) // 切换卡号抽屉
const selectedCardIndex = ref(0) // 当前选中的收款卡索引
const proofImage = ref('') // 支付凭证图片
const depositAddress = ref('') // 当前充值地址
const qrCodeUrl = ref('') // 二维码URL
const isLoadingAddress = ref(false) // 是否正在加载地址
const selectedPaymentChannel = ref('alipay') // 选中的支付通道

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

const tabs = computed(() => [
  { value: 'FIAT', label: t.value.deposit.fiat },
  { value: 'CRYPTO', label: t.value.deposit.crypto },
  { value: 'THIRD', label: t.value.deposit.thirdParty }
])

// 可用币种列表
const availableCurrencies = computed(() => {
  if (activeTab.value === 'CRYPTO') {
    return CRYPTO_CURRENCIES
  } else {
    return FIAT_CURRENCIES
  }
})

// 获取币种图标
const getCurrencyIcon = (code) => {
  const currency = CURRENCIES.find(c => c.code === code)
  return currency?.symbol || '💵'
}

// 获取币种SVG路径
const getCurrencySvgPath = (code) => {
  const currency = CURRENCIES.find(c => c.code === code)
  return currency?.svgPath || null
}

// 获取当前加密货币配置（根据选中的币种）
const currentCryptoConfig = computed(() => {
  if (activeTab.value === 'CRYPTO') {
    return CRYPTO_CONFIG.find(c => c.code === selectedCurrency.value) || CRYPTO_CONFIG[0]
  }
  return null
})

// 当前汇率文本
const currentRateText = computed(() => {
  if (activeTab.value === 'CRYPTO') {
    const rate = currentCryptoConfig.value?.rate || 1.0
    return `1 ${selectedCurrency.value} ≈ ${rate.toFixed(4)} USD`
  } else {
    const rates = {
      'CNY': 7.24,
      'EUR': 0.92,
      'NGN': 1540.0,
      'USD': 1.0
    }
    const rate = rates[selectedCurrency.value] || 1.0
    return `1 ${selectedCurrency.value} ≈ ${(1 / rate).toFixed(4)} USD`
  }
})

// 可用网络
const availableNetworks = computed(() => {
  return currentCryptoConfig.value?.networks || ['TRC20', 'ERC20', 'BEP20', 'POLYGON']
})

// 加载充值地址
const loadDepositAddress = async () => {
  if (activeTab.value !== 'CRYPTO' || !selectedCurrency.value || !network.value) {
    return
  }
  
  isLoadingAddress.value = true
  try {
    const result = await getDepositAddress(selectedCurrency.value, network.value)
    depositAddress.value = result.address || ''
    qrCodeUrl.value = result.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${result.address}`
  } catch (error) {
    console.error('加载充值地址失败:', error)
    showToast('获取充值地址失败', 'error')
  } finally {
    isLoadingAddress.value = false
  }
}

// USD等值计算
const usdAmount = computed(() => {
  if (!amount.value || isNaN(parseFloat(amount.value))) return '0.00'
  const val = parseFloat(amount.value)
  
  if (activeTab.value === 'CRYPTO') {
    // 加密货币：金额 * 汇率 = USD
    const rate = currentCryptoConfig.value?.rate || 1.0
    return (val * rate).toFixed(2)
  } else {
    // 法币：金额 / 汇率 = USD
    const rates = {
      'CNY': 7.24,
      'EUR': 0.92,
      'NGN': 1540.0,
      'USD': 1.0
    }
    const rate = rates[selectedCurrency.value] || 1.0
    return (val / rate).toFixed(2)
  }
})

// 监听Tab切换，重置相关状态
watch(activeTab, (newTab) => {
  if (newTab === 'FIAT') {
    selectedCurrency.value = 'CNY'
  } else if (newTab === 'CRYPTO') {
    selectedCurrency.value = 'USDT'
    cryptoCurrency.value = 'USDT'
    network.value = 'TRC20'
    // 切换Tab时加载地址
    loadDepositAddress()
  }
})

// 监听币种变化
watch(selectedCurrency, (newCurrency) => {
  if (activeTab.value === 'CRYPTO') {
    cryptoCurrency.value = newCurrency
    // 币种变化时重新加载地址
    loadDepositAddress()
  }
})

// 监听网络变化，重新加载地址
watch(network, () => {
  if (activeTab.value === 'CRYPTO') {
    loadDepositAddress()
  }
})

// 复制地址
const handleCopy = () => {
  if (!depositAddress.value) {
    showToast('地址未加载完成', 'warning')
    return
  }
  // 使用系统自带的复制Toast
  uni.setClipboardData({
    data: depositAddress.value
  })
}

// 当前选中的收款卡
const currentReceiptCard = computed(() => {
  return PLATFORM_RECEIPT_CARDS[selectedCardIndex.value] || PLATFORM_RECEIPT_CARDS[0]
})

// 从抽屉选择币种
const selectCurrencyFromDrawer = (code) => {
  selectedCurrency.value = code
  showCurrencyDrawer.value = false
  // 如果是加密货币，同步更新 cryptoCurrency
  if (activeTab.value === 'CRYPTO') {
    cryptoCurrency.value = code
  }
  // computed 属性会自动响应 selectedCurrency 的变化，汇率会重新计算
}

// 从抽屉选择收款卡
const selectReceiptCard = (index) => {
  selectedCardIndex.value = index
  showCardDrawer.value = false
}

// 复制持卡人姓名
const handleCopyCardholder = () => {
  const text = `${currentReceiptCard.value.firstName} ${currentReceiptCard.value.lastName}`
  // 使用系统自带的复制Toast
  uni.setClipboardData({
    data: text
  })
}

// 复制收款账号
const handleCopyAccount = () => {
  const text = currentReceiptCard.value.accountNumber
  // 使用系统自带的复制Toast
  uni.setClipboardData({
    data: text
  })
}

// 上传支付凭证
const handleUploadProof = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ['camera', 'album'],
    success: (res) => {
      proofImage.value = res.tempFilePaths[0]
      showToast('图片已选择', 'success')
    },
    fail: (err) => {
      console.error('选择图片失败:', err)
      showToast('选择图片失败', 'error')
    }
  })
}

// 移除支付凭证
const removeProof = () => {
  proofImage.value = ''
}

// 确认充值
const handleConfirm = () => {
  if (!amount.value || parseFloat(amount.value) <= 0) {
    showToast('请输入充值金额', 'warning')
    return
  }
  
  // 所有充值方式都需要支付凭证
  if (!proofImage.value) {
    showToast('请上传支付凭证', 'warning')
    return
  }
  
  // TODO: 调用充值API
  showToast('充值功能开发中', 'info')
  // uni.navigateTo({
  //   url: '/pages/deposit-history/deposit-history'
  // })
}

onMounted(() => {
  theme.value = store.theme || 'light'
  
  // 初始化时设置默认币种并加载地址
  if (activeTab.value === 'CRYPTO') {
    selectedCurrency.value = 'USDT'
    cryptoCurrency.value = 'USDT'
    network.value = 'TRC20'
    // 初始化时加载地址
    loadDepositAddress()
  } else {
    selectedCurrency.value = 'CNY'
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.deposit-container {
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
  @include flex(column, flex-start, stretch, 32rpx);
}

// USD 通知卡片
.notice-card {
  background-color: $color-primary;
  padding: 32rpx;
  border-radius: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.2);
  @include flex(row, flex-start, center, 24rpx);
}

.notice-icon-box {
  width: 64rpx;
  height: 64rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  @include flex(row, center, center);
  flex-shrink: 0;
}

.notice-text {
  @include text-style(20rpx, $font-weight-black, #fff);
  line-height: 1.6;
  flex: 1;
}

// Tab 切换
.tab-container {
  background-color: $color-bg-tertiary;
  padding: 12rpx;
  border-radius: 48rpx;
  box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  @include flex(row, space-between, center, 16rpx);
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
  }
}

.tab-btn {
  flex: 1;
  padding: 24rpx 0;
  border-radius: 32rpx;
  @include text-style(24rpx, $font-weight-black, $color-text-tertiary);
  background-color: transparent;
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  transition: all 0.2s;
  
  &::after {
    border: none;
  }
  
  &.active {
    background-color: #fff;
    color: $color-primary;
    box-shadow: $shadow-sm;
    
    @include dark-mode {
      background-color: $color-dark-bg-primary;
    }
  }
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
    
    &.active {
      color: $color-primary;
    }
  }
}

// 充值金额卡片
.amount-card {

  padding: 40rpx;
  border-radius: 48rpx;
  border: 1rpx solid $color-border-light;
  box-shadow: 0 8rpx 24rpx rgba(16, 30, 54, 0.10); // 底部投影

  @include dark-mode {
    background-color: rgba(30, 41, 59, 0.4);
    border-color: $color-dark-border-light;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.25); // 暗色模式下的底部投影
  }
}

.amount-label {
  @include text-style(20rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  display: block;
  margin-bottom: 16rpx;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.amount-input-row {
  @include flex(row, space-between, center, 24rpx);
  margin-bottom: 24rpx;
}

.amount-input {
  flex: 1;
  @include text-style(60rpx, $font-weight-black, $color-text-primary);
  background-color: transparent;
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  
  @include dark-mode {
    color: #fff;
  }
  
  &::placeholder {
    color: $color-text-tertiary;
    
    @include dark-mode {
      color: $color-dark-text-tertiary;
    }
  }
}

.currency-selector-wrapper {
  flex-shrink: 0;
  width: 220rpx;
}

.currency-selector {
  :deep(.form-item) {
    margin-bottom: 0;
  }
  
  :deep(.form-label) {
    display: none;
  }
  
  :deep(.custom-select-wrapper) {
    position: relative;
  }
  
  :deep(.custom-select-input) {
    background-color: transparent;
    border: none;
    padding: 0;
    min-height: auto;
    height: auto;
  }
  
  :deep(.select-content) {
    @include flex(row, center, center, 12rpx);
    padding: 0;
  }
  
  :deep(.custom-select-wrapper) {
    width: 100%;
  }
  
  :deep(.select-icon-wrapper) {
    width: 48rpx;
    height: 48rpx;
    border-radius: 0;
    background-color: transparent;
    @include flex(row, center, center);
    flex-shrink: 0;
  }
  
  :deep(.select-icon-image) {
    width: 48rpx;
    height: 48rpx;
  }
  
  :deep(.select-icon-text) {
    @include text-style(24rpx, $font-weight-black, $color-text-primary);
  }
  
  :deep(.select-text) {
    @include text-style(24rpx, $font-weight-black, $color-text-primary);
    padding: 0;
    
    @include dark-mode {
      color: #fff;
    }
    
    &.placeholder {
      color: $color-text-tertiary;
      
      @include dark-mode {
        color: $color-dark-text-tertiary;
      }
    }
  }
  
  :deep(.select-arrow) {
    @include text-style(20rpx, $font-weight-normal, $color-text-tertiary);
    margin-left: 8rpx;
    flex-shrink: 0;
    
    @include dark-mode {
      color: $color-dark-text-tertiary;
    }
  }
  
  // 下拉菜单样式调整 - 匹配选择器宽度
  :deep(.custom-select-dropdown) {
    width: 220rpx;
    min-width: 220rpx;
    max-width: 220rpx;
  }
  
  // 下拉选项中的图标样式 - 稍微小一点
  :deep(.option-icon-wrapper) {
    width: 44rpx;
    height: 44rpx;
    border-radius: 0;
    background-color: transparent;
    @include flex(row, center, center);
    flex-shrink: 0;
  }
  
  :deep(.option-icon-image) {
    width: 44rpx;
    height: 44rpx;
  }
  
  :deep(.option-icon-text) {
    @include text-style(24rpx, $font-weight-black, $color-text-primary);
  }
  
  // 下拉选项中的文字 - 稍微小一点
  :deep(.option-text) {
    @include text-style(24rpx, $font-weight-normal, $color-text-primary);
    
    @include dark-mode {
      color: #fff;
    }
  }
}

.amount-divider {
  width: 100%;
  height: 1rpx;
  background-color: $color-border-light;
  margin-bottom: 24rpx;
  
  @include dark-mode {
    background-color: rgba(148, 163, 184, 0.3);
  }
}

.rate-info-row {
  @include flex(row, space-between, flex-start);
  gap: 32rpx;
}

.rate-label-wrapper {
  flex: 1;
  @include flex(column, flex-start, flex-start, 8rpx);
}

.rate-label {
  @include text-style(20rpx, $font-weight-black, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.rate-value {
  @include text-style(24rpx, $font-weight-normal, $color-text-secondary);
  
  @include dark-mode {
    color: $color-dark-text-secondary;
  }
}

.usd-amount-wrapper {
  flex: 1;
  @include flex(column, flex-end, flex-end, 8rpx);
  align-items: flex-end;
}

.usd-label {
  @include text-style(20rpx, $font-weight-black, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.usd-value {
  @include text-style(28rpx, $font-weight-black, $color-primary);
}

// 加密货币内容
.crypto-content {
  @include flex(column, flex-start, stretch, 32rpx);
}

.network-card {
  background-color: #fff;
  padding: 40rpx;
  border-radius: 48rpx;
  border: 1rpx solid $color-border-light;
  box-shadow: 0 8rpx 24rpx rgba(16, 30, 54, 0.10);
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.25);
  }
}

.network-label {
  @include text-style(28rpx, $font-weight-black, $color-text-primary);
  display: block;
  margin-bottom: 32rpx;
  
  @include dark-mode {
    color: #fff;
  }
}

.network-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.network-btn {
  padding: 24rpx 16rpx;
  border-radius: 24rpx;
  background-color: #fff;
  border: 1rpx solid $color-border-light;
  transition: all 0.2s;
  cursor: pointer;
  user-select: none;
  @include flex(row, center, center);
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    border-color: $color-dark-border-light;
  }
  
  &.active {
    background-color: $color-primary;
    border-color: $color-primary;
    box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.3);
    
    .network-btn-text {
      color: #fff;
    }
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.network-btn-text {
  @include text-style(24rpx, $font-weight-bold, $color-text-tertiary);
  transition: color 0.2s;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
  
  .network-btn.active & {
    color: #fff;
  }
}

// 地址卡片
.address-card {
  background-color: #fff;
  padding: 48rpx;
  border-radius: 48rpx;
  border: 1rpx solid $color-border-light;
  box-shadow: 0 8rpx 24rpx rgba(16, 30, 54, 0.10);
  @include flex(column, center, center, 32rpx);
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.25);
  }
}

.qr-wrapper {
  width: 400rpx;
  height: 400rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-sizing: border-box;
  @include flex(row, center, center);
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
  }
}

.qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.loading-wrapper {
  width: 100%;
  padding: 80rpx 0;
  @include flex(row, center, center);
}

.loading-text {
  @include text-style(28rpx, $font-weight-normal, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.address-label {
  @include text-style(24rpx, $font-weight-bold, $color-text-primary);
  align-self: flex-start;
  
  @include dark-mode {
    color: #fff;
  }
}

.address-row {
  width: 100%;
  background-color: $color-bg-tertiary;
  padding: 24rpx 32rpx;
  border-radius: 24rpx;
  border: 1rpx solid $color-border-light;
  @include flex(row, space-between, center, 16rpx);
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    border-color: $color-dark-border-light;
  }
}

.address-text {
  flex: 1;
  @include text-style(24rpx, $font-weight-normal, $color-text-primary);
  font-family: monospace;
  word-break: break-all;
  line-height: 1.5;
  
  @include dark-mode {
    color: #fff;
  }
}

.copy-btn {
  width: 64rpx;
  height: 64rpx;
  background-color: rgba(241, 245, 249, 0.8);
  border-radius: 16rpx;
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  @include flex(row, center, center);
  flex-shrink: 0;
  transition: all 0.2s;
  padding: 0;
  
  &::after {
    border: none;
  }
  
  &:active {
    transform: scale(0.95);
    background-color: rgba(241, 245, 249, 1);
  }
  
  @include dark-mode {
    background-color: rgba(30, 41, 59, 0.6);
    
    &:active {
      background-color: rgba(30, 41, 59, 0.8);
    }
  }
}

// 法币/第三方内容
.fiat-content {
  @include flex(column, flex-start, stretch, 32rpx);
}

// 支付通道选择卡片
.payment-channel-card {
  background-color: #fff;
  padding: 40rpx;
  border-radius: 48rpx;
  border: 1rpx solid $color-border-light;
  box-shadow: 0 8rpx 24rpx rgba(16, 30, 54, 0.10);
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.25);
  }
}

.channel-list {
  @include flex(column, flex-start, stretch, 16rpx);
  margin-top: 32rpx;
}

.channel-item {
  padding: 32rpx;
  border-radius: 24rpx;
  border: 2rpx solid $color-border-light;
  background-color: $color-bg-tertiary;
  @include flex(row, flex-start, center, 24rpx);
  transition: all 0.2s;
  cursor: pointer;
  user-select: none;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    border-color: $color-dark-border-light;
  }
  
  &.active {
    background-color: rgba(37, 99, 235, 0.05);
    border-color: $color-primary;
    box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.15);
    
    @include dark-mode {
      background-color: rgba(37, 99, 235, 0.1);
    }
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.channel-icon-box {
  width: 80rpx;
  height: 80rpx;
  @include flex(row, center, center);
  flex-shrink: 0;
}

.channel-icon-text {
  font-size: 48rpx;
  line-height: 1;
}

.channel-name {
  flex: 1;
  @include text-style(28rpx, $font-weight-black, $color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  @include dark-mode {
    color: #fff;
  }
  
  .channel-item.active & {
    color: $color-primary;
    
    @include dark-mode {
      color: #60a5fa;
    }
  }
}

.channel-check {
  flex-shrink: 0;
  @include flex(row, center, center);
}

// 平台收款信息卡片
.receipt-card {
  background-color: #fff;
  border-radius: 48rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(16, 30, 54, 0.10);
  border: 1rpx solid $color-border-light;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.25);
  }
}

.receipt-header {
  @include flex(row, space-between, center);
  margin-bottom: 32rpx;
}

.receipt-title {
  @include text-style(32rpx, $font-weight-black, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
}

.switch-card-btn {
  padding: 14rpx 22rpx;
  background-color: $color-primary;
  border-radius: 32rpx;
  @include flex(row, center, center);
  transition: all 0.2s;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.25);
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(37, 99, 235, 0.2);
  }
}

.switch-card-text {
  @include text-style(18rpx, $font-weight-bold, #fff);
  letter-spacing: 0.5rpx;
}

.bank-info-card {
  @include flex(row, flex-start, center, 24rpx);
  margin-bottom: 32rpx;
  padding-bottom: 32rpx;
  border-bottom: 1rpx solid $color-border-light;
  
  @include dark-mode {
    border-bottom-color: $color-dark-border-light;
  }
}

.bank-icon-box {
  width: 80rpx;
  height: 80rpx;
  background-color: $color-primary;
  border-radius: 16rpx;
  @include flex(row, center, center);
  flex-shrink: 0;
}

.bank-icon-text {
  @include text-style(40rpx, $font-weight-black, #fff);
}

.bank-info {
  @include flex(column, flex-start, flex-start, 8rpx);
  flex: 1;
}

.bank-name {
  @include text-style(28rpx, $font-weight-black, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
}

.bank-label {
  @include text-style(20rpx, $font-weight-normal, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.info-row {
  @include flex(row, space-between, center);
  margin-bottom: 24rpx;
}

.info-label-wrapper {
  @include flex(column, flex-start, flex-start, 8rpx);
  flex: 1;
}

.info-label {
  @include text-style(20rpx, $font-weight-normal, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.info-value {
  @include text-style(20rpx, $font-weight-bold, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
}

.copy-info-btn {
  @include flex(row, center, center, 8rpx);
  background-color: transparent;
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  padding: 0;
  flex-shrink: 0;
  min-width: auto;
  min-height: auto;
  
  &::after {
    border: none;
  }
  
  &:active {
    opacity: 0.6;
    transform: scale(0.95);
  }
}

.copy-info-btn-text {
  @include text-style(18rpx, $font-weight-normal, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.receipt-tip {
  margin-top: 32rpx;
  padding: 18rpx;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1rpx solid rgba(239, 68, 68, 0.2);
  border-radius: 24rpx;
}

.tip-text {
  @include text-style(20rpx, $font-weight-normal, $color-error);
  line-height: 1.2;
}

// 支付凭证上传卡片
.proof-upload-card {
  background-color: #fff;
  border-radius: 48rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(16, 30, 54, 0.10);
  border: 1rpx solid $color-border-light;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.25);
  }
}

.proof-title {
  @include text-style(32rpx, $font-weight-black, $color-text-primary);
  display: block;
  margin-bottom: 32rpx;
  
  @include dark-mode {
    color: #fff;
  }
}

.upload-area {
  width: 100%;
  min-height: 320rpx;
  border: 2rpx dashed rgba(148, 163, 184, 0.4); // 更淡的虚线边框
  border-radius: 24rpx;
  @include flex(row, center, center);
  background-color: rgba(241, 245, 249, 0.5); // 更淡的背景色
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  
  @include dark-mode {
    background-color: rgba(30, 41, 59, 0.3);
    border-color: rgba(148, 163, 184, 0.3);
  }
  
  &:active {
    border-color: rgba(148, 163, 184, 0.6);
    background-color: rgba(241, 245, 249, 0.7);
  }
}

.upload-placeholder {
  @include flex(column, center, center, 16rpx);
  padding: 60rpx 0;
}

.upload-text {
  @include text-style(24rpx, $font-weight-normal, rgba(148, 163, 184, 0.7)); // 更淡的文字颜色
  
  @include dark-mode {
    color: rgba(148, 163, 184, 0.6);
  }
}

.upload-preview {
  width: 100%;
  height: 100%;
  position: relative;
  min-height: 320rpx;
}

.proof-preview-image {
  width: 100%;
  height: 100%;
  min-height: 320rpx;
  object-fit: cover;
}

.proof-remove-btn {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 56rpx;
  height: 56rpx;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  @include flex(row, center, center);
  backdrop-filter: blur(4rpx);
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.9);
    background-color: rgba(0, 0, 0, 0.8);
  }
}

.empty-placeholder {
  padding: 80rpx 0;
  @include flex(column, center, center);
}

.empty-text {
  @include text-style(28rpx, $font-weight-normal, $color-text-tertiary);
  font-style: italic;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

// 确认充值按钮
.confirm-btn {
  width: 100%;
  background-color: $color-primary;
  padding: 40rpx 0;
  border-radius: 48rpx;
  box-shadow: 0 8rpx 32rpx rgba(37, 99, 235, 0.3);
  @include flex(row, center, center);
  transition: all 0.2s;
  margin-top: 32rpx;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(37, 99, 235, 0.25);
  }
}

.confirm-btn-text {
  @include text-style(28rpx, $font-weight-black, #fff);
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

// APP端币种选择按钮样式
.currency-selector-btn {
  width: 220rpx;
  @include flex(row, center, center, 12rpx);
  padding: 0;
  background-color: transparent;
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  
  &::after {
    border: none;
  }
}

.currency-selector-btn .select-icon-wrapper {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
}

.currency-selector-btn .select-icon-image {
  width: 100%;
  height: 100%;
}

.currency-selector-btn .select-icon-text {
  @include text-style(24rpx, $font-weight-black, $color-text-primary);
}

.currency-selector-btn .select-text {
  @include text-style(24rpx, $font-weight-black, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
}

.currency-selector-btn .select-arrow {
  @include text-style(20rpx, $font-weight-normal, $color-text-tertiary);
  margin-left: 8rpx;
  flex-shrink: 0;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

// APP端币种选择抽屉
.currency-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  @include flex(row, center, flex-end);
  animation: fadeIn 0.3s ease;
}

.currency-drawer-content {
  width: 100%;
  max-height: 70vh;
  background-color: #fff;
  border-radius: 48rpx 48rpx 0 0;
  padding: 40rpx;
  box-sizing: border-box;
  animation: slideUp 0.3s ease;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
  }
}

.drawer-header {
  @include flex(row, space-between, right);

}

.drawer-title {
  @include text-style(32rpx, $font-weight-black, $color-text-primary);
  width: 100%;
  
  @include dark-mode {
    color: #fff;
  }
}

.drawer-close {
  width: 64rpx;
  height: 64rpx;
  
  @include flex(row, center, center);
 
  background-color: transparent;
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  padding: 0;
  
  &::after {
    border: none;
  }
}

.drawer-list {
  max-height: calc(70vh - 120rpx);
}

.drawer-item {
  @include flex(row, flex-start, center, 16rpx);
  padding: 24rpx 0;
  border-bottom: 1rpx solid $color-border-light;
  transition: background-color 0.2s;
  
  @include dark-mode {
    border-bottom-color: $color-dark-border-light;
  }
  
  &.selected {
    background-color: rgba(37, 99, 235, 0.05);
  }
  
  &:active {
    background-color: $color-bg-tertiary;
    
    @include dark-mode {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
}

.drawer-item-icon {
  width: 44rpx;
  height: 44rpx;
  flex-shrink: 0;
}

.drawer-icon-image {
  width: 100%;
  height: 100%;
}

.drawer-icon-text {
  @include text-style(24rpx, $font-weight-black, $color-text-primary);
}

.drawer-item-text {
  flex: 1;
  @include text-style(28rpx, $font-weight-normal, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
}

.drawer-item-indicator {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: $color-primary;
  flex-shrink: 0;
}

.drawer-item-content {
  flex: 1;
  @include flex(column, flex-start, flex-start, 4rpx);
}

.drawer-item-subtext {
  @include text-style(24rpx, $font-weight-normal, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

// 银行卡抽屉项样式
.card-drawer-item {
  background-color: #fff;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  border: 2rpx solid $color-border-light;
  transition: all 0.2s;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
  
  &.selected {
    border-color: $color-primary;
    background-color: rgba(37, 99, 235, 0.05);
    box-shadow: 0 4rpx 16rpx rgba(37, 99, 235, 0.15);
    
    @include dark-mode {
      background-color: rgba(37, 99, 235, 0.1);
    }
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
}

.card-item-header {
  @include flex(row, flex-start, center, 24rpx);
  margin-bottom: 24rpx;
}

.card-item-icon-box {
  width: 64rpx;
  height: 64rpx;
  background-color: $color-primary;
  border-radius: 12rpx;
  @include flex(row, center, center);
  flex-shrink: 0;
}


.card-item-info {
  flex: 1;
  @include flex(column, flex-start, flex-start, 8rpx);
}

.card-item-bank-name {
  @include text-style(24rpx, $font-weight-black, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
}

.card-item-label {
  @include text-style(22rpx, $font-weight-normal, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.card-item-check {
  flex-shrink: 0;
}

.card-check-indicator {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: $color-primary;
  @include flex(row, center, center);
  
  &::after {
    content: '✓';
    @include text-style(32rpx, $font-weight-black, #fff);
    line-height: 1;
  }
}

.card-item-divider {
  width: 100%;
  height: 1rpx;
  background-color: $color-border-light;
  margin-bottom: 24rpx;
  
  @include dark-mode {
    background-color: $color-dark-border-light;
  }
}

.card-item-details {
  @include flex(column, flex-start, stretch, 16rpx);
}

.card-item-detail-row {
  @include flex(row, space-between, center);
}

.card-item-detail-label {
  @include text-style(24rpx, $font-weight-normal, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.card-item-detail-value {
  @include text-style(24rpx, $font-weight-bold, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
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
