// Toast 提示工具函数 - 使用自定义 Toast 组件

// 全局 Toast 状态（需要在 App.vue 中初始化）
let toastState = null

// 初始化 Toast 状态（在 App.vue 中调用）
export function initToastState(state) {
  toastState = state
}

// 显示 Toast
export function showToast(options) {
  if (!toastState) {
    // 如果 toastState 未初始化，降级使用 uni.showToast
    console.warn('Toast state not initialized, falling back to uni.showToast')
    if (typeof options === 'string') {
      uni.showToast({
        title: options,
        icon: 'none',
        duration: 2000
      })
    } else {
      uni.showToast({
        title: options.message || options.title || '',
        icon: options.icon || 'none',
        duration: options.duration || 2000,
        mask: options.mask || false
      })
    }
    return
  }

  if (typeof options === 'string') {
    toastState.message = options
    toastState.type = 'none'
    toastState.duration = 2000
  } else {
    toastState.message = options.message || options.title || ''
    // 将 uni.showToast 的 icon 转换为自定义 Toast 的 type
    if (options.icon === 'success') {
      toastState.type = 'success'
    } else if (options.icon === 'error') {
      toastState.type = 'error'
    } else if (options.icon === 'loading') {
      toastState.type = 'info'
    } else {
      toastState.type = options.type || 'none'
    }
    toastState.duration = options.duration || 2000
  }
}

// 便捷方法
export function showSuccess(message, duration = 2000) {
  showToast({ message, type: 'success', duration })
}

export function showError(message, duration = 2000) {
  showToast({ message, type: 'error', duration })
}

export function showWarning(message, duration = 2000) {
  showToast({ message, type: 'warning', duration })
}

export function showInfo(message, duration = 2000) {
  showToast({ message, type: 'info', duration })
}
