<script setup lang="ts">
/**
 * 图片裁剪组件
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  imageSrc: string
  aspectRatio?: number
  maxWidth?: number
  maxHeight?: number
}

interface Emits {
  (e: 'crop', croppedImage: string): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: 1,
  maxWidth: 1024,
  maxHeight: 1024
})

const emit = defineEmits<Emits>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const imageElement = ref<HTMLImageElement | null>(null)

// 裁剪区域
const cropBox = ref({
  x: 0,
  y: 0,
  width: 100,
  height: 100
})

// 拖拽状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// 图片加载状态
const imageLoaded = ref(false)
const imageScale = ref(1)

// 计算图片尺寸
const imageWidth = computed(() => imageElement.value?.width ?? 0)
const imageHeight = computed(() => imageElement.value?.height ?? 0)

// 计算裁剪框样式
const cropBoxStyle = computed(() => ({
  left: `${cropBox.value.x}px`,
  top: `${cropBox.value.y}px`,
  width: `${cropBox.value.width}px`,
  height: `${cropBox.value.height}px`
}))

// 加载图片
onMounted(() => {
  const img = new Image()
  img.onload = () => {
    imageElement.value = img
    imageLoaded.value = true

    // 计算缩放比例
    const container = containerRef.value
    if (container) {
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      imageScale.value = Math.min(
        containerWidth / img.width,
        containerHeight / img.height
      )

      // 初始化裁剪框位置
      cropBox.value = {
        x: 0,
        y: 0,
        width: Math.min(img.width * imageScale.value, containerWidth),
        height: Math.min(img.width * imageScale.value / props.aspectRatio, containerHeight)
      }
    }
  }
  img.src = props.imageSrc
})

// 开始拖拽
function startDrag(event: MouseEvent | TouchEvent) {
  isDragging.value = true
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  dragStart.value = { x: clientX - cropBox.value.x, y: clientY - cropBox.value.y }
}

// 拖拽移动
function onDrag(event: MouseEvent | TouchEvent) {
  if (!isDragging.value) return

  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

  const container = containerRef.value
  if (!container) return

  const maxX = container.clientWidth - cropBox.value.width
  const maxY = container.clientHeight - cropBox.value.height

  cropBox.value.x = Math.max(0, Math.min(maxX, clientX - dragStart.value.x))
  cropBox.value.y = Math.max(0, Math.min(maxY, clientY - dragStart.value.y))
}

// 结束拖拽
function endDrag() {
  isDragging.value = false
}

// 执行裁剪
function applyCrop() {
  const canvas = canvasRef.value
  const img = imageElement.value
  if (!canvas || !img) return

  // 计算实际裁剪区域（考虑缩放）
  const scaleX = img.width / (img.width * imageScale.value)
  const scaleY = img.height / (img.height * imageScale.value)

  const actualX = cropBox.value.x * scaleX
  const actualY = cropBox.value.y * scaleY
  const actualWidth = cropBox.value.width * scaleX
  const actualHeight = cropBox.value.height * scaleY

  // 设置画布尺寸
  canvas.width = Math.min(actualWidth, props.maxWidth)
  canvas.height = Math.min(actualHeight, props.maxHeight)

  // 绘制裁剪区域
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(
      img,
      actualX,
      actualY,
      actualWidth,
      actualHeight,
      0,
      0,
      canvas.width,
      canvas.height
    )

    // 输出裁剪结果
    const croppedImage = canvas.toDataURL('image/jpeg', 0.9)
    emit('crop', croppedImage)
  }
}

// 取消裁剪
function cancelCrop() {
  emit('cancel')
}

// 清理
onUnmounted(() => {
  imageElement.value = null
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-song-bg-dark/90">
    <div class="card-song p-4 w-full max-w-lg">
      <h3 class="text-lg font-song text-song-text-primary mb-4 text-center">裁剪照片</h3>

      <!-- 图片容器 -->
      <div
        ref="containerRef"
        class="relative w-full h-64 bg-song-bg-medium rounded-lg overflow-hidden"
        @mousemove="onDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @touchmove="onDrag"
        @touchend="endDrag"
      >
        <!-- 图片 -->
        <img
          v-if="imageLoaded"
          :src="imageSrc"
          class="absolute max-w-full max-h-full object-contain"
          :style="{
            width: `${imageWidth * imageScale}px`,
            height: `${imageHeight * imageScale}px`
          }"
        />

        <!-- 裁剪框 -->
        <div
          v-if="imageLoaded"
          class="absolute border-2 border-song-accent cursor-move"
          :style="cropBoxStyle"
          @mousedown="startDrag"
          @touchstart="startDrag"
        >
          <!-- 四角指示器 -->
          <div class="absolute -top-1 -left-1 w-3 h-3 bg-song-accent rounded-full"></div>
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-song-accent rounded-full"></div>
          <div class="absolute -bottom-1 -left-1 w-3 h-3 bg-song-accent rounded-full"></div>
          <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-song-accent rounded-full"></div>
        </div>

        <!-- 加载提示 -->
        <div v-if="!imageLoaded" class="flex items-center justify-center h-full text-song-text-muted">
          加载中...
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3 mt-4">
        <button class="btn-song flex-1" @click="cancelCrop">
          取消
        </button>
        <button class="btn-song-accent flex-1" @click="applyCrop">
          确认裁剪
        </button>
      </div>

      <!-- 隐藏的画布 -->
      <canvas ref="canvasRef" class="hidden"></canvas>
    </div>
  </div>
</template>