<template>
  <view class="form-item">
    <text class="form-label">{{ label }}</text>
    <view 
      class="custom-select-wrapper" 
      ref="wrapperRef" 
      @tap.stop
      @mouseleave="handleMouseLeave"
      @mouseenter="handleMouseEnter"
    >
      <view class="custom-select-input" @tap.stop="toggleDropdown">
        <view class="select-content">
          <view v-if="showIcon && selectedOption" class="select-icon-wrapper">
            <image 
              v-if="getIconPathValue(selectedOption)" 
              :src="getIconPathValue(selectedOption)" 
              class="select-icon-image" 
              mode="aspectFit" 
            />
            <text v-else-if="getIconTextValue(selectedOption)" class="select-icon-text">{{ getIconTextValue(selectedOption) }}</text>
          </view>
          <text class="select-text" :class="{'placeholder': !selectedOption}">
            {{ displayText }}
          </text>
        </view>
        <text class="select-arrow" :class="{'open': isOpen}">▼</text>
      </view>
      <view 
        v-if="isOpen" 
        class="custom-select-dropdown" 
        @tap.stop
        @mouseleave="handleMouseLeave"
        @mouseenter="handleMouseEnter"
      >
        <view 
          v-for="option in options" 
          :key="getOptionValue(option)"
          class="select-option"
          :class="{'selected': isSelected(option)}"
          @tap.stop="selectOption(option)"
        >
          <view class="option-content">
            <view v-if="showIcon" class="option-icon-wrapper">
              <image 
                v-if="getIconPathValue(option)" 
                :src="getIconPathValue(option)" 
                class="option-icon-image" 
                mode="aspectFit" 
              />
              <text v-else-if="getIconTextValue(option)" class="option-icon-text">{{ getIconTextValue(option) }}</text>
            </view>
            <text class="option-text">{{ getOptionLabel(option) }}</text>
          </view>
          <view v-if="isSelected(option)" class="option-indicator"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  },
  label: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  // 选项值字段名（如果 options 是对象数组）
  valueKey: {
    type: String,
    default: 'code'
  },
  // 选项显示字段名（如果 options 是对象数组）
  labelKey: {
    type: String,
    default: 'name'
  },
  // 是否显示图标
  showIcon: {
    type: Boolean,
    default: false
  },
  // 获取图标路径的函数
  getIconPath: {
    type: Function,
    default: null
  },
  // 获取图标文本的函数
  getIconText: {
    type: Function,
    default: null
  },
  // 自定义显示文本的函数
  getDisplayText: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const wrapperRef = ref(null)

const selectedOption = computed(() => {
  return props.options.find(opt => getOptionValue(opt) === props.modelValue) || null
})

const displayText = computed(() => {
  if (!selectedOption.value) {
    return props.placeholder
  }
  
  if (props.getDisplayText) {
    return props.getDisplayText(selectedOption.value)
  }
  
  return getOptionLabel(selectedOption.value)
})

const getOptionValue = (option) => {
  if (typeof option === 'string' || typeof option === 'number') {
    return option
  }
  return option[props.valueKey]
}

const getOptionLabel = (option) => {
  if (typeof option === 'string' || typeof option === 'number') {
    return option
  }
  // 支持多语言对象 { zh: '中文', en: 'English' }
  const label = option[props.labelKey]
  if (typeof label === 'object' && label !== null) {
    // 默认返回中文，可以根据需要调整
    return label.zh || label.en || Object.values(label)[0]
  }
  return label || option[props.valueKey]
}

const isSelected = (option) => {
  return getOptionValue(option) === props.modelValue
}

// 获取图标路径
const getIconPathValue = (option) => {
  if (!props.getIconPath || !option) return null
  // 获取选项的值（code）
  const value = getOptionValue(option)
  return props.getIconPath(value)
}

// 获取图标文本
const getIconTextValue = (option) => {
  if (!props.getIconText || !option) return null
  // 获取选项的值（code）
  const value = getOptionValue(option)
  return props.getIconText(value)
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  // 打开时清除延迟关闭定时器
  if (isOpen.value) {
    clearCloseTimer()
  }
}

const selectOption = (option) => {
  const value = getOptionValue(option)
  emit('update:modelValue', value)
  emit('change', value, option)
  isOpen.value = false
  clearCloseTimer()
}

// 延迟关闭定时器
let closeTimer = null

// 清除延迟关闭定时器
const clearCloseTimer = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

// 处理鼠标进入事件（H5端）- 取消延迟关闭
const handleMouseEnter = () => {
  // #ifdef H5
  clearCloseTimer()
  // #endif
}

// 处理鼠标离开事件（H5端）- 延迟关闭
const handleMouseLeave = () => {
  // #ifdef H5
  if (isOpen.value) {
    clearCloseTimer()
    // 延迟300毫秒关闭
    closeTimer = setTimeout(() => {
      if (isOpen.value) {
        isOpen.value = false
      }
      closeTimer = null
    }, 300)
  }
  // #endif
}

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  if (!isOpen.value) return
  
  // 在 uni-app 中，我们需要使用 nextTick 来确保 DOM 已更新
  nextTick(() => {
    // 检查点击是否在选择器外部
    // 由于 uni-app 的限制，我们使用事件冒泡的方式
    // 在模板中使用 @tap.stop 阻止事件冒泡
  })
}

// 监听全局点击事件
onMounted(() => {
  // 使用 uni-app 的方式监听页面点击
  // 由于 uni-app 的限制，我们在模板中使用 @tap.stop 来阻止事件冒泡
  // 父组件需要在遮罩层上处理点击关闭
})

onUnmounted(() => {
  // 清理延迟关闭定时器
  clearCloseTimer()
})

// 暴露方法供父组件调用
defineExpose({
  close: () => {
    isOpen.value = false
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.form-item {
  width: 100%;
  box-sizing: border-box;
  @include flex(column, flex-start, flex-start, 15rpx);
}

.form-label {
  @include text-style($font-size-base, $font-weight-medium, $color-text-tertiary);
  margin-left: 4rpx;
  margin-top: 30rpx;
  
  @include dark-mode {
    color: $color-dark-text-secondary;
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
  padding: 18rpx 32rpx;
  padding-right: 64rpx;
  background-color: #fff;
  border-radius: 28rpx;
  border: 1rpx solid #f0f3fa;
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
    color: #94a3b8;
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
  width: 100%; // 与选择器同宽
  box-sizing: border-box; // 确保宽度计算包含 padding 和 border
  background-color: #fff;
  border-radius: 30rpx;
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
</style>

