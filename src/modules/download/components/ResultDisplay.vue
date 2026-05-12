<script setup lang="ts">
/**
 * 结果展示组件
 */

import type { SongStyle } from '@/types'

interface Props {
  resultImageUrl: string
  style: SongStyle | null
}

interface Emits {
  (e: 'download'): void
  (e: 'restart'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleDownload() {
  emit('download')
}

function handleRestart() {
  emit('restart')
}
</script>

<template>
  <div class="result-display">
    <!-- 结果图片 -->
    <div class="mb-4">
      <img
        :src="resultImageUrl"
        alt="生成结果"
        class="w-full rounded-lg animate-fade-in"
      />
      <p class="text-center text-song-text-muted text-xs mt-2">
        {{ style?.name }} - 宋韵风格
      </p>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-3">
      <button class="btn-song flex-1" @click="handleRestart">
        重新生成
      </button>
      <button class="btn-song-accent flex-1" @click="handleDownload">
        下载到本地
      </button>
    </div>
  </div>
</template>