# 公共组件使用说明

## 组件列表

### 1. Header 组件 (`components/Header.vue`)

自定义头部导航栏组件，包含：
- Logo 和品牌名称
- 测试模式切换功能（点击 Logo）
- 消息通知按钮（带未读数量徽章）
- 用户头像（支持点击更换）

**使用方法：**

```vue
<template>
  <view>
    <Header />
    <!-- 页面内容 -->
  </view>
</template>

<script>
import Header from '@/components/Header.vue'

export default {
  components: {
    Header
  }
}
</script>
```

### 2. BottomNav 组件 (`components/BottomNav.vue`)

底部导航栏组件，包含5个导航项：
- 首页
- 兑换
- 订单
- 账户
- 我的

**使用方法：**

```vue
<template>
  <view>
    <!-- 页面内容 -->
    <BottomNav />
  </view>
</template>

<script>
import BottomNav from '@/components/BottomNav.vue'

export default {
  components: {
    BottomNav
  }
}
</script>
```

**注意：** BottomNav 使用 `position: fixed`，页面内容需要预留底部空间（约 200rpx）。

### 3. SVG 图标组件 (`components/icons/`)

所有图标组件都基于 SVG，支持：
- 自定义颜色（通过 `currentColor`）
- 自定义大小（通过 `className` 或 `style`）
- 深色模式适配

**可用图标：**
- `HomeIcon` - 首页图标
- `SwapIcon` - 兑换图标
- `HistoryIcon` - 历史/订单图标
- `WalletIcon` - 钱包/账户图标
- `UserIcon` - 用户图标
- `BellIcon` - 通知图标
- `CameraIcon` - 相机图标

**使用方法：**

```vue
<template>
  <view>
    <HomeIcon class="icon" />
  </view>
</template>

<script>
import HomeIcon from '@/components/icons/HomeIcon.vue'

export default {
  components: {
    HomeIcon
  }
}
</script>

<style scoped>
.icon {
  width: 48rpx;
  height: 48rpx;
  color: #2563eb;
}
</style>
```

## 完整示例

```vue
<template>
  <view class="page-container">
    <Header />
    <scroll-view scroll-y class="content">
      <!-- 页面内容 -->
    </scroll-view>
    <BottomNav />
  </view>
</template>

<script>
import Header from '@/components/Header.vue'
import BottomNav from '@/components/BottomNav.vue'

export default {
  components: {
    Header,
    BottomNav
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  padding-bottom: 200rpx; // 为底部导航预留空间
}

.content {
  height: calc(100vh - 180rpx);
}
</style>
```

## 注意事项

1. **Header 和 BottomNav 会自动隐藏在某些页面：**
   - 登录页
   - 注册页
   - KYC 认证页
   （需要在组件内部添加逻辑）

2. **主题和语言：**
   - 组件会自动读取 `store` 中的主题和语言设置
   - 支持深色模式

3. **导航跳转：**
   - BottomNav 会自动识别当前页面路径并高亮对应项
   - 使用 `uni.switchTab` 或 `uni.navigateTo` 进行页面跳转

