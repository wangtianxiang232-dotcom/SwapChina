<template>
  <view class="detail-container" :class="{'dark': theme === 'dark'}">
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header />
    
    <!-- 消息详情导航栏 -->
    <PageNav :title="message?.title || '消息详情'" />
    
    <scroll-view scroll-y class="scroll-content" :style="{ height: `calc(100vh - ${headerTotalHeight}rpx - 120rpx - var(--bottom-nav-height))` }">
      <view class="content-wrapper">
        <!-- 消息卡片 -->
        <view v-if="message" class="message-card">
          <!-- 消息头部 -->
          <view class="message-header">
            <view class="message-icon-wrapper" :class="{'read': message.read, 'unread': !message.read}">
              <text class="message-icon">{{ message.read ? '✓' : '!' }}</text>
            </view>
            <view class="message-header-info">
              <text class="message-title">{{ message.title }}</text>
              <text class="message-time">{{ message.time }}</text>
            </view>
          </view>

          <!-- 分割线 -->
          <view class="divider"></view>

          <!-- 消息内容 -->
          <view class="message-body">
            <text class="message-content">{{ message.content }}</text>
            
            <!-- 扩展内容（如果有） -->
            <text v-if="message.fullContent" class="message-full-content">{{ message.fullContent }}</text>
            
            <!-- 详细信息（如果有） -->
            <view v-if="message.details" class="message-details">
              <view 
                v-for="(value, key) in message.details" 
                :key="key"
                class="detail-row"
              >
                <text class="detail-label">{{ key }}</text>
                <text class="detail-value">{{ value }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载中或未找到 -->
        <view v-else class="loading-container">
          <text class="loading-text">{{ loading ? '加载中...' : '未找到消息' }}</text>
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
import { getMessageDetail, markMessageAsRead } from '@/api/index.js'
import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'
import PageNav from '@/components/PageNav.vue'
import store from '@/store/index.js'

const theme = ref(uni.getStorageSync('theme') || 'light')
const { headerTotalHeight } = useHeaderHeight()
const message = ref(null)
const loading = ref(true)

onLoad(async (options) => {
  const id = options.id
  if (id) {
    try {
      message.value = await getMessageDetail(id)
      // 标记为已读
      if (message.value && !message.value.read) {
        await markMessageAsRead(id)
        message.value.read = true
      }
    } catch (error) {
      console.error('加载消息详情失败:', error)
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})

onMounted(() => {
  theme.value = store.theme || 'light'
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.detail-container {
  min-height: 100vh;
  max-width: 896rpx;
  margin-left: auto;
  margin-right: auto;
  background-color: $color-bg-primary;
  box-shadow: $shadow-2xl;
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
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

.message-card {
  background-color: #fff;
  padding: 48rpx;
  border-radius: 50rpx;
  border: 1rpx solid $color-border-light;
  box-shadow: $shadow-sm;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-border-light;
  }
}

.message-header {
  @include flex(row, flex-start, flex-start, 24rpx);
  margin-bottom: 32rpx;
}

.message-icon-wrapper {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  @include flex(row, center, center);
  flex-shrink: 0;
  
  &.read {
    background-color: $color-bg-tertiary;
    
    @include dark-mode {
      background-color: $color-dark-bg-secondary;
    }
  }
  
  &.unread {
    background-color: $color-primary;
    box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.3);
  }
}

.message-icon {
  @include text-style(44rpx, $font-weight-black, #fff);
  
  .read & {
    color: $color-text-tertiary;
    
    @include dark-mode {
      color: $color-dark-text-tertiary;
    }
  }
}

.message-header-info {
  flex: 1;
  min-width: 0;
  @include flex(column, flex-start, flex-start, 8rpx);
}

.message-title {
  @include text-style(36rpx, $font-weight-black, $color-text-primary);
  line-height: 1.3;
  
  @include dark-mode {
    color: #fff;
  }
}

.message-time {
  @include text-style(24rpx, $font-weight-normal, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.divider {
  width: 100%;
  height: 2rpx;
  background-color: $color-border-light;
  margin-bottom: 32rpx;
  
  @include dark-mode {
    background-color: rgba(148, 163, 184, 0.3);
  }
}

.message-body {
  @include flex(column, flex-start, flex-start, 24rpx);
}

.message-content {
  @include text-style(28rpx, $font-weight-normal, $color-text-primary);
  line-height: 1.8;
  display: block;
  
  @include dark-mode {
    color: #fff;
  }
}

.message-full-content {
  @include text-style(28rpx, $font-weight-normal, $color-text-secondary);
  line-height: 1.8;
  display: block;
  margin-top: 16rpx;
  
  @include dark-mode {
    color: $color-dark-text-secondary;
  }
}

.message-details {
  width: 100%;
  margin-top: 32rpx;
  padding: 32rpx;
  background-color: rgba(37, 99, 235, 0.05);
  border-radius: 32rpx;
  border: 2rpx solid rgba(37, 99, 235, 0.1);
  @include flex(column, flex-start, flex-start, 24rpx);
  
  @include dark-mode {
    background-color: rgba(37, 99, 235, 0.1);
    border-color: rgba(37, 99, 235, 0.2);
  }
}

.detail-row {
  width: 100%;
  @include flex(row, space-between, center);
}

.detail-label {
  @include text-style(24rpx, $font-weight-bold, $color-text-tertiary);
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.detail-value {
  @include text-style(24rpx, $font-weight-normal, $color-text-primary);
  text-align: right;
  flex: 1;
  margin-left: 16rpx;
  
  @include dark-mode {
    color: #fff;
  }
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

