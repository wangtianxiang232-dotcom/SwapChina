<template>
  <view class="kyc-container" :class="{'dark': theme === 'dark'}">
    <view class="header-placeholder" :style="{ height: headerTotalHeight + 'rpx' }"></view>
    <Header />
    
    <!-- 页面导航栏 -->
    <PageNav :title="t.kyc.title" />
    
    <scroll-view scroll-y class="scroll-content">
      <view class="content-wrapper">

        <!-- 步骤指示器 -->
        <view class="step-indicator">
          <view 
            v-for="(stepItem, index) in steps" 
            :key="index"
            class="step-item"
            :class="{ 'active': currentStep >= stepItem.step, 'completed': currentStep > stepItem.step }"
          >
            <view class="step-number">
              <text v-if="currentStep > stepItem.step" class="step-check">✓</text>
              <text v-else class="step-text">{{ stepItem.step }}</text>
            </view>
            <text class="step-label">{{ stepItem.label }}</text>
          </view>
        </view>

        <!-- 步骤1: 基础信息 -->
        <view v-if="currentStep === 1" class="step-content">
          <view class="step-header">
            <text class="step-title">{{ t.kyc.steps.step1 }}</text>
            <text class="step-subtitle">{{ t.kyc.fullNamePlaceholder }}</text>
          </view>

          <view class="form-section">
            <FormInput
              v-model="formData.fullName"
              :label="t.kyc.fullName"
              :placeholder="t.kyc.fullNamePlaceholder"
            />

            <FormSelect
              v-model="formData.idType"
              :label="t.kyc.idType"
              :options="idTypes"
              value-key="value"
              :get-display-text="(option) => option.label"
              :placeholder="t.kyc.idTypePlaceholder"
            />

            <FormInput
              v-model="formData.idNumber"
              :label="t.kyc.idNumber"
              :placeholder="t.kyc.idNumberPlaceholder"
            />
          </view>

          <view class="action-buttons">
            <button class="next-btn" :disabled="isSubmitting" @tap="handleNextStep">
              {{ t.kyc.continue }}
            </button>
          </view>
        </view>

        <!-- 步骤2: 上传证件 -->
        <view v-if="currentStep === 2" class="step-content">
          <view class="step-header">
            <text class="step-title">{{ t.kyc.steps.step2 }}</text>
            <text class="step-subtitle">请上传清晰的证件照片</text>
          </view>

          <view class="upload-section">
            <view class="upload-item">
              <text class="upload-label">{{ t.kyc.uploadFront }}</text>
              <view class="upload-area" @tap="handleUploadFront" :class="{ 'uploading': isUploading.front }">
                <image 
                  v-if="formData.frontImage" 
                  :src="formData.frontImage" 
                  class="uploaded-image" 
                  mode="aspectFit"
                />
                <view v-else class="upload-placeholder">
                  <Icon name="Camera" :size="64" :style="{ color: isUploading.front ? '#94a3b8' : '#94a3b8' }" />
                  <text class="upload-text">{{ isUploading.front ? t.kyc.submitting : t.kyc.uploadText }}</text>
                </view>
              </view>
            </view>

            <view class="upload-item">
              <text class="upload-label">{{ t.kyc.uploadBack }}</text>
              <view class="upload-area" @tap="handleUploadBack" :class="{ 'uploading': isUploading.back }">
                <image 
                  v-if="formData.backImage" 
                  :src="formData.backImage" 
                  class="uploaded-image" 
                  mode="aspectFit"
                />
                <view v-else class="upload-placeholder">
                  <Icon name="Camera" :size="64" :style="{ color: isUploading.back ? '#94a3b8' : '#94a3b8' }" />
                  <text class="upload-text">{{ isUploading.back ? t.kyc.submitting : t.kyc.uploadText }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="action-buttons">
            <button class="prev-btn" :disabled="isSubmitting" @tap="handlePrevStep">
              {{ t.kyc.prevStep }}
            </button>
            <button class="next-btn" :disabled="isSubmitting || isUploading.front || isUploading.back" @tap="handleNextStep">
              {{ isSubmitting ? t.kyc.submitting : t.kyc.nextStep }}
            </button>
          </view>
        </view>

        <!-- 步骤3: 完成提交 -->
        <view v-if="currentStep === 3" class="step-content">
          <view class="success-section">
            <view class="success-icon-wrapper">
              <Icon name="CheckCircle" :size="160" :style="{ color: '#10b981' }" />
            </view>
            <text class="success-title">{{ t.kyc.successTitle }}</text>
            <text class="success-message">{{ t.kyc.successMessage }}</text>
          </view>

          <view class="action-buttons">
            <button class="finish-btn" @tap="handleFinish">
              {{ t.kyc.finish }}
            </button>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Toast 提示 -->
    <Toast 
      v-if="toastMessage" 
      :message="toastMessage" 
      :type="toastType" 
      :duration="2000"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHeaderHeight } from '@/composables/useHeaderHeight.js'
import Header from '@/components/Header.vue'
import PageNav from '@/components/PageNav.vue'
import Icon from '@/components/Icon.vue'
import FormInput from '@/components/FormInput.vue'
import FormSelect from '@/components/FormSelect.vue'
import Toast from '@/components/Toast.vue'
import { TRANSLATIONS, getIdTypes } from '@/utils/constants.js'
import { uploadImage, submitKYC } from '@/api/index.js'
import store from '@/store/index.js'

const theme = ref(uni.getStorageSync('theme') || 'light')
const lang = ref(uni.getStorageSync('lang') || 'zh')
const { headerTotalHeight } = useHeaderHeight()
const currentStep = ref(1)
const isSubmitting = ref(false)
const isUploading = ref({ front: false, back: false })

// Toast 状态
const toastMessage = ref('')
const toastType = ref('none')
let toastTimer = null

const t = computed(() => TRANSLATIONS[lang.value] || TRANSLATIONS.zh)

// 自定义 Toast 显示函数
const showToast = (msg, type = 'none') => {
  toastMessage.value = msg
  toastType.value = type
  
  // 清除之前的定时器
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
  
  // 2秒后隐藏
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
    toastType.value = 'none'
  }, 2000)
}

const steps = computed(() => [
  { step: 1, label: t.value.kyc.steps.step1 },
  { step: 2, label: t.value.kyc.steps.step2 },
  { step: 3, label: t.value.kyc.steps.step3 }
])

const idTypes = computed(() => getIdTypes(lang.value))

const formData = ref({
  fullName: '',
  idType: '',
  idNumber: '',
  frontImage: '',
  backImage: '',
  frontImageUrl: '', // 上传后的URL
  backImageUrl: ''  // 上传后的URL
})

// 验证身份证号码格式
const validateIdNumber = (idType, idNumber) => {
  if (!idNumber) return false
  
  if (idType === 'ID_CARD') {
    // 中国身份证：18位，最后一位可能是X
    const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
    return idCardRegex.test(idNumber)
  } else if (idType === 'PASSPORT') {
    // 护照：至少6位，包含字母和数字
    const passportRegex = /^[A-Za-z0-9]{6,}$/
    return passportRegex.test(idNumber)
  } else if (idType === 'DRIVER_LICENSE') {
    // 驾驶证：至少8位
    return idNumber.length >= 8
  }
  
  return true // 其他类型暂不验证
}

const handleNextStep = async () => {
  if (currentStep.value === 1) {
    // 验证步骤1
    if (!formData.value.fullName.trim()) {
      showToast(t.value.kyc.validateFullName, 'error')
      return
    }
    if (!formData.value.idType) {
      showToast(t.value.kyc.validateIdType, 'error')
      return
    }
    if (!formData.value.idNumber.trim()) {
      showToast(t.value.kyc.validateIdNumber, 'error')
      return
    }
    // 验证证件号码格式
    if (!validateIdNumber(formData.value.idType, formData.value.idNumber)) {
      showToast(t.value.kyc.validateIdNumberFormat, 'error')
      return
    }
  } else if (currentStep.value === 2) {
    // 验证步骤2
    if (!formData.value.frontImage) {
      showToast(t.value.kyc.validateFrontImage, 'error')
      return
    }
    if (!formData.value.backImage) {
      showToast(t.value.kyc.validateBackImage, 'error')
      return
    }
    
    // 如果图片还未上传，先上传图片
    if (!formData.value.frontImageUrl || !formData.value.backImageUrl) {
      isSubmitting.value = true
      try {
        // 上传正面照片
        if (!formData.value.frontImageUrl) {
          isUploading.value.front = true
          formData.value.frontImageUrl = await uploadImage(formData.value.frontImage)
          isUploading.value.front = false
        }
        
        // 上传背面照片
        if (!formData.value.backImageUrl) {
          isUploading.value.back = true
          formData.value.backImageUrl = await uploadImage(formData.value.backImage)
          isUploading.value.back = false
        }
        
        showToast(t.value.kyc.uploadSuccess, 'success')
      } catch (error) {
        console.error('图片上传失败:', error)
        showToast(t.value.kyc.uploadFailed, 'error')
        isUploading.value.front = false
        isUploading.value.back = false
        isSubmitting.value = false
        return
      }
    }
    
    // 提交认证信息
    isSubmitting.value = true
    try {
      await submitKYC({
        fullName: formData.value.fullName.trim(),
        idType: formData.value.idType,
        idNumber: formData.value.idNumber.trim(),
        frontImageUrl: formData.value.frontImageUrl,
        backImageUrl: formData.value.backImageUrl
      })
      
      showToast(t.value.kyc.submitSuccess, 'success')
      currentStep.value = 3
    } catch (error) {
      console.error('提交认证失败:', error)
      showToast(t.value.kyc.submitFailed, 'error')
    } finally {
      isSubmitting.value = false
    }
    return
  }
  
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const handlePrevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleUploadFront = () => {
  if (isUploading.value.front) return
  
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res) => {
      formData.value.frontImage = res.tempFilePaths[0]
      formData.value.frontImageUrl = '' // 重置URL，需要重新上传
      
      // 自动上传图片
      try {
        isUploading.value.front = true
        formData.value.frontImageUrl = await uploadImage(res.tempFilePaths[0])
        showToast(t.value.kyc.uploadSuccess, 'success')
      } catch (error) {
        console.error('图片上传失败:', error)
        showToast(t.value.kyc.uploadFailed, 'error')
      } finally {
        isUploading.value.front = false
      }
    },
    fail: (err) => {
      console.error('选择图片失败:', err)
      showToast('选择图片失败', 'error')
    }
  })
}

const handleUploadBack = () => {
  if (isUploading.value.back) return
  
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res) => {
      formData.value.backImage = res.tempFilePaths[0]
      formData.value.backImageUrl = '' // 重置URL，需要重新上传
      
      // 自动上传图片
      try {
        isUploading.value.back = true
        formData.value.backImageUrl = await uploadImage(res.tempFilePaths[0])
        showToast(t.value.kyc.uploadSuccess, 'success')
      } catch (error) {
        console.error('图片上传失败:', error)
        showToast(t.value.kyc.uploadFailed, 'error')
      } finally {
        isUploading.value.back = false
      }
    },
    fail: (err) => {
      console.error('选择图片失败:', err)
      showToast('选择图片失败', 'error')
    }
  })
}

const handleFinish = () => {
  // 提交认证信息
  store.showToast('认证信息已提交', 'success')
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

onMounted(() => {
  theme.value = store.theme || 'light'
})
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';
@import '@/styles/mixins.scss';

.kyc-container {
  min-height: 100vh;
  width: 100%;
  max-width: 896rpx;
  margin-left: auto;
  margin-right: auto;
  background-color: $color-bg-primary;
  box-shadow: $shadow-2xl;
  position: relative;
  overflow-x: hidden;
  overflow-y: visible;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;
  
  > *:not(.bottom-nav-wrapper) {
    max-width: 100%;
    box-sizing: border-box;
  }
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
  }
}

.header-placeholder {
  width: 100%;
  flex-shrink: 0;
}

.scroll-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 200rpx;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.content-wrapper {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 48rpx;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}


.step-indicator {
  @include flex(row, space-between, center);
  padding: 0 16rpx;
  margin-bottom: 32rpx;
}

.step-item {
  @include flex(column, center, center, 16rpx);
  flex: 1;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 40rpx;
    left: calc(50% + 40rpx);
    width: calc(100% - 80rpx);
    height: 4rpx;
    background-color: $color-bg-tertiary;
    z-index: 0;
    
    @include dark-mode {
      background-color: $color-dark-bg-secondary;
    }
  }
  
  &.active:not(:last-child)::after,
  &.completed:not(:last-child)::after {
    background-color: $color-primary;
  }
}

.step-number {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 4rpx solid $color-bg-tertiary;
  background-color: #fff;
  @include flex(row, center, center);
  position: relative;
  z-index: 1;
  transition: all 0.3s;
  
  @include dark-mode {
    background-color: $color-dark-bg-primary;
    border-color: $color-dark-bg-secondary;
  }
  
  .step-item.active &,
  .step-item.completed & {
    background-color: $color-primary;
    border-color: $color-primary;
    box-shadow: 0 4rpx 16rpx rgba(37, 99, 235, 0.3);
  }
}

.step-text {
  @include text-style(32rpx, $font-weight-bold, $color-text-tertiary);
  
  .step-item.active &,
  .step-item.completed & {
    color: #fff;
  }
}

.step-check {
  @include text-style(40rpx, $font-weight-black, #fff);
}

.step-label {
  @include text-style(20rpx, $font-weight-bold, $color-text-tertiary);
  text-align: center;
  
  .step-item.active &,
  .step-item.completed & {
    color: $color-primary;
  }
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
    
    .step-item.active &,
    .step-item.completed & {
      color: $color-primary;
    }
  }
}

.step-content {
  @include flex(column, flex-start, flex-start, 48rpx);
  animation: fadeIn 0.3s ease;
}

.step-header {
  @include flex(column, flex-start, flex-start, 16rpx);
}

.step-title {
  @include text-style(40rpx, $font-weight-black, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
}

.step-subtitle {
  @include text-style(24rpx, $font-weight-normal, $color-text-secondary);
  
  @include dark-mode {
    color: $color-dark-text-secondary;
  }
}

.form-section {
  @include flex(column, flex-start, flex-start, 32rpx);
  width: 100%;
}

.upload-section {
  @include flex(column, flex-start, flex-start, 32rpx);
  width: 100%;
}

.upload-item {
  @include flex(column, flex-start, flex-start, 16rpx);
  width: 100%;
}

.upload-label {
  @include text-style(20rpx, $font-weight-bold, $color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  
  @include dark-mode {
    color: $color-dark-text-tertiary;
  }
}

.upload-area {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 32rpx;
  border: 2rpx dashed rgba(148, 163, 184, 0.4);
  background-color: rgba(241, 245, 249, 0.5);
  @include flex(row, center, center);
  overflow: hidden;
  position: relative;
  transition: all 0.2s;
  
  @include dark-mode {
    background-color: rgba(30, 41, 59, 0.5);
    border-color: rgba(51, 65, 85, 0.6);
  }
  
  &:active:not(.uploading) {
    transform: scale(0.98);
    opacity: 0.8;
  }
  
  &.uploading {
    opacity: 0.6;
    pointer-events: none;
  }
}

.upload-placeholder {
  @include flex(column, center, center, 24rpx);
}

.upload-text {
  @include text-style(20rpx, $font-weight-bold, rgba(148, 163, 184, 0.7));
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.success-section {
  @include flex(column, center, center, 32rpx);
  width: 100%;
  padding: 64rpx 0;
  text-align: center;
}

.success-icon-wrapper {
  width: 320rpx;
  height: 320rpx;
  border-radius: 50%;
  background-color: rgba(16, 185, 129, 0.1);
  @include flex(row, center, center);
  margin-bottom: 32rpx;
  
  @include dark-mode {
    background-color: rgba(16, 185, 129, 0.2);
  }
}

.success-title {
  @include text-style(40rpx, $font-weight-black, $color-text-primary);
  
  @include dark-mode {
    color: #fff;
  }
}

.success-message {
  @include text-style(24rpx, $font-weight-normal, $color-text-secondary);
  line-height: 1.6;
  padding: 0 32rpx;
  
  @include dark-mode {
    color: $color-dark-text-secondary;
  }
}

.action-buttons {
  width: 100%;
  @include flex(row, space-between, center, 24rpx);
  margin-top: 32rpx;
}

.prev-btn,
.next-btn,
.finish-btn {
  flex: 1;
  padding: 40rpx 0;
  border-radius: 48rpx;
  @include text-style(28rpx, $font-weight-bold, #fff);
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  transition: all 0.2s;
  
  &::after {
    border: none;
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.prev-btn {
  background-color: $color-bg-tertiary;
  color: $color-text-primary;
  
  @include dark-mode {
    background-color: $color-dark-bg-secondary;
    color: #fff;
  }
}

.next-btn,
.finish-btn {
  background-color: $color-primary;
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.3);
  
  &:active {
    background-color: #1d4ed8;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
