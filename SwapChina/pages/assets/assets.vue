<template>
  <view class="assets-container" :class="{'dark': theme === 'dark'}">
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header />
    
    <scroll-view scroll-y class="scroll-content">
      <view class="content-wrapper">
        <!-- 头部标题和按钮 -->
        <view class="header-section">
          <text class="page-title">{{ t.assets.title }}</text>
          <view class="header-actions">
            <button class="history-btn" @tap="goToDepositHistory">
              <Icon name="History" :size="40" :style="{ color: '#64748b' }" />
              <text class="btn-label">记录</text>
            </button>
            <button class="add-btn" @tap="showAddModal = true">
              <Icon name="Plus" :size="32" :style="{ color: '#fff' }" />
              <text class="btn-label">新增{{ getAddBtnText() }}</text>
            </button>
          </view>
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

        <!-- 账户列表 -->
        <view class="accounts-list">
          <view 
            v-for="acc in filteredAccounts" 
            :key="acc.id"
            class="account-card"
            :class="{ 'bank-card': acc.type === 'BANK' }"
          >
            <view v-if="acc.type === 'BANK'" class="bank-bg-blur"></view>
            
            <!-- 删除按钮 -->
            <button class="delete-btn" :class="{ 'bank-card-btn': acc.type === 'BANK' }" @tap.stop="handleDeleteClick(acc)">
              <Icon name="CardDelete" :size="36" />
            </button>
            
            <view class="account-header">
              <view class="account-info">
                <view class="account-icon-box" :class="{ 'bank-icon-box': acc.type === 'BANK', 'crypto-icon-box': acc.type === 'CRYPTO' }">
                  <Icon 
                    v-if="acc.type === 'BANK'"
                    name="BankIcon" 
                    :size="48" 
                    :style="{ color: '#fff' }"
                  />
                  <image 
                    v-else-if="acc.type === 'CRYPTO' && getCurrencySvgPath(acc.currency)"
                    :src="getCurrencySvgPath(acc.currency)" 
                    class="crypto-icon-image" 
                    mode="aspectFit" 
                  />
                  <text v-else-if="acc.type === 'CRYPTO'" class="crypto-icon-text">{{ getCurrencyIcon(acc.currency) }}</text>
                </view>
                <view class="account-details">
                  <text class="account-provider">{{ acc.provider }}</text>
                  <text class="account-name">{{ acc.accountName }}</text>
                </view>
              </view>
              <view class="currency-icon-box" :class="{ 'bank-currency-box': acc.type === 'BANK' }">
                <image 
                  v-if="getCurrencySvgPath(acc.currency)" 
                  :src="getCurrencySvgPath(acc.currency)" 
                  class="currency-icon-image" 
                  mode="aspectFit" 
                />
                <text v-else class="currency-icon-text">{{ getCurrencyIcon(acc.currency) }}</text>
              </view>
            </view>

            <view class="account-footer">
              <text class="account-number">{{ acc.accountNumber }}</text>
              <text v-if="acc.network" class="network-badge">{{ acc.network }}</text>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-if="filteredAccounts.length === 0" class="empty-state">
            <Icon name="Plus" :size="128" :style="{ color: '#94a3b8', opacity: 0.3 }" />
            <text class="empty-text">暂无收款方式</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 添加账户弹窗 -->
    <view v-if="showAddModal" class="modal-overlay" @tap="closeAllDropdowns">
      <view class="modal-content" @tap.stop>
        <button class="modal-close" @tap="showAddModal = false">
          <Icon name="Close" :size="80" />
        </button>
        <text class="modal-title">添加{{ getAddBtnText() }}</text>
        
        <form class="form-container" @submit.prevent="handleAddSubmit">
          <!-- 银行卡：选择币种 -->
          <FormSelect
            v-if="activeTab === 'BANK'"
            ref="currencySelectRef"
            v-model="formData.currency"
            label="结算币种"
            :options="currencies"
            value-key="code"
            :show-icon="true"
            :get-icon-path="getCurrencySvgPath"
            :get-icon-text="getCurrencyIcon"
            :get-display-text="(option) => `${option.code} - ${getCurrencyName(option.code)}`"
            placeholder="请选择"
            @change="handleCurrencyChange"
          />

          <!-- 钱包：选择网络 -->
          <FormSelect
            v-if="activeTab === 'CRYPTO'"
            ref="networkSelectRef"
            v-model="formData.network"
            label="网络类型"
            :options="cryptoNetworks"
            value-key="code"
            label-key="name"
            placeholder="请选择"
            @change="handleNetworkChange"
          />

          <!-- 银行卡字段 -->
          <template v-if="activeTab === 'BANK'">
            <FormInput
              v-model="formData.provider"
              label="开户行"
              placeholder="请输入开户行名称"
            />
            <FormInput
              v-model="formData.name"
              label="持卡人姓名"
              placeholder="请输入真实姓名"
            />
            <FormInput
              v-model="formData.number"
              label="银行卡号"
              placeholder="请输入银行卡号"
            />
          </template>

          <!-- 钱包字段 -->
          <template v-else-if="activeTab === 'CRYPTO'">
            <FormInput
              v-model="formData.provider"
              label="平台名称"
              placeholder="请输入平台名称"
            />
            <FormInput
              v-model="formData.name"
              label="钱包名称"
              placeholder="请输入钱包名称"
            />
            <FormInput
              v-model="formData.number"
              label="钱包地址"
              placeholder="请输入钱包地址"
            />
          </template>

          <!-- 其他账户字段 -->
          <template v-else-if="activeTab === 'THIRD_PARTY'">
            <FormInput
              v-model="formData.provider"
              label="平台名称"
              placeholder="请输入平台名称"
            />
            <FormInput
              v-model="formData.number"
              label="平台账号"
              placeholder="请输入平台账号"
            />
            <FormInput
              v-model="formData.contact"
              label="联系方式"
              placeholder="请输入联系方式"
            />
            <view class="form-tip">
              <text class="tip-text">支持第三方平台，如：支付宝、微信、PayPal、Stripe、Wise、Revolut 等</text>
            </view>
          </template>

          <button type="button" class="submit-btn" @tap="handleAddSubmit">确认绑定</button>
        </form>
      </view>
    </view>

    <!-- Toast 提示 -->
    <Toast 
      v-if="toastMessage" 
      :message="toastMessage" 
      :type="toastType" 
      :duration="2000"
    />

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      :visible="showDeleteConfirm"
      title="确认删除"
      message="确定要删除此收款账户吗？删除后无法恢复。"
      confirm-text="确认删除"
      cancel-text="取消"
      @confirm="handleDeleteConfirm"
      @cancel="showDeleteConfirm = false"
      @update:visible="showDeleteConfirm = $event"
    />

    <view class="bottom-nav-wrapper">
      <BottomNav />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'
import Icon from '@/components/Icon.vue'
import FormInput from '@/components/FormInput.vue'
import FormSelect from '@/components/FormSelect.vue'
import Toast from '@/components/Toast.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { TRANSLATIONS, MOCK_ACCOUNTS, FIAT_CURRENCIES, CRYPTO_CURRENCIES, CURRENCIES, CRYPTO_NETWORKS } from '@/utils/constants.js'
import { getAccounts, deleteAccount, addAccount } from '@/api/index.js'
import store from '@/store/index.js'

const theme = ref(uni.getStorageSync('theme') || 'light')
const { headerTotalHeight } = useHeaderHeight()
const lang = ref(uni.getStorageSync('lang') || 'zh')
const t = computed(() => TRANSLATIONS[lang.value])

const activeTab = ref('BANK')
const showAddModal = ref(false)
const showCurrencyDropdown = ref(false)
const showNetworkDropdown = ref(false)
const accounts = ref([])
const formData = ref({
  provider: '',
  name: '',
  number: '',
  contact: '',
  currency: 'CNY',
  network: 'TRC20'
})

// Toast 状态
const toastMessage = ref('')
const toastType = ref('none')
let toastTimer = null

// 删除确认状态
const showDeleteConfirm = ref(false)
const accountToDelete = ref(null)

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

// 点击删除按钮
const handleDeleteClick = (account) => {
  accountToDelete.value = account
  showDeleteConfirm.value = true
}

// 确认删除
const handleDeleteConfirm = async () => {
  if (!accountToDelete.value) {
    showDeleteConfirm.value = false
    return
  }

  const accountId = accountToDelete.value.id
  const accountType = accountToDelete.value.type === 'BANK' ? '银行卡' : '钱包'

  try {
    await deleteAccount(accountId)
    showToast(`已删除${accountType}账户`, 'success')
    showDeleteConfirm.value = false
    accountToDelete.value = null
    
    // 重新加载账户列表
    await loadAccounts()
  } catch (error) {
    console.error('删除账户失败:', error)
    showToast('删除失败，请稍后重试', 'error')
    showDeleteConfirm.value = false
    accountToDelete.value = null
  }
}

// 使用从 constants.js 导入的网络列表
const cryptoNetworks = CRYPTO_NETWORKS

const networkIndex = computed(() => {
  return cryptoNetworks.findIndex(n => n.code === formData.value.network)
})

const tabs = computed(() => [
  { label: t.value.assets.bank, value: 'BANK' },
  { label: t.value.assets.wallet, value: 'CRYPTO' },
  { label: t.value.assets.other, value: 'THIRD_PARTY' }
])

// 银行卡只显示法币，加密钱包只显示加密货币
const currencies = computed(() => {
  if (activeTab.value === 'BANK') {
    return FIAT_CURRENCIES
  } else if (activeTab.value === 'CRYPTO') {
    return CRYPTO_CURRENCIES
  }
  return []
})

const currencyIndex = computed(() => {
  return currencies.value.findIndex(c => c.code === formData.value.currency)
})

const filteredAccounts = computed(() => {
  return accounts.value.filter(acc => acc.type === activeTab.value)
})

const getAddBtnText = () => {
  switch (activeTab.value) {
    case 'BANK': return '银行卡'
    case 'CRYPTO': return '钱包'
    case 'THIRD_PARTY': return '其他账户'
    default: return '账户'
  }
}

const getCurrencyName = (code) => {
  const currency = currencies.value.find(c => c.code === code)
  return currency ? currency.name[lang.value] : code
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

const currencySelectRef = ref(null)
const networkSelectRef = ref(null)

// 关闭所有下拉框
const closeAllDropdowns = () => {
  if (currencySelectRef.value && currencySelectRef.value.close) {
    currencySelectRef.value.close()
  }
  if (networkSelectRef.value && networkSelectRef.value.close) {
    networkSelectRef.value.close()
  }
}

const handleCurrencyChange = (value) => {
  // 切换币种时，重置相关字段
  if (activeTab.value === 'BANK') {
    // 银行卡切换币种时，可以重置账户号（可选）
    // formData.value.number = ''
  }
}

const handleNetworkChange = (value) => {
  // 切换网络类型时，重置钱包地址
  if (activeTab.value === 'CRYPTO') {
    formData.value.number = ''
  }
}

// 监听标签切换，重置表单
watch(activeTab, (newTab) => {
  formData.value = {
    provider: '',
    name: '',
    number: '',
    contact: '',
    currency: newTab === 'BANK' ? 'CNY' : '',
    network: newTab === 'CRYPTO' ? 'TRC20' : ''
  }
  
  // 关闭所有下拉框
  closeAllDropdowns()
})


const handleAddSubmit = async () => {
  // 银行卡验证
  if (activeTab.value === 'BANK') {
    // 验证必填项
    if (!formData.value.currency) {
      showToast('请选择结算币种', 'error')
      return
    }
    if (!formData.value.provider || !formData.value.provider.trim()) {
      showToast('请输入开户行名称', 'error')
      return
    }
    if (!formData.value.name || !formData.value.name.trim()) {
      showToast('请输入持卡人姓名', 'error')
      return
    }
    if (!formData.value.number || !formData.value.number.trim()) {
      showToast('请输入银行卡号', 'error')
      return
    }
    
    // 验证银行卡号格式（至少16位数字）
    const cardNumber = formData.value.number.replace(/\s/g, '')
    if (!/^\d{16,19}$/.test(cardNumber)) {
      showToast('请输入正确的银行卡号（16-19位数字）', 'error')
      return
    }
  }
  
  // 加密钱包验证
  if (activeTab.value === 'CRYPTO') {
    // 验证必填项
    if (!formData.value.network) {
      showToast('请选择网络类型', 'error')
      return
    }
    if (!formData.value.provider || !formData.value.provider.trim()) {
      showToast('请输入平台名称', 'error')
      return
    }
    if (!formData.value.name || !formData.value.name.trim()) {
      showToast('请输入钱包名称', 'error')
      return
    }
    if (!formData.value.number || !formData.value.number.trim()) {
      showToast('请输入钱包地址', 'error')
      return
    }
    
    // 验证钱包地址格式（根据网络类型）
    const address = formData.value.number.trim()
    if (formData.value.network === 'TRC20' || formData.value.network === 'BEP20') {
      // TRC20/BEP20 地址格式：以 T 开头，34位字符
      if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) {
        showToast('请输入正确的 TRC20/BEP20 钱包地址', 'error')
        return
      }
    } else if (formData.value.network === 'ERC20' || formData.value.network === 'POLYGON') {
      // ERC20/Polygon 地址格式：0x 开头，42位字符
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        showToast('请输入正确的 ERC20/Polygon 钱包地址', 'error')
        return
      }
    } else if (formData.value.network === 'BTC-Native' || formData.value.network === 'SegWit') {
      // BTC 地址格式：以 1、3 或 bc1 开头
      if (!/^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(address)) {
        showToast('请输入正确的 BTC 钱包地址', 'error')
        return
      }
    }
  }
  
  // 其他账户验证
  if (activeTab.value === 'THIRD_PARTY') {
    if (!formData.value.provider || !formData.value.provider.trim()) {
      showToast('请输入平台名称', 'error')
      return
    }
    if (!formData.value.number || !formData.value.number.trim()) {
      showToast('请输入平台账号', 'error')
      return
    }
    if (!formData.value.contact || !formData.value.contact.trim()) {
      showToast('请输入联系方式', 'error')
      return
    }
  }
  
  // 提交数据
  try {
    const submitData = {
      type: activeTab.value,
      provider: formData.value.provider.trim(),
      accountNumber: formData.value.number.trim(),
      currency: formData.value.currency || null,
      network: formData.value.network || null
    }
    
    // 根据类型添加不同的字段
    if (activeTab.value === 'BANK') {
      submitData.accountName = formData.value.name.trim()
    } else if (activeTab.value === 'CRYPTO') {
      submitData.accountName = formData.value.name.trim()
    } else if (activeTab.value === 'THIRD_PARTY') {
      submitData.contact = formData.value.contact.trim()
    }
    
    await addAccount(submitData)
    
    showToast('账户绑定成功', 'success')
    showAddModal.value = false
    
    // 重置表单
    formData.value = { 
      provider: '', 
      name: '', 
      number: '',
      contact: '',
      currency: activeTab.value === 'BANK' ? 'CNY' : '',
      network: activeTab.value === 'CRYPTO' ? 'TRC20' : ''
    }
    
    // 重新加载账户列表
    await loadAccounts()
  } catch (error) {
    console.error('绑定账户失败:', error)
    showToast('绑定失败，请稍后重试', 'error')
  }
}

const goToDepositHistory = () => {
  uni.navigateTo({
    url: '/pages/deposit-history/deposit-history'
  })
}

const loadAccounts = async () => {
  try {
    const data = await getAccounts()
    accounts.value = data || []
  } catch (error) {
    // 连接失败时只输出 console，不显示错误提示
    console.warn('加载账户列表失败:', error)
    // 使用模拟数据作为降级
    accounts.value = MOCK_ACCOUNTS || []
  }
}

onMounted(async () => {
  theme.value = store.theme || 'light'
  lang.value = store.lang || 'zh'
  await loadAccounts()
})
</script>

<style lang="scss" scoped>

@import '@/styles/mixins.scss';

.assets-container {
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

.header-section {
  width: 100%;
  box-sizing: border-box;
  @include flex(row, space-between, center);
  margin-bottom: 48rpx;
}

.page-title {
  @include text-style(40rpx, $font-weight-black, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
}

.header-actions {
  @include flex(row, flex-end, center, 16rpx);
}

.history-btn {
  @include flex(row, center, center, 8rpx);
  padding: 0 24rpx;
  height: 64rpx;
  background-color: $color-bg-tertiary;
  border-radius: 40rpx;
  border: 1rpx solid $color-border-light;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    border: none !important;
    display: none !important;
  }
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    border-color: $color-dark-border-light;
  }
}

.add-btn {
  @include flex(row, center, center, 8rpx);
  padding: 0 32rpx;
  height: 64rpx;
  background-color: $color-primary;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.2);
  border: 0;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    border: none !important;
    display: none !important;
  }
}

.btn-label {
  @include text-style($font-size-md, $font-weight-black, $color-text-secondary);
  text-transform: uppercase;
  
  .add-btn & {
    color: #fff;
  }
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
    
    .add-btn & {
      color: #fff;
    }
  }
}

.tab-container {
  width: 100%;
  box-sizing: border-box;
  @include flex(row, flex-start, center, 8rpx);
  padding: 12rpx;
  background-color: $color-bg-tertiary;
  border-radius: 72rpx;
  margin-bottom: 48rpx;
  box-shadow: inset 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  @include dark-mode {
    background-color: rgba(30, 41, 59, 0.5);
  }
}

.tab-btn {
  flex: 1;
  padding: 12rpx 0;
  height: auto;
  @include text-style(24rpx, $font-weight-black, $color-text-tertiary);
  border-radius: 40rpx;
  transition: all 0.2s;
  background-color: transparent;
  border: 0;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  box-shadow: none;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  &::after {
    border: none !important;
    display: none !important;
  }
  
  @include dark-mode {
    color: $color-dark-text-disabled;
  }
  
  &.active {
    background-color: #fff;
    color: $color-primary;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    
    @include dark-mode {
      background-color: $color-dark-bg-secondary;
      color: $color-primary-light;
    }
  }
}

.accounts-list {
  width: 100%;
  box-sizing: border-box;
  @include flex(column, flex-start, flex-start, 32rpx);
}

.account-card {
  width: 100%;
  box-sizing: border-box;
  padding: 48rpx;
  border-radius: 88rpx;
  border: 1rpx solid $color-border-light;
  background-color: #fff;
  box-shadow: $shadow-lg;
  position: relative;
  overflow: hidden;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
  
  &.bank-card {
    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    border-color: transparent;
    color: #fff;
  }
}

.bank-bg-blur {
  position: absolute;
  top: -40%;
  right: -20%;
  width: 384rpx;
  height: 384rpx;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  filter: blur(96rpx);
}

.account-header {
  @include flex(row, space-between, flex-start);
  margin-bottom: 64rpx;
  position: relative;
  z-index: 1;
}

.account-info {
  @include flex(row, flex-start, center, 32rpx);
}

.account-icon-box {
  width: 88rpx;
  height: 88rpx;
  border-radius: 40rpx;
  background-color: $color-bg-tertiary;
  @include flex(row, center, center);
  flex-shrink: 0;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
  }
  
  &.bank-icon-box {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  &.crypto-icon-box {
    background-color: rgba(37, 99, 235, 0.1);
    padding: 12rpx;
    box-sizing: border-box;
  }
}

.crypto-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.crypto-icon-text {
  font-size: 48rpx;
  line-height: 1;
}

.account-details {
  @include flex(column, flex-start, flex-start, 8rpx);
}

.account-provider {
  @include text-style(28rpx, $font-weight-black, $color-text-primary);
  
  .bank-card & {
    color: #fff;
  }
}

.account-name {
  @include text-style(20rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  
  .bank-card & {
    color: rgba(255, 255, 255, 0.6);
  }
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.currency-icon-box {
  width: 80rpx;
  height: 80rpx;
  padding: 16rpx;
  border-radius: 40rpx;
  background-color: $color-bg-tertiary;
  @include flex(row, center, center);
  box-sizing: border-box;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
  }
  
  &.bank-currency-box {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

.currency-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.currency-icon-text {
  font-size: 48rpx;
  line-height: 1;
}

.account-footer {
  @include flex(row, space-between, flex-end);
  position: relative;
  z-index: 1;
}

.account-number {
  @include text-style(32rpx, $font-weight-black, $color-text-primary);
  font-family: monospace;
  letter-spacing: 0.16em;
  
  .bank-card & {
    color: #fff;
  }
}

.network-badge {
  @include text-style(16rpx, $font-weight-black, #fff);
  background-color: rgba(255, 255, 255, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.empty-state {
  width: 100%;
  padding: 192rpx 0;
  @include flex(column, center, center, 32rpx);
  opacity: 0.3;
}

.empty-text {
  @include text-style(28rpx, $font-weight-black, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 998; // 降低遮罩层层级，确保 picker 下拉列表在其上方
  @include flex(row, center, flex-end);
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  width: 100%;
  max-width: 896rpx; // 与 assets-container 保持一致
  margin-left: auto;
  margin-right: auto; // 居中
  background-color: #fff;
  border-radius: 60rpx 60rpx 0 0;
  padding: 48rpx 40rpx 120rpx;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.15);
  position: relative;
  max-height: 85vh;
  overflow-y: visible; // 改为 visible，确保 picker 下拉列表不被裁剪
  animation: slideUp 0.3s ease;
  box-sizing: border-box;
  z-index: 999; // 弹窗内容在遮罩层上方
  
  // H5端响应式处理 - 与容器保持一致
  // #ifdef H5
  // 小屏幕（< 450px）：添加与容器相同的 padding
  @media (max-width: 449px) {
    padding-left: 16px;
    padding-right: 16px;
  }
  // #endif
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
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

.modal-close {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  width: 104rpx;
  height: 104rpx;
  background-color: $color-bg-tertiary;
  border-radius: 32rpx;
  @include flex(row, center, center);
  border: 0;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  transition: all 0.2s;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    border: none !important;
    display: none !important;
  }
  
  &:active {
    transform: scale(0.95);
    background-color: $color-bg-quaternary;
  }
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    
    &:active {
      background-color: $color-dark-bg-tertiary;
    }
  }
}

.modal-title {
  @include text-style(36rpx, $font-weight-black, $color-text-primary);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 48rpx;
  margin-top: 16rpx;
  
  @include dark-mode {
    color: #fff;
  }
}

.form-container {
  @include flex(column, flex-start, flex-start, 40rpx);
  align-items: stretch; // 用于铺满整个垂直布局的水平面
}

.form-tip {
  width: 100%;
  padding: 16rpx 24rpx;
  background-color: rgba(37, 99, 235, 0.05);
  border-radius: 16rpx;
  margin-top: -16rpx;
  
  @include dark-mode {
    background-color: rgba(37, 99, 235, 0.1);
  }
}

.tip-text {
  @include text-style(22rpx, $font-weight-medium, $color-text-tertiary);
  line-height: 1.5;
  color: rgba(100, 116, 139, 0.8);
  
  @include dark-mode {
    color: rgba(148, 163, 184, 0.7);
  }
}

// 自定义下拉选择组件
.custom-select-wrapper {
  width: 100%;
  position: relative;
  z-index: 1001;
}

.custom-select-input {
  width: 100%;
  box-sizing: border-box;
  padding: 28rpx 32rpx;

  background-color: #fff;
  border-radius: 12rpx;
  border: 1rpx solid #e5e7eb;
  @include flex(row, space-between, center);
  position: relative;
  transition: all 0.2s;
  min-height: 88rpx;
  
  &:active {
    background-color: #fafafa;
  }
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    border-color: $color-dark-border-light;
  }
}

.select-content {
  @include flex(row, flex-start, center, 16rpx);
  flex: 1;
  min-width: 0;
}

.select-icon-wrapper {
  width: 48rpx;
  height: 48rpx;
  @include flex(row, center, center);
  flex-shrink: 0;
}

.select-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.select-icon-text {
  font-size: 40rpx;
  line-height: 1;
}

.select-text {
  @include text-style(28rpx, $font-weight-normal, #1f2937);
  flex: 1;
  min-width: 0;
  
  &.placeholder {
    color: #9ca3af;
    font-weight: normal;
  }
  
  @include dark-mode {
    color: #fff;
    
    &.placeholder {
      color: #6b7280;
    }
  }
}

.select-arrow {
  @include text-style(20rpx, $font-weight-normal, #6b7280);
  transition: transform 0.2s;
  margin-left: 16rpx;
  flex-shrink: 0;
  
  &.open {
    transform: rotate(180deg);
  }
  
  @include dark-mode {
    color: #9ca3af;
  }
}

.custom-select-dropdown {
  position: absolute;
  top: calc(100% + 4rpx);
  left: 0;
  right: 0;
  background-color: #fff;
  border-radius: 12rpx;
  border: 1rpx solid #e5e7eb;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  max-height: 400rpx;
  overflow-y: auto;
  z-index: 1002;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    border-color: $color-dark-border-light;
  }
}

.select-option {
  width: 100%;
  box-sizing: border-box;
  padding: 28rpx 32rpx;
  @include flex(row, space-between, center);
  position: relative;
  transition: background-color 0.15s;
  min-height: 88rpx;
  
  &:not(:last-child) {
    border-bottom: 1rpx solid #f3f4f6;
    
    @include dark-mode {
      border-bottom-color: rgba(255, 255, 255, 0.05);
    }
  }
  
  &:active {
    background-color: #f9fafb;
    
    @include dark-mode {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
  
  &.selected {
    background-color: transparent;
    
    @include dark-mode {
      background-color: transparent;
    }
  }
  
  @include dark-mode {
    &:active {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
}

.option-content {
  @include flex(row, flex-start, center, 16rpx);
  flex: 1;
  min-width: 0;
}

.option-icon-wrapper {
  width: 48rpx;
  height: 48rpx;
  @include flex(row, center, center);
  flex-shrink: 0;
}

.option-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.option-icon-text {
  font-size: 40rpx;
  line-height: 1;
}

.option-text {
  @include text-style(28rpx, $font-weight-normal, #1f2937);
  flex: 1;
  min-width: 0;
  
  .select-option.selected & {
    color: #1f2937;
  }
  
  @include dark-mode {
    color: #fff;
    
    .select-option.selected & {
      color: #fff;
    }
  }
}

.option-indicator {
  width: 4rpx;
  height: 32rpx;
  background-color: #3b82f6;
  border-radius: 2rpx;
  margin-left: 16rpx;
  flex-shrink: 0;
  
  @include dark-mode {
    background-color: #60a5fa;
  }
}


.submit-btn {
  width: 100%;
  box-sizing: border-box;
  padding: 26rpx 0;
  height: auto;
  background-color: $color-primary;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.25);
  @include text-style(30rpx, $font-weight-black, #fff);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-top: 32rpx;
  margin-left: 0;
  margin-right: 0;
  border: 0;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  
  &::after {
    border: none !important;
    display: none !important;
  }
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(37, 99, 235, 0.3);
  }
}

.picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12rpx);
  -webkit-backdrop-filter: blur(12rpx);
  @include flex(row, center, flex-end);
  z-index: 1100;
  animation: fadeIn 0.3s ease;
}

.picker-content {
  width: 100%;
  max-width: 896rpx;
  background-color: #fff;
  border-radius: 60rpx 60rpx 0 0;
  padding: 48rpx 40rpx 120rpx;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.15);
  max-height: 80vh;
  animation: slideUp 0.3s ease;
  box-sizing: border-box;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
  }
}

.picker-title {
  @include text-style(36rpx, $font-weight-black, $color-text-primary);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 48rpx;
  display: block;
  
  @include dark-mode {
    color: #fff;
  }
}

.picker-list {
  max-height: 60vh;
}

.picker-item {
  width: 100%;
  box-sizing: border-box;
  padding: 32rpx 40rpx;
  border-radius: 32rpx;
  border: 2rpx solid transparent;
  @include flex(row, space-between, center);
  margin-bottom: 16rpx;
  transition: all 0.2s;
  background-color: $color-bg-tertiary;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
  }
  
  &.selected {
    background-color: rgba(219, 234, 254, 0.5);
    border-color: $color-primary;
    
    @include dark-mode {
      background-color: rgba(37, 99, 235, 0.1);
    }
  }
  
  &:active {
    transform: scale(0.99);
  }
}

.picker-item-left {
  @include flex(row, flex-start, center, 24rpx);
  flex: 1;
}

.picker-icon-wrapper {
  width: 64rpx;
  height: 64rpx;
  @include flex(row, center, center);
  flex-shrink: 0;
}

.picker-icon {
  font-size: 48rpx;
}

.picker-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.picker-item-info {
  @include flex(column, flex-start, flex-start, 4rpx);
}

.picker-code {
  @include text-style(28rpx, $font-weight-black, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
}

.picker-type {
  @include text-style(22rpx, $font-weight-medium, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.picker-network-name {
  @include text-style(28rpx, $font-weight-bold, $color-text-primary);
  flex: 1;
  
  .picker-item.selected & {
    color: $color-primary;
  }
  
  @include dark-mode {
    color: #fff;
    
    .picker-item.selected & {
      color: $color-primary-light;
    }
  }
}

.picker-check {
  width: 24rpx;
  height: 24rpx;
  background-color: $color-primary;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.5);
  flex-shrink: 0;
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

// 删除按钮
.delete-btn {
  position: absolute;
  top: 5rpx;
  right: 24rpx;
  width: 88rpx;
  height: 88rpx;
  @include flex(row, center, center);
  z-index: 10;
  background: transparent;
  border: 0;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  padding: 0;
  margin: 0;
  opacity: 0.8;
  transition: all 0.3s ease;
  
  &::after {
    border: none;
  }
  
  // H5 端 hover 效果：放大
  // #ifdef H5
  &:hover {
    transform: scale(1.2);
    opacity: 1;
  }
  // #endif
  
  // 银行卡卡片上的按钮，图标颜色为白色
  &.bank-card-btn {
    opacity: 0.9;
    
    :deep(.icon) {
      color: #fff !important;
      fill: #fff !important;
    }
  }
  
  // 普通卡片上的按钮，图标保持原色（CardDelete 图标本身是粉红色）
  &:not(.bank-card-btn) {
    opacity: 0.9;
  }
  
  &:active {
    transform: scale(1.1);
    opacity: 1;
  }
}

// 删除确认对话框

.bottom-nav-wrapper {
  position: fixed; // 固定定位，固定在屏幕底部
  bottom: 0;
  left: 0; // 从左边开始
  right: 0; // 到右边结束
  width: 100%;
  max-width: 896rpx; // 与 assets-container 保持一致
  margin-left: auto;
  margin-right: auto; // 居中
  z-index: $z-index-fixed;
  display: flex;
  justify-content: center;
  pointer-events: none; // 让点击事件穿透到子元素
  box-sizing: border-box;
}
</style>
