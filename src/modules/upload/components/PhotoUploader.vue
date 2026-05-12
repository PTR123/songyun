<script setup lang="ts">
/**
 * 照片上传组件
 */

import { ref } from 'vue'
import { compressImage, validateImage, fileToBase64 } from '../utils/imageValidator'

interface Emits {
  (e: 'upload', imageData: { base64: string; file: File }): void
  (e: 'error', message: string): void
}

const emit = defineEmits<Emits>()

const isUploading = ref(false)
const uploadProgress = ref(0)
const isDragging = ref(false)

// 处理文件选择
async function handleFile(file: File) {
  // 验证文件
  const validation = validateImage(file)
  if (!validation.valid) {
    emit('error', validation.error ?? '文件验证失败')
    return
  }

  isUploading.value = true
  uploadProgress.value = 0

  try {
    // 模拟进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 100)

    // 压缩图片
    const compressedFile = await compressImage(file)

    // 转换为 Base64
    const base64 = await fileToBase64(compressedFile)

    clearInterval(progressInterval)
    uploadProgress.value = 100

    emit('upload', { base64, file: compressedFile })
  } catch (error) {
    emit('error', (error as Error).message)
  } finally {
    isUploading.value = false
  }
}

// 点击上传
function handleClick(event: MouseEvent) {
  const input = (event.currentTarget as HTMLElement).querySelector('input')
  input?.click()
}

// 文件选择
function handleInputChange(event: Event) {
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (file) {
    handleFile(file)
  }
}

// 拖拽上传
function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    handleFile(file)
  }
}

function handleDragEnter() {
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}
</script>

<template>
  <div class="photo-uploader">
    <label
      :class="[
        'upload-area cursor-pointer',
        isDragging ? 'dragging' : ''
      ]"
      @click="handleClick"
      @dragover.prevent
      @dragenter.prevent="handleDragEnter"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="handleInputChange"
      />

      <!-- 上传提示 -->
      <div v-if="!isUploading" class="text-song-text-secondary">
        <p class="text-lg mb-2">上传你的校园照片</p>
        <p class="text-sm">点击或拖拽上传</p>
        <p class="text-xs mt-2 text-song-text-muted">支持 JPG、PNG、WEBP，最大 10MB</p>
      </div>

      <!-- 上传进度 -->
      <div v-else class="text-song-text-secondary">
        <p class="text-lg mb-2">正在处理...</p>
        <div class="progress-bar w-32 mx-auto mt-2">
          <div class="progress-bar-fill" :style="{ width: `${uploadProgress}%` }"></div>
        </div>
      </div>
    </label>
  </div>
</template>