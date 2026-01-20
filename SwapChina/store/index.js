// 全局状态管理
import { reactive, watch } from 'vue';

const state = reactive({
  lang: uni.getStorageSync('lang') || 'zh',
  theme: uni.getStorageSync('theme') || 'light',
  balance: 12450.80,
  userAvatar: 'https://picsum.photos/seed/user-main/100/100',
  isLoginLoading: false,
  unreadCount: 33,
  user: {
    uid: '8219385012',
    nickname: 'John Doe',
    balanceUsd: 12450.80,
    isVerified: false
  }
});

// 监听变化并保存到本地存储
watch(() => state.lang, (newLang) => {
  uni.setStorageSync('lang', newLang);
});

watch(() => state.theme, (newTheme) => {
  uni.setStorageSync('theme', newTheme);
  // 设置系统主题
  // #ifdef APP-PLUS
  if (typeof plus !== 'undefined' && plus.navigator) {
    if (newTheme === 'dark') {
      plus.navigator.setStatusBarStyle('light');
    } else {
      plus.navigator.setStatusBarStyle('dark');
    }
  }
  // #endif
}, { immediate: true });

// Toast 提示 - 使用自定义 Toast 组件
import { showToast as showCustomToast } from '@/utils/toast'

export const showToast = (msg, type = 'none') => {
  // 将 type 转换为自定义 Toast 的格式
  const toastType = type === 'success' ? 'success' : type === 'error' ? 'error' : 'none'
  showCustomToast({
    message: msg,
    type: toastType,
    duration: 2000
  })
}

// 切换余额显示（测试功能）
export const toggleBalance = () => {
  const newBalance = state.balance > 0 ? 0 : 12450.80;
  state.balance = newBalance;
  showToast(newBalance > 0 ? '测试模式：已恢复资产余额' : '测试模式：已清空余额', 'success');
};

// 更新头像
export const updateAvatar = (filePath) => {
  state.userAvatar = filePath;
  showToast('头像更新成功', 'success');
};

export default state;

