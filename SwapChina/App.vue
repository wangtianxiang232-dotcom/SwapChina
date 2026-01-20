<template>
	<Toast :message="toastState.message" :type="toastState.type" :duration="toastState.duration" />
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import Toast from '@/components/Toast.vue'
import { initToastState } from '@/utils/toast'

// 全局 Toast 状态
const toastState = reactive({
	message: '',
	type: 'none',
	duration: 2000
})

// 初始化 Toast 状态，供工具函数使用
onMounted(() => {
	initToastState(toastState)
})

onLaunch(() => {
	console.log('App Launch')
})

onShow(() => {
	console.log('App Show')
})

onHide(() => {
	console.log('App Hide')
})
</script>

<style lang="scss">
@import '@/styles/tokens.scss';

/*每个页面公共css */
page {
	background-color: $color-bg-page-light; // #f8fafc - 浅灰色背景
}

/* 全局button样式重置 - 消除默认样式干扰 */
button {
	margin: 0;
	padding: 0;
	border: none;
	outline: none;
	background: none;
	-webkit-appearance: none;
	appearance: none;
	font-family: inherit;
	font-size: inherit;
	line-height: inherit;
	color: inherit;
	box-sizing: border-box;
	text-align: inherit;
	cursor: pointer;
	
	&::after {
		border: none !important;
		display: none !important;
		content: none !important;
	}
	
	&::before {
		border: none !important;
		display: none !important;
		content: none !important;
	}
}
</style>
