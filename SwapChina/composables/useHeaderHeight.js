import { ref, computed, onMounted } from 'vue'

/**
 * 计算自定义 Header 高度的 composable
 * 适用于所有使用自定义 Header 的页面
 * 
 * 使用方式：
 * ```javascript
 * import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
 * 
 * const { statusBarHeight, headerTotalHeight } = useHeaderHeight()
 * ```
 * 
 * @returns {Object} { statusBarHeight, headerTotalHeight }
 *   - statusBarHeight: 状态栏高度（px），响应式 ref
 *   - headerTotalHeight: Header 总高度（rpx），响应式 computed，用于占位元素的高度
 */
export function useHeaderHeight() {
  const statusBarHeight = ref(0) // 状态栏高度（px）

  // 初始化状态栏高度
  const initStatusBarHeight = () => {
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
  }

  // 计算 Header 总高度（rpx），用于占位元素
  const headerTotalHeight = computed(() => {
    // Header 内容高度 120rpx + 状态栏高度（px转rpx，1px = 2rpx）
    // Header 的 paddingTop 已经包含了 20rpx（或 statusBarHeight + 10px），所以这里不需要再加
    // 占位元素只需要匹配 Header 的实际高度即可
    const statusBarHeightRpx = statusBarHeight.value * 2 // px 转 rpx
    // Header 的 paddingTop：statusBarHeight > 0 ? (statusBarHeight + 10)px : 20rpx
    // 10px ≈ 20rpx，所以统一按 20rpx 计算
    const headerPaddingTop = statusBarHeight.value > 0 ? statusBarHeightRpx : 20
    
    // H5 浏览器环境下，间距需要减少 20rpx（因为 H5 没有状态栏，statusBarHeight 为 0）
    // 通过 statusBarHeight 是否为 0 来判断是否是 H5 环境
    const isH5 = statusBarHeight.value === 0
    
    // H5 环境下减少 20rpx
    const heightAdjustment = isH5 ? -20 : 0
    return 120 + headerPaddingTop + heightAdjustment
  })

  // 在组件挂载时初始化
  onMounted(() => {
    initStatusBarHeight()
  })

  return {
    statusBarHeight,
    headerTotalHeight
  }
}

