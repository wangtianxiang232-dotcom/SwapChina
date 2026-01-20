<template>
  <IconWrapper 
    :class="className" 
    :style="mergedStyle" 
    :paths="iconData?.paths || []"
    :viewBox="iconData?.viewBox || '0 0 24 24'"
  >
    <!-- H5 端使用 SVG path，通过 v-for 循环渲染 -->
    <!-- #ifndef APP-PLUS -->
    <path 
      v-for="(path, index) in iconData?.paths || []" 
      :key="index" 
      v-bind="getPathAttrs(path)" 
    />
    <!-- #endif -->
  </IconWrapper>
</template>

<script setup>
import { computed } from 'vue'
import IconWrapper from './icons/IconWrapper.vue'
import { ICONS } from '@/utils/icons.js'

const props = defineProps({
  // 图标名称，对应 ICONS 对象中的 key
  name: {
    type: String,
    required: true
  },
  // 图标大小（数字，单位 rpx）
  size: {
    type: [Number, String],
    default: null
  },
  className: {
    type: String,
    default: ''
  },
  style: {
    type: Object,
    default: () => ({})
  }
})

// 根据名称获取图标数据
const iconData = computed(() => {
  return ICONS[props.name] || null
})

// 合并样式，将 size 转换为 fontSize
const mergedStyle = computed(() => {
  const style = { ...props.style }
  
  // 如果提供了 size prop，将其转换为 fontSize
  if (props.size !== null && props.size !== undefined) {
    // 如果 size 是数字，添加 rpx 单位；如果已经是字符串，直接使用
    const fontSize = typeof props.size === 'number' 
      ? `${props.size}rpx` 
      : props.size
    style.fontSize = fontSize
  }
  
  return style
})

// 处理 path 属性
// 如果 path 对象中有 fill 属性，保留它（用于多色图标如 CardDelete）
// 如果没有 fill 属性，移除 fill（如果存在），让它继承 SVG 的 fill="currentColor"
// 注意：如果用户通过 style.color 设置了颜色，会覆盖彩色图标的 fill
const getPathAttrs = (path) => {
  if (typeof path === 'string') {
    // 字符串形式，只返回 d 属性，不设置 fill（继承 SVG 的 fill="currentColor"）
    return { d: path }
  } else {
    // 对象形式，检查是否有 fill 属性
    if (path.fill) {
      // 有 fill 属性，说明是彩色图标
      // 如果用户通过 style.color 设置了颜色，覆盖 fill；否则保留原始 fill
      if (props.style?.color) {
        // 用户设置了颜色，覆盖 fill
        const { fill, ...otherAttrs } = path
        return otherAttrs // 移除 fill，让它继承 SVG 的 fill="currentColor"
      } else {
        // 用户没有设置颜色，保留原始 fill
        return path
      }
    } else {
      // 没有 fill 属性，说明是单色图标，移除 fill（如果存在），保留其他属性
      // 这样 path 会继承 SVG 的 fill="currentColor"，而 SVG 的 fill 会继承 style.color
      const { fill, ...otherAttrs } = path
      return otherAttrs
    }
  }
}
</script>

