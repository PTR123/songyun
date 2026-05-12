<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SONG_STYLES } from '@/modules/style-selection/constants/song-styles'
import { createTask, getTaskStatus } from '@/shared/utils/apiClient'
import { compressImage, validateImage, fileToBase64 } from '@/modules/upload/utils/imageValidator'
import type { SongStyle, TaskStatus } from '@/types'

// 步骤状态
const currentStep = ref<'upload' | 'select' | 'generate' | 'result'>('upload')

// 用户数据
const uploadedImage = ref<string | null>(null)
const selectedStyle = ref<SongStyle | null>(null)
const taskId = ref<string | null>(null)
const taskStatus = ref<TaskStatus>('pending')
const queuePosition = ref<number>(0)
const resultImage = ref<string | null>(null)
const showConsentDialog = ref<boolean>(false)
const consentToDisplay = ref<boolean>(false)

// 上传状态
const isUploading = ref<boolean>(false)
const uploadProgress = ref<number>(0)
const uploadError = ref<string | null>(null)

// 生成状态
const isGenerating = ref<boolean>(false)
const generateError = ref<string | null>(null)

// 处理图片上传
async function handleImageUpload(file: File | undefined) {
  if (!file) return

  uploadError.value = null

  // 验证文件
  const validation = validateImage(file)
  if (!validation.valid) {
    uploadError.value = validation.error ?? '文件验证失败'
    return
  }

  isUploading.value = true
  uploadProgress.value = 0

  try {
    // 压缩图片
    const compressedFile = await compressImage(file)

    // 转换为 Base64 预览
    uploadedImage.value = await fileToBase64(compressedFile)

    uploadProgress.value = 100
    currentStep.value = 'select'
  } catch (error) {
    uploadError.value = (error as Error).message
  } finally {
    isUploading.value = false
  }
}

// 选择风格
function selectStyle(style: SongStyle) {
  selectedStyle.value = style
}

// 开始生成
async function startGeneration() {
  if (!selectedStyle.value) return

  currentStep.value = 'generate'
  isGenerating.value = true
  generateError.value = null
  taskStatus.value = 'pending'

  try {
    // 创建生成任务
    const response = await createTask(selectedStyle.value.id)
    taskId.value = response.taskId

    // 开始轮询任务状态
    await pollTaskStatus(response.taskId)
  } catch (error) {
    generateError.value = (error as Error).message
    taskStatus.value = 'failed'
  } finally {
    isGenerating.value = false
  }
}

// 轮询任务状态
async function pollTaskStatus(taskId: string) {
  const maxPolls = 40 // 最多轮询 40 次（约 2 分钟）
  const pollInterval = 3000 // 3 秒间隔

  for (let i = 0; i < maxPolls; i++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval))

    const status = await getTaskStatus(taskId)

    taskStatus.value = status.status as TaskStatus

    if (status.status === 'SUCCEEDED') {
      resultImage.value = status.resultImageUrl ?? null
      currentStep.value = 'result'
      showConsentDialog.value = true
      return
    }

    if (status.status === 'FAILED') {
      generateError.value = status.message ?? '生成失败'
      return
    }
  }

  generateError.value = '生成超时，请稍后重试'
}

// 返回上传步骤
function goToUpload() {
  currentStep.value = 'upload'
  uploadedImage.value = null
  selectedStyle.value = null
  taskId.value = null
  taskStatus.value = 'pending'
  resultImage.value = null
  uploadError.value = null
  generateError.value = null
}

// 用户同意展示
function handleConsent(consent: boolean) {
  consentToDisplay.value = consent
  showConsentDialog.value = false

  // TODO: 调用 API 更新授权状态
}

// 下载图片
async function downloadImage() {
  if (!resultImage.value) return

  try {
    const response = await fetch(resultImage.value)
    const blob = await response.blob()

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `宋韵照片-${selectedStyle.value?.name || '生成'}-${Date.now()}.jpg`
    link.click()

    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('下载失败:', error)
  }
}

// 计算属性
const canStartGeneration = computed(() => {
  return uploadedImage.value && selectedStyle.value
})

const statusText = computed(() => {
  switch (taskStatus.value) {
    case 'pending':
      return '任务排队中...'
    case 'RUNNING':
      return '正在生成宋韵照片...'
    case 'SUCCEEDED':
      return '生成完成'
    case 'FAILED':
      return '生成失败'
    default:
      return '处理中'
  }
})

// 监听步骤变化
watch(currentStep, (step) => {
  console.log('当前步骤:', step)
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-8">
    <!-- 标题 -->
    <header class="text-center mb-8 animate-fade-in">
      <h1 class="text-2xl md:text-3xl font-song text-gradient-song text-shadow-song mb-2">
        宋韵美学体验
      </h1>
      <p class="text-song-text-secondary text-sm md:text-base">
        感受传统美学的现代转化
      </p>
    </header>

    <!-- 主内容区 -->
    <main class="w-full max-w-md animate-slide-up">
      <!-- 步骤指示器 -->
      <div class="flex justify-center gap-2 mb-6">
        <div
          :class="[
            'px-3 py-1 rounded-full text-xs font-song transition-all duration-300',
            currentStep === 'upload' ? 'bg-song-accent text-song-text-primary' : 'bg-song-bg-medium text-song-text-muted'
          ]"
        >
          上传
        </div>
        <div
          :class="[
            'px-3 py-1 rounded-full text-xs font-song transition-all duration-300',
            currentStep === 'select' ? 'bg-song-accent text-song-text-primary' : 'bg-song-bg-medium text-song-text-muted'
          ]"
        >
          选风格
        </div>
        <div
          :class="[
            'px-3 py-1 rounded-full text-xs font-song transition-all duration-300',
            currentStep === 'generate' ? 'bg-song-accent text-song-text-primary' : 'bg-song-bg-medium text-song-text-muted'
          ]"
        >
          生成
        </div>
        <div
          :class="[
            'px-3 py-1 rounded-full text-xs font-song transition-all duration-300',
            currentStep === 'result' ? 'bg-song-accent text-song-text-primary' : 'bg-song-bg-medium text-song-text-muted'
          ]"
        >
          完成
        </div>
      </div>

      <!-- 上传步骤 -->
      <div v-if="currentStep === 'upload'">
        <!-- 错误提示 -->
        <div v-if="uploadError" class="mb-4 p-3 rounded-lg bg-song-accent/20 text-song-accent text-sm">
          {{ uploadError }}
        </div>

        <label
          class="upload-area cursor-pointer block"
          @dragover.prevent
          @dragenter.prevent
          @drop.prevent="(e: DragEvent) => handleImageUpload(e.dataTransfer?.files?.[0])"
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="(e: Event) => handleImageUpload((e.target as HTMLInputElement)?.files?.[0])"
          />

          <div v-if="!isUploading" class="text-song-text-secondary">
            <p class="text-lg mb-2">上传你的校园照片</p>
            <p class="text-sm">点击或拖拽上传</p>
            <p class="text-xs mt-2 text-song-text-muted">支持 JPG、PNG、WEBP，最大 10MB</p>
          </div>

          <div v-else class="text-song-text-secondary">
            <p class="text-lg mb-2">正在处理...</p>
            <div class="progress-bar w-32 mx-auto mt-2">
              <div class="progress-bar-fill" :style="{ width: `${uploadProgress}%` }"></div>
            </div>
          </div>
        </label>
      </div>

      <!-- 选择风格步骤 -->
      <div v-if="currentStep === 'select'" class="card-song p-6">
        <!-- 上传的图片预览 -->
        <div v-if="uploadedImage" class="mb-4">
          <img
            :src="uploadedImage"
            alt="已上传照片"
            class="w-full h-48 object-cover rounded-lg"
          />
        </div>

        <!-- 风格选择 -->
        <h2 class="text-lg font-song text-song-text-primary mb-4">选择风格</h2>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="style in SONG_STYLES"
            :key="style.id"
            :class="[
              'style-card overflow-hidden',
              selectedStyle?.id === style.id ? 'selected' : ''
            ]"
            @click="selectStyle(style)"
          >
            <img
              :src="style.thumbnail"
              :alt="style.name"
              class="w-full h-full object-cover opacity-60"
            />
            <div class="absolute inset-0 flex flex-col items-center justify-center p-2 bg-song-bg-dark/50">
              <p class="text-song-text-primary text-sm font-song">{{ style.name }}</p>
              <p class="text-song-text-muted text-xs mt-1 text-center">{{ style.description.slice(0, 8) }}...</p>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3 mt-6">
          <button class="btn-song flex-1" @click="goToUpload">
            重新上传
          </button>
          <button
            :class="[
              'btn-song-accent flex-1',
              !canStartGeneration ? 'opacity-50 cursor-not-allowed' : ''
            ]"
            :disabled="!canStartGeneration"
            @click="startGeneration"
          >
            开始生成
          </button>
        </div>
      </div>

      <!-- 生成步骤 -->
      <div v-if="currentStep === 'generate'" class="card-song p-6 text-center">
        <!-- 错误提示 -->
        <div v-if="generateError" class="mb-4 p-3 rounded-lg bg-song-accent/20 text-song-accent text-sm">
          {{ generateError }}
        </div>

        <div v-if="isGenerating">
          <p class="text-lg font-song text-song-text-primary mb-2">
            {{ statusText }}
          </p>
          <p v-if="queuePosition > 0" class="text-sm text-song-text-secondary mb-4">
            排队位置: {{ queuePosition }}
          </p>
          <div class="progress-bar w-full">
            <div class="progress-bar-fill" style="width: 60%"></div>
          </div>
          <p class="text-xs text-song-text-muted mt-4">
            预计等待约 30 秒
          </p>
        </div>

        <!-- 失败时显示重试按钮 -->
        <div v-if="taskStatus === 'failed'" class="mt-4">
          <button class="btn-song-accent" @click="startGeneration">
            重试
          </button>
        </div>
      </div>

      <!-- 结果步骤 -->
      <div v-if="currentStep === 'result'" class="card-song p-6">
        <!-- 授权弹窗 -->
        <div v-if="showConsentDialog" class="mb-4 p-4 rounded-lg bg-song-bg-medium">
          <p class="text-song-text-primary text-sm mb-3">
            是否允许在大屏幕展示你的宋韵照片？
          </p>
          <div class="flex gap-3">
            <button class="btn-song flex-1 text-sm" @click="handleConsent(false)">
              仅保存到本地
            </button>
            <button class="btn-song-accent flex-1 text-sm" @click="handleConsent(true)">
              同意展示
            </button>
          </div>
        </div>

        <!-- 结果图片 -->
        <div v-if="resultImage" class="mb-4">
          <img
            :src="resultImage"
            alt="生成结果"
            class="w-full rounded-lg"
          />
          <p class="text-center text-song-text-muted text-xs mt-2">
            {{ selectedStyle?.name }} - 宋韵风格
          </p>
        </div>

        <div class="flex gap-3">
          <button class="btn-song flex-1" @click="goToUpload">
            重新生成
          </button>
          <button class="btn-song-accent flex-1" @click="downloadImage">
            下载到本地
          </button>
        </div>
      </div>
    </main>

    <!-- 底部说明 -->
    <footer class="text-center text-song-text-muted text-xs mt-8">
      <p>照片仅用于本次生成，不会保存或分享</p>
    </footer>
  </div>
</template>