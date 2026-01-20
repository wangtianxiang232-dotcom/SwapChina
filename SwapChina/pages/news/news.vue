<template>
  <view class="news-container" :class="{'dark': theme === 'dark'}">
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header />
    
    <scroll-view scroll-y class="scroll-content" :style="{ height: `calc(100vh - ${headerTotalHeight}rpx - var(--bottom-nav-height))` }">
      <!-- 新闻图片头部 -->
      <view v-if="article" class="news-header">
        <image 
          :src="article.imageUrl" 
          class="news-header-image" 
          mode="aspectFill"
          @error="handleImageError"
        />
        <view class="news-header-overlay">
          <button class="back-btn" @tap="goBack">
            <Icon name="ChevronRight" :size="48" :style="{ color: '#fff', transform: 'rotate(180deg)' }" />
          </button>
          <view class="category-badge">
            <text class="category-text">{{ article.category }}</text>
          </view>
        </view>
      </view>

      <!-- 新闻内容 -->
      <view v-if="article" class="news-content">
        <!-- 日期和阅读时间 -->
        <view class="news-meta">
          <text class="news-date">{{ article.date }}</text>
          <view class="read-time-badge">
            <text class="read-time-text">官方新闻</text>
          </view>
        </view>

        <!-- 标题 -->
        <text class="news-title">{{ getTitle() }}</text>

        <!-- 分割线 -->
        <view class="divider"></view>

        <!-- 正文内容 -->
        <view class="news-body">
          <text class="news-paragraph">{{ getContent() }}</text>
          <text class="news-paragraph">
            SwapChina 持续致力于连接全球数字资产。我们的安全托管技术确保每一笔交易都受到保护，结算速度极快。无论您身在何处，都能享受便捷、安全的跨境数字资产兑换服务。
          </text>
          <text class="news-paragraph">
            我们不断优化用户体验，提供更多币种支持，降低交易成本，提高结算效率。通过先进的技术和严格的安全措施，SwapChina 已成为全球用户信赖的数字资产兑换平台。
          </text>

          <!-- 提示框 -->
          <view class="notice-box">
            <text class="notice-title">提示：</text>
            <text class="notice-text">指定地区的用户可能需要额外的 KYC 验证以获得更高的交易限额。</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-section">
          <button class="action-btn" @tap="handleAction">
            <text class="action-btn-text">了解更多</text>
          </button>
        </view>
      </view>

      <!-- 加载中或未找到 -->
      <view v-else class="loading-container">
        <text class="loading-text">{{ loading ? '加载中...' : '未找到文章' }}</text>
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
import { getNewsDetail } from '@/api/index.js'
import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'
import Icon from '@/components/Icon.vue'
import store from '@/store/index.js'
import { showToast } from '@/utils/toast'

const theme = ref(uni.getStorageSync('theme') || 'light')
const lang = ref(uni.getStorageSync('lang') || 'zh')
const { headerTotalHeight } = useHeaderHeight()
const article = ref(null)
const loading = ref(true)

onLoad(async (options) => {
  const id = options.id
  if (id) {
    try {
      article.value = await getNewsDetail(id)
    } catch (error) {
      console.error('加载新闻详情失败:', error)
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})

onMounted(() => {
  theme.value = store.theme || 'light'
  lang.value = store.lang || 'zh'
})

// 获取标题（支持多语言）
const getTitle = () => {
  if (!article.value) return ''
  if (typeof article.value.title === 'string') {
    return article.value.title
  }
  return article.value.title?.[lang.value] || article.value.title?.zh || ''
}

// 获取内容（支持多语言）
const getContent = () => {
  if (!article.value) return ''
  if (typeof article.value.content === 'string') {
    return article.value.content
  }
  return article.value.content?.[lang.value] || article.value.content?.zh || ''
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 处理操作按钮
const handleAction = () => {
  // 可以根据新闻类型跳转到不同页面
  if (article.value?.category === 'PROMOTION') {
    uni.switchTab({
      url: '/pages/exchange/exchange'
    })
  } else {
    showToast({
      message: '感谢关注',
      type: 'none',
      duration: 2000
    })
  }
}

// 图片加载错误处理
const handleImageError = () => {
  console.error('新闻图片加载失败')
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.news-container {
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
  height: calc(100vh - var(--header-height) - var(--bottom-nav-height));
}

.news-header {
  position: relative;
  width: 100%;
  height: 512rpx;
  overflow: hidden;
}

.news-header-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent);
  @include flex(row, space-between, flex-start);
  padding: 32rpx;
  box-sizing: border-box;
}

.back-btn {
  width: 88rpx;
  height: 88rpx;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-radius: 50%;
  @include flex(row, center, center);
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.95);
    background-color: rgba(255, 255, 255, 0.4);
  }
  
  &::after {
    border: none !important;
    display: none !important;
  }
}

.category-badge {
  background-color: $color-primary;
  padding: 8rpx 24rpx;
  border-radius: 40rpx;
}

.category-text {
  @include text-style(20rpx, $font-weight-black, #fff);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.news-content {
  background-color: #fff;
  margin-top: -48rpx;
  border-radius: 50rpx 50rpx 0 0;
  padding: 48rpx;
  padding-bottom: 200rpx;
  position: relative;
  z-index: 10;
  box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
  }
}

.news-meta {
  @include flex(row, space-between, center);
  margin-bottom: 32rpx;
}

.news-date {
  @include text-style(24rpx, $font-weight-normal, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.read-time-badge {
  background-color: $color-bg-tertiary;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
  }
}

.read-time-text {
  @include text-style(22rpx, $font-weight-medium, $color-text-secondary);
  
  @include dark-mode {
    color: $color-dark-text-secondary;
  }
}

.news-title {
  @include text-style(48rpx, $font-weight-black, $color-text-primary);
  line-height: 1.3;
  display: block;
  margin-bottom: 32rpx;
  
  @include dark-mode {
    color: #fff;
  }
}

.divider {
  width: 100%;
  height: 2rpx;
  background-color: $color-border-light;
  margin-bottom: 48rpx;
  
  @include dark-mode {
    background-color: rgba(148, 163, 184, 0.3);
  }
}

.news-body {
  @include flex(column, flex-start, flex-start, 32rpx);
}

.news-paragraph {
  @include text-style(28rpx, $font-weight-normal, $color-text-secondary);
  line-height: 1.8;
  display: block;
  
  @include dark-mode {
    color: $color-dark-text-secondary;
  }
}

.notice-box {
  background-color: rgba(37, 99, 235, 0.1);
  padding: 32rpx;
  border-radius: 32rpx;
  border: 2rpx solid rgba(37, 99, 235, 0.2);
  margin-top: 16rpx;
  
  @include dark-mode {
    background-color: rgba(37, 99, 235, 0.1);
    border-color: rgba(37, 99, 235, 0.3);
  }
}

.notice-title {
  @include text-style(28rpx, $font-weight-black, $color-primary);
  display: block;
  margin-bottom: 16rpx;
  
  @include dark-mode {
    color: #93c5fd;
  }
}

.notice-text {
  @include text-style(24rpx, $font-weight-normal, $color-primary);
  line-height: 1.6;
  display: block;
  opacity: 0.9;
  
  @include dark-mode {
    color: #93c5fd;
  }
}

.action-section {
  margin-top: 64rpx;
  width: 100%;
}

.action-btn {
  width: 100%;
  padding: 32rpx 0;
  background-color: $color-primary;
  border-radius: 36rpx;
  @include text-style(32rpx, $font-weight-black, #fff);
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  transition: all 0.2s;
  box-shadow: 0 8rpx 32rpx rgba(37, 99, 235, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    transform: scale(0.98);
    background-color: #3b82f6;
  }
  
  &::after {
    border: none !important;
    display: none !important;
  }
}

.action-btn-text {
  @include text-style(32rpx, $font-weight-black, #fff);
}

.loading-container {
  @include flex(row, center, center);
  padding: 160rpx 0;
  min-height: 400rpx;
}

.loading-text {
  @include text-style(28rpx, $font-weight-medium, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
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

