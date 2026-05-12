<script setup lang="ts">
/**
 * 错误边界组件
 */

import { ref, onErrorCaptured } from 'vue'

interface Props {
  fallback?: string
}

const props = withDefaults(defineProps<Props>(), {
  fallback: '出现错误，请刷新页面重试'
})

const hasError = ref(false)
const errorMessage = ref('')

// 捕获错误
onErrorCaptured((error) => {
  hasError.value = true
  errorMessage.value = error.message
  return false
})

// 重试
function retry() {
  hasError.value = false
  errorMessage.value = ''
  window.location.reload()
}
</script>

<template>
  <div v-if="hasError" class="min-h-screen flex items-center justify-center bg-song-bg-dark">
    <div class="card-song p-6 text-center max-w-md">
      <div class="text-song-accent text-4xl mb-4">✕</div>
      <h2 class="text-lg font-song text-song-text-primary mb-2">出错了</h2>
      <p class="text-song-text-muted text-sm mb-4">{{ errorMessage || fallback }}</p>
      <button class="btn-song-accent" @click="retry">
        刷新页面
      </button>
    </div>
  </div>
  <slot v-else />
</template>