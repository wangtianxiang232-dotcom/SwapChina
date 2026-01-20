<template>
  <view class="form-item">
    <text class="form-label">{{ label }}</text>
    <input 
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      :placeholder="placeholder"
      :type="type"
      :class="['form-input', { 'form-input-mono': mono, 'form-input-focused': isFocused }]"
      placeholder-style="color: #94a3b8; font-size: 30rpx; font-weight: 400;"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  mono: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isFocused = ref(false)

const handleInput = (e) => {
  emit('update:modelValue', e.detail.value)
}

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.form-item {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  @include flex(column, flex-start, flex-start, 0);
  min-width: 0;
}

.form-label {
  @include text-style(22rpx, $font-weight-medium, #64748b);
  margin-left: 4rpx;
  margin-top: 24rpx;
  margin-bottom: 8rpx;
  
  @include dark-mode {
    color: $color-dark-text-secondary;
  }
}

.form-input {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 16rpx 24rpx;
  background-color: #fff;
  border-radius: 20rpx;
  border: 1rpx solid #e2e8f0;
  @include text-style(30rpx, $font-weight-normal, #323436);
  transition: all 0.2s;
  min-height: 88rpx;
  height: 88rpx;
  line-height: 1.5;
  min-width: 0;
  
  &::placeholder {
    color: #94a3b8;
    font-size: 30rpx;
    font-weight: 400;
  }
  
  &.form-input-focused {
    outline: none;
    background-color: #fafafa;
    border-color: $color-input-border-focus;
    border-width: 2rpx;
  }
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    border-color: $color-dark-border-light;
    color: #fff;
    
    &::placeholder {
      color: #6b7280;
    }
    
    &:focus {
      background-color: rgba(255, 255, 255, 0.05);
      border-color: $color-dark-border;
    }
  }
  
  &.form-input-mono {
    font-family: monospace;
    letter-spacing: 0.1em;
    font-size: 28rpx;
  }
}
</style>

