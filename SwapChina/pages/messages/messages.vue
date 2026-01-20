<template>
  <view class="messages-container" :class="{'dark': theme === 'dark'}">
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header />
    
    <scroll-view scroll-y class="scroll-content" :style="{ height: `calc(100vh - ${headerTotalHeight}rpx - var(--bottom-nav-height))` }">
      <view class="content-wrapper">
        <!-- 页面标题和操作 -->
        <view class="page-header">
          <text class="page-title">消息通知</text>
          <text class="mark-all-btn" @tap="markAllAsRead" v-if="unreadCount > 0">全部已读</text>
        </view>

        <!-- 消息列表 -->
        <view v-if="messages.length > 0" class="messages-list">
          <view 
            v-for="(msg, index) in messages" 
            :key="msg.id"
            class="swipe-cell-wrapper"
            @touchstart="handleTouchStart($event, msg.id)"
            @touchmove="handleTouchMove($event, msg.id)"
            @touchend="handleTouchEnd($event, msg.id)"
          >
            <!-- 内容区域 -->
            <view 
              class="swipe-cell-content"
              :style="{ transform: `translateX(${swipeOffset[msg.id] || 0}rpx)` }"
              @tap="handleItemTap(msg.id)"
            >
              <view 
                class="message-item"
                :class="{'read': msg.read, 'unread': !msg.read}"
              >
                <view class="message-icon-wrapper" :class="{'read': msg.read, 'unread': !msg.read}">
                  <text class="message-icon">{{ msg.read ? '✓' : '!' }}</text>
                </view>
                <view class="message-content-wrapper">
                  <view class="message-header">
                    <text class="message-title" :class="{'unread': !msg.read}">{{ msg.title }}</text>
                    <text class="message-time">{{ msg.time }}</text>
                  </view>
                  <text class="message-content">{{ msg.content }}</text>
                  <view v-if="!msg.read" class="unread-indicator"></view>
                </view>
              </view>
            </view>
            <!-- 右侧操作区域（删除按钮） -->
            <view class="swipe-cell-right">
              <view class="delete-btn" @tap.stop="handleDeleteMessage(msg.id, index)">
                <Icon name="CardDelete" :size="48" />
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="empty-state">
          <Icon name="Bell" :size="120" :style="{ color: '#94a3b8' }" />
          <text class="empty-text">暂无消息</text>
        </view>
      </view>
    </scroll-view>
    
    <view class="bottom-nav-wrapper">
      <BottomNav />
    </view>
    
    <!-- Toast 提示 -->
    <Toast :message="toastMessage" :type="toastType" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMessages, markMessageAsRead, markAllMessagesAsRead, deleteMessage } from '@/api/index.js'
import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'
import Icon from '@/components/Icon.vue'
import Toast from '@/components/Toast.vue'
import store from '@/store/index.js'

const theme = ref(uni.getStorageSync('theme') || 'light')
const { headerTotalHeight } = useHeaderHeight()
const messages = ref([])
const swipeOffset = ref({})
const toastMessage = ref('')
const toastType = ref('none')
const touchStartX = ref({})
const touchStartY = ref({})
const DELETE_BTN_WIDTH = 160 // 删除按钮宽度（rpx）

onLoad(async () => {
  theme.value = store.theme || 'light'
  await loadMessages()
})

onMounted(() => {
  theme.value = store.theme || 'light'
})

// 加载消息列表
const loadMessages = async () => {
  try {
    const data = await getMessages()
    messages.value = data || []
  } catch (error) {
    console.error('加载消息列表失败:', error)
  }
}

// 未读消息数量
const unreadCount = computed(() => {
  return messages.value.filter(msg => !msg.read).length
})

// 跳转到消息详情
const goToMessageDetail = (id) => {
  uni.navigateTo({
    url: `/pages/message-detail/message-detail?id=${id}`
  })
}

// 标记全部为已读
const markAllAsRead = async () => {
  try {
    await markAllMessagesAsRead()
    await loadMessages()
    toastMessage.value = '已全部标记为已读'
    toastType.value = 'success'
    setTimeout(() => {
      toastMessage.value = ''
      toastType.value = 'none'
    }, 2000)
  } catch (error) {
    console.error('标记全部已读失败:', error)
    toastMessage.value = '操作失败'
    toastType.value = 'error'
    setTimeout(() => {
      toastMessage.value = ''
      toastType.value = 'none'
    }, 2000)
  }
}

// 触摸开始
const handleTouchStart = (e, id) => {
  const touch = e.touches[0]
  touchStartX.value[id] = touch.clientX
  touchStartY.value[id] = touch.clientY
  // 阻止其他项的滑动
  Object.keys(swipeOffset.value).forEach(key => {
    if (key !== id && swipeOffset.value[key] < 0) {
      swipeOffset.value[key] = 0
    }
  })
}

// 触摸移动
const handleTouchMove = (e, id) => {
  e.preventDefault()
  const touch = e.touches[0]
  if (!touchStartX.value[id] || !touchStartY.value[id]) return
  
  const deltaX = touch.clientX - touchStartX.value[id]
  const deltaY = Math.abs(touch.clientY - touchStartY.value[id])
  
  // 如果垂直滑动距离大于水平滑动距离，不处理（允许垂直滚动）
  if (deltaY > Math.abs(deltaX) * 1.5) {
    return
  }
  
  // 只允许向左滑动
  if (deltaX < 0) {
    const offset = Math.max(deltaX, -DELETE_BTN_WIDTH)
    swipeOffset.value[id] = offset
  } else if (deltaX > 0 && swipeOffset.value[id] < 0) {
    // 向右滑动，恢复位置
    const offset = Math.min(deltaX + swipeOffset.value[id], 0)
    swipeOffset.value[id] = offset
  }
}

// 触摸结束
const handleTouchEnd = (e, id) => {
  const currentOffset = swipeOffset.value[id] || 0
  
  // 如果滑动超过一半，自动展开；否则自动收起
  if (currentOffset < -DELETE_BTN_WIDTH / 2) {
    swipeOffset.value[id] = -DELETE_BTN_WIDTH
  } else {
    swipeOffset.value[id] = 0
  }
  
  // 清除触摸起点
  delete touchStartX.value[id]
  delete touchStartY.value[id]
}

// 处理点击消息项
const handleItemTap = (id) => {
  // 如果当前项已展开删除按钮，点击时收起
  if (swipeOffset.value[id] < 0) {
    swipeOffset.value[id] = 0
  } else {
    // 否则跳转到详情页
    goToMessageDetail(id)
  }
}

// 删除消息
const handleDeleteMessage = async (id, index) => {
  try {
    await deleteMessage(id)
    // 从列表中移除
    messages.value.splice(index, 1)
    // 重置滑动位置
    delete swipeOffset.value[id]
    toastMessage.value = '消息已删除'
    toastType.value = 'success'
    setTimeout(() => {
      toastMessage.value = ''
      toastType.value = 'none'
    }, 2000)
  } catch (error) {
    console.error('删除消息失败:', error)
    toastMessage.value = '删除失败，请稍后重试'
    toastType.value = 'error'
    setTimeout(() => {
      toastMessage.value = ''
      toastType.value = 'none'
    }, 2000)
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.messages-container {
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
  flex-shrink: 0;
}

.scroll-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 200rpx;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.content-wrapper {
  padding: 40rpx;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.page-header {
  @include flex(row, space-between, center);
  margin-bottom: 32rpx;
}

.page-title {
  @include text-style(48rpx, $font-weight-black, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
}

.mark-all-btn {
  @include text-style(24rpx, $font-weight-bold, $color-primary);
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  background-color: rgba(37, 99, 235, 0.1);
  
  &:active {
    opacity: 0.7;
  }
}

.messages-list {
  @include flex(column, flex-start, flex-start, 24rpx);
}

.swipe-cell-wrapper {
  width: 100%;
  position: relative;
  overflow: hidden;
  margin-bottom: 24rpx;
  background-color: transparent;
  box-sizing: border-box;
  /* 确保容器完全包含内容，防止漏边 */
}

.swipe-cell-content {
  width: 100%;
  position: relative;
  z-index: 10;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: transparent;
  pointer-events: auto;
  /* 确保完全覆盖删除按钮，添加额外的宽度防止漏边 */
  min-width: calc(100% + 2rpx);
  margin-right: -2rpx;
}

.message-item {
  width: 100%;
  padding: 32rpx;
  border-radius: 0;
  border: none;
  border-bottom: 2rpx solid $color-border-light;
  @include flex(row, flex-start, flex-start, 24rpx);
  box-shadow: $shadow-sm;
  box-sizing: border-box;
  background-color: #fff;
  min-height: 120rpx;
  position: relative;
  z-index: 11;
  /* 确保完全覆盖，不留缝隙 */
  overflow: hidden;
  
  &.read {
    background-color: #fff;
    
    @include dark-mode {
      background-color: $color-dark-bg-primary;
      border-bottom-color: $color-dark-border-light;
    }
  }
  
  &.unread {
    background-color: #f0f5ff;
    border-bottom-color: rgba(37, 99, 235, 0.2);
    
    @include dark-mode {
      background-color: rgba(37, 99, 235, 0.2);
      border-bottom-color: rgba(37, 99, 235, 0.3);
    }
  }
}

.message-icon-wrapper {
  width: 64rpx;
  height: 64rpx;
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
  @include text-style(32rpx, $font-weight-black, #fff);
  
  .read & {
    color: $color-text-tertiary;
    
    @include dark-mode {
      color: $color-dark-text-tertiary;
    }
  }
}

.message-content-wrapper {
  flex: 1;
  min-width: 0;
  @include flex(column, flex-start, flex-start, 8rpx);
}

.message-header {
  width: 100%;
  @include flex(row, space-between, flex-start);
}

.message-title {
  @include text-style(28rpx, $font-weight-black, $color-text-primary);
  flex: 1;
  min-width: 0;
  
  &.unread {
    color: $color-primary;
  }
  
  @include dark-mode {
    color: #fff;
    
    &.unread {
      color: #93c5fd;
    }
  }
}

.message-time {
  @include text-style(20rpx, $font-weight-normal, $color-text-tertiary);
  flex-shrink: 0;
  margin-left: 16rpx;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.message-content {
  @include text-style(24rpx, $font-weight-normal, $color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @include dark-mode {
    color: $color-dark-text-secondary;
  }
}

.unread-indicator {
  width: 16rpx;
  height: 16rpx;
  background-color: $color-primary;
  border-radius: 50%;
  margin-top: 8rpx;
  align-self: flex-end;
  box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.5);
}

.empty-state {
  @include flex(column, center, center);
  padding: 160rpx 0;
  min-height: 400rpx;
}

.empty-text {
  @include text-style(28rpx, $font-weight-medium, $color-text-tertiary);
  margin-top: 32rpx;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.swipe-cell-right {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 160rpx;
  z-index: 1;
  display: flex;
  align-items: stretch;
}

.delete-btn {
  width: 100%;
  height: 100%;
  background-color: $color-error;
  @include flex(row, center, center);
  border-radius: 0;
  border: none;
  border-bottom: 2rpx solid $color-error;
  box-shadow: $shadow-sm;
  
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
