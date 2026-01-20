<template>
  <!-- APP 端使用 base64 编码的 SVG data URI，H5 端使用原生 SVG -->
  <!-- #ifdef APP-PLUS -->
  <image 
    v-if="iconSrc"
    :src="iconSrc" 
    :class="className" 
    :style="iconStyle"
    mode="aspectFit"
  />
  <!-- #endif -->
  
  <!-- #ifndef APP-PLUS -->
  <svg fill="currentColor" :viewBox="viewBox" :class="className" :style="svgStyle">
    <slot></slot>
  </svg>
  <!-- #endif -->
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  className: {
    type: String,
    default: ''
  },
  style: {
    type: Object,
    default: () => ({})
  },
  // APP 端使用的 base64 SVG data URI（可选，如果不提供则从 paths 生成）
  src: {
    type: String,
    default: ''
  },
  // SVG 路径数组（用于自动生成 base64）
  paths: {
    type: Array,
    default: () => []
  },
  // SVG viewBox
  viewBox: {
    type: String,
    default: '0 0 24 24'
  }
})

// APP 端使用的图标源
const iconSrc = computed(() => {
  // 如果提供了 src，直接使用
  if (props.src) {
    return props.src
  }
  
  // 如果提供了 paths，自动生成 base64
  // #ifdef APP-PLUS
  if (props.paths && props.paths.length > 0) {
    // 检查是否有彩色图标（path 中有 fill 属性，且用户没有设置 style.color 来覆盖）
    const hasColoredPaths = props.paths.some(path => 
      typeof path === 'object' && path.fill && !props.style?.color
    )
    
    // 获取用户设置的颜色，如果没有则使用默认灰色
    const userColor = props.style?.color
    
    // 处理 paths：可能是字符串数组或对象数组
    // 如果 path 对象中有 fill 属性，保留它（用于多色图标如 CardDelete）
    // 如果没有 fill 属性，移除 fill（如果存在），让它继承 SVG 的 fill
    // 如果用户通过 style.color 设置了颜色，覆盖彩色图标的 fill
    const pathsHtml = props.paths.map(path => {
      if (typeof path === 'string') {
        return `<path d="${path}"/>`
      } else {
        // 对象形式，检查是否有 fill 属性
        if (path.fill) {
          // 有 fill 属性，说明是彩色图标
          // 如果用户通过 style.color 设置了颜色，覆盖 fill；否则保留原始 fill
          if (userColor) {
            // 用户设置了颜色，移除 fill，让它继承 SVG 的 fill
            const { fill, ...otherAttrs } = path
            const attrs = Object.entries(otherAttrs)
              .map(([key, value]) => `${key}="${value}"`)
              .join(' ')
            return `<path ${attrs}/>`
          } else {
            // 用户没有设置颜色，保留原始 fill
            const attrs = Object.entries(path)
              .map(([key, value]) => `${key}="${value}"`)
              .join(' ')
            return `<path ${attrs}/>`
          }
        } else {
          // 没有 fill 属性，说明是单色图标，移除 fill（如果存在），保留其他属性
          const { fill, ...otherAttrs } = path
          const attrs = Object.entries(otherAttrs)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ')
          return `<path ${attrs}/>`
        }
      }
    }).join('')
    
    // 确定 SVG 的 fill 颜色
    // 对于单色图标或用户覆盖了颜色的彩色图标：使用用户颜色或默认灰色
    // 对于彩色图标（用户未覆盖）：SVG 的 fill 设置为 none，让 path 的 fill 生效
    let svgFill = '#64748b' // 默认灰色
    if (userColor) {
      // 用户设置了颜色，使用用户颜色
      svgFill = userColor
    } else if (hasColoredPaths) {
      // 彩色图标且用户没有设置颜色，SVG fill 设置为 none
      svgFill = 'none'
    }
    
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${props.viewBox}" fill="${svgFill}">${pathsHtml}</svg>`
    
    try {
      if (typeof btoa !== 'undefined') {
        return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`
      }
    } catch (e) {
      console.error('Base64 encoding error:', e)
    }
  }
  // #endif
  
  return ''
})

// APP 端的样式
const iconStyle = computed(() => {
  const baseStyle = { ...props.style }
  // 确保大小正确应用
  if (props.style?.fontSize) {
    baseStyle.width = props.style.fontSize
    baseStyle.height = props.style.fontSize
  } else if (props.style?.width) {
    baseStyle.width = props.style.width
    baseStyle.height = props.style.height || props.style.width
  }
  return baseStyle
})

// H5 端的 SVG 样式（需要将 fontSize 转换为 width 和 height，保留 color）
const svgStyle = computed(() => {
  const baseStyle = { ...props.style }
  // 确保大小正确应用：将 fontSize 转换为 width 和 height
  if (props.style?.fontSize) {
    baseStyle.width = props.style.fontSize
    baseStyle.height = props.style.fontSize
    // 移除 fontSize，因为 SVG 不支持这个属性
    delete baseStyle.fontSize
  } else if (props.style?.width) {
    baseStyle.width = props.style.width
    baseStyle.height = props.style.height || props.style.width
  }
  // 保留 color，因为 SVG 使用 fill="currentColor"，会继承 CSS 的 color 属性
  // 如果用户传入了 color，使用它；否则使用 currentColor（继承父元素颜色）
  // 注意：不要覆盖用户传入的 color
  return baseStyle
})
</script>

