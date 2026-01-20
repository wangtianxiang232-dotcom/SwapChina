<template>
  <view class="bottom-nav" :class="{ 'dark': theme === 'dark' }">
    <view 
      v-for="item in navItems" 
      :key="item.path"
      class="nav-item"
      :class="{ 'active': isActive(item.path) }"
      @tap.stop="handleNavClick(item.path)"
      @click.stop="handleNavClick(item.path)"
    >
      <view v-if="isActive(item.path)" class="active-indicator"></view>
      <view class="nav-icon-wrapper">
        <Icon 
          :name="item.iconName" 
          class="nav-icon" 
          :style="{ color: isActive(item.path) ? '#2563eb' : '#94a3b8' }" 
        />
      </view>
      <text class="nav-label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, watch } from 'vue'
import { TRANSLATIONS } from '@/utils/constants.js'
import Icon from '@/components/Icon.vue'
import store from '@/store/index.js'
import { showToast } from '@/utils/toast'

// 响应式数据
const theme = ref(uni.getStorageSync('theme') || 'light')
const lang = ref(uni.getStorageSync('lang') || 'zh')
const currentPath = ref('/pages/index/index')
const isNavigating = ref(false) // 是否正在跳转中
let navigateTimer = null // 防抖定时器

// 计算属性
const navItems = computed(() => {
  const t = TRANSLATIONS[lang.value]
      return [
        { iconName: 'Home', label: t.nav.home, path: '/pages/index/index' },
        { iconName: 'Swap', label: t.nav.swap, path: '/pages/exchange/exchange' },
        { iconName: 'History', label: t.nav.orders, path: '/pages/orders/orders' },
        { iconName: 'Wallet', label: t.nav.assets, path: '/pages/assets/assets' },
        { iconName: 'User', label: t.nav.profile, path: '/pages/profile/profile' }
      ]
})
// 监听 store 变化
watch(() => store.theme, (newVal) => {
  theme.value = newVal
}, { immediate: true })

watch(() => store.lang, (newVal) => {
  lang.value = newVal
}, { immediate: true })

// 生命周期
onMounted(() => {
  initData()
  watchPageChange()
})

onActivated(() => {
  // 当页面激活时更新当前路径（用于 tabBar 页面切换）
  updateCurrentPath()
})

// 初始化数据
const initData = () => {
  theme.value = uni.getStorageSync('theme') || 'light'
  lang.value = uni.getStorageSync('lang') || 'zh'
  updateCurrentPath()
}

// 更新当前路径
const updateCurrentPath = () => {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const route = '/' + pages[pages.length - 1].route
    if (currentPath.value !== route) {
      currentPath.value = route
    }
  }
}

// 判断导航项是否激活
const isActive = (path) => {
  // 如果完全匹配，直接返回 true
  if (currentPath.value === path) {
    return true
  }
  
  // 特殊处理：订单详情页应该激活"订单"标签
  if (path === '/pages/orders/orders' && currentPath.value.startsWith('/pages/order')) {
    return true
  }
  
  return false
}

// 监听页面变化
const watchPageChange = () => {
  // 使用定时器监听页面变化（uni-app 没有路由监听）
  setInterval(() => {
    updateCurrentPath()
  }, 500)
}

// 处理导航点击
const handleNavClick = (path) => {
  // 如果正在跳转中，忽略点击
  if (isNavigating.value) {
    return
  }
  
  // 如果点击的是当前页面，不执行跳转
  if (currentPath.value === path) {
    return
  }
  
  // 清除之前的防抖定时器
  if (navigateTimer) {
    clearTimeout(navigateTimer)
  }
  
  // 防抖处理：延迟执行跳转
  navigateTimer = setTimeout(() => {
    // 设置跳转状态
    isNavigating.value = true
    
    // 底部导航的页面列表
    const bottomNavPages = [
      '/pages/index/index',
      '/pages/exchange/exchange',
      '/pages/orders/orders',
      '/pages/assets/assets',
      '/pages/profile/profile'
    ]
    
    if (bottomNavPages.includes(path)) {
      // 使用 reLaunch 跳转到底部导航页面，清空页面栈，确保每次切换都是全新状态
      uni.reLaunch({
        url: path,
        success: () => {
          // 延迟更新路径，确保页面已加载
          setTimeout(() => {
            updateCurrentPath()
            isNavigating.value = false
          }, 300)
        },
        fail: (err) => {
          console.error('导航跳转失败:', err)
          isNavigating.value = false
          // 如果是导航取消错误，不显示提示（可能是用户快速切换导致的）
          if (!err.errMsg || !err.errMsg.includes('Navigation cancelled')) {
            showToast({
              message: `跳转失败: ${err.errMsg || '未知错误'}`,
              type: 'none',
              duration: 2000
            })
          }
        }
      })
    } else {
      // 使用 navigateTo 跳转到普通页面（非底部导航页面）
      uni.navigateTo({
        url: path,
        success: () => {
          setTimeout(() => {
            updateCurrentPath()
            isNavigating.value = false
          }, 200)
        },
        fail: (err) => {
          console.error('导航跳转失败:', err)
          isNavigating.value = false
          if (!err.errMsg || !err.errMsg.includes('Navigation cancelled')) {
            showToast({
              message: `跳转失败: ${err.errMsg || '未知错误'}`,
              type: 'none',
              duration: 2000
            })
          }
        }
      })
    }
  }, 150) // 150ms 防抖延迟
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.bottom-nav {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-start;
  padding: 16rpx 0 40rpx 0; // 减少上下 padding，底部留出安全区域
  background-color: #ffffff; // 纯白色背景
  border-top: 1rpx solid #e2e8f0; // border-slate-200
  z-index: $z-index-fixed;
  pointer-events: auto;
  box-sizing: border-box;
  
  &.dark {
    background-color: #0f172a; // dark:bg-slate-900
    border-top-color: #1e293b; // dark:border-slate-800
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx; // 图标和文字之间的间距
  position: relative;
  flex: 1;
  color: #94a3b8; // text-slate-400 灰色
  transition: all 0.2s ease;
  padding: 0;
  cursor: pointer;
  user-select: none; // 禁止选中
  -webkit-tap-highlight-color: transparent; // 移除点击高亮
  
  @include dark-mode {
    color: #64748b; // dark:text-slate-500
  }
  
  &.active {
    color: #2563eb; // text-blue-600 蓝色
    
    @include dark-mode {
      color: #60a5fa; // dark:text-blue-400
    }
    
    .nav-icon {
      color: #2563eb !important; // APP端需要强制设置颜色
      
      @include dark-mode {
        color: #60a5fa !important;
      }
    }
    
    .nav-label {
      color: #2563eb; // 激活时文字也是蓝色
      font-weight: 600;
      
      @include dark-mode {
        color: #60a5fa;
      }
    }
  }
  
  // 未激活状态，确保图标是灰色
  &:not(.active) {
    .nav-icon {
      color: #94a3b8 !important; // APP端需要强制设置颜色
      
      @include dark-mode {
        color: #64748b !important;
      }
    }
  }
  
  &:active {
    opacity: 0.6;
  }
}

.active-indicator {
  position: absolute;
  top: -10rpx; // 在图标上方 10rpx 间距
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx; // 下划线宽度
  height: 4rpx; // 下划线高度
  background-color: #2563eb; // bg-blue-600 蓝色
  border-radius: 2rpx; // 稍微圆角
  z-index: 1;
  // 毛边效果：减小模糊和阴影
  filter: blur(1rpx); // 减小模糊效果
  box-shadow: 0 0 4rpx rgba(37, 99, 235, 0.4), // 减小蓝色光晕
              0 0 2rpx rgba(37, 99, 235, 0.3); // 减小内层光晕
  
  @include dark-mode {
    background-color: #60a5fa; // dark:bg-blue-400
    box-shadow: 0 0 4rpx rgba(96, 165, 250, 0.4),
                0 0 2rpx rgba(96, 165, 250, 0.3);
  }
}

.nav-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 48rpx; // 图标容器高度
  margin-bottom: 4rpx; // 图标和文字之间的间距
  position: relative;
}

.nav-icon {
  width: 48rpx; // w-6 = 24px = 48rpx
  height: 48rpx; // h-6 = 24px = 48rpx
  transition: color 0.2s ease;
  color: inherit; // 继承父元素的颜色
  
  // SVG 图标颜色继承
  :deep(svg) {
    fill: currentColor;
    stroke: currentColor;
  }
}

.nav-label {
  font-size: 22rpx; // text-[11px] = 11px = 22rpx
  font-weight: 500; // font-medium
  transition: color 0.2s ease;
  color: inherit; // 继承父元素的颜色
  line-height: 1.2;
  text-align: center;
  
  .nav-item.active & {
    font-weight: 600; // 激活时稍微加粗
  }
}
</style>

