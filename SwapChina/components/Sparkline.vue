<template>
  <view class="sparkline-container" v-if="data && data.length >= 2">
    <!-- APP 端使用 image 标签配合 base64 SVG -->
    <!-- #ifdef APP-PLUS -->
    <image 
      v-if="imageSrc"
      :src="imageSrc" 
      :style="imageStyle"
      class="sparkline-image"
      mode="aspectFit"
    />
    <!-- #endif -->
    
    <!-- H5 端使用原生 SVG -->
    <!-- #ifndef APP-PLUS -->
    <svg 
      :width="width" 
      :height="height" 
      :viewBox="`0 0 ${width} ${height}`"
      class="sparkline-svg"
    >
      <path 
        :d="pathData" 
        fill="none" 
        :stroke="color" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
    </svg>
    <!-- #endif -->
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  color: {
    type: String,
    default: '#10b981' // 默认绿色
  },
  width: {
    type: Number,
    default: 100
  },
  height: {
    type: Number,
    default: 30
  }
})

// 计算路径数据
const pathData = computed(() => {
  if (!props.data || props.data.length < 2) return ''
  
  const min = Math.min(...props.data)
  const max = Math.max(...props.data)
  const range = max - min || 1
  
  // 计算每个点的坐标
  const points = props.data.map((val, i) => ({
    x: (i / (props.data.length - 1)) * props.width,
    y: props.height - ((val - min) / range) * props.height
  }))
  
  // 构建平滑曲线路径（使用贝塞尔曲线）
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const cpX = (p0.x + p1.x) / 2
    d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`
  }
  
  return d
})

// APP 端：生成 base64 编码的 SVG data URI
const imageSrc = computed(() => {
  // #ifdef APP-PLUS
  if (!props.data || props.data.length < 2) return ''
  
  const path = pathData.value
  if (!path) return ''
  
  // 构建完整的 SVG 内容
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${props.width}" height="${props.height}" viewBox="0 0 ${props.width} ${props.height}">
    <path d="${path}" fill="none" stroke="${props.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
  
  try {
    // 使用 btoa 进行 base64 编码
    if (typeof btoa !== 'undefined') {
      // 先进行 URI 编码，再 base64 编码
      const encoded = encodeURIComponent(svgContent)
      const base64 = btoa(unescape(encoded))
      return `data:image/svg+xml;base64,${base64}`
    }
  } catch (e) {
    console.error('Sparkline base64 encoding error:', e)
  }
  
  return ''
  // #endif
  
  // #ifndef APP-PLUS
  return ''
  // #endif
})

// APP 端：image 标签的样式
const imageStyle = computed(() => {
  // #ifdef APP-PLUS
  return {
    width: `${props.width}px`,
    height: `${props.height}px`
  }
  // #endif
  
  // #ifndef APP-PLUS
  return {}
  // #endif
})
</script>

<style scoped lang="scss">
.sparkline-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sparkline-svg {
  display: block;
}

.sparkline-image {
  display: block;
}
</style>

