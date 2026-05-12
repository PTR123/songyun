<script setup lang="ts">
/**
 * 授权弹窗组件
 */

interface Emits {
  (e: 'consent', consent: boolean): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

function handleConsent(consent: boolean) {
  emit('consent', consent)
}

function close() {
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-song-bg-dark/90 animate-fade-in">
    <div class="card-song p-6 w-full max-w-sm animate-slide-up">
      <!-- 标题 -->
      <h3 class="text-lg font-song text-song-text-primary mb-2 text-center">
        展示授权
      </h3>

      <!-- 说明 -->
      <p class="text-song-text-secondary text-sm mb-4 text-center">
        是否允许将您的宋韵照片在大屏幕上展示？
      </p>

      <!-- 提示 -->
      <div class="bg-song-bg-medium/50 rounded-lg p-3 mb-4">
        <p class="text-song-text-muted text-xs">
          选择「同意展示」后，您的照片将在活动现场的大屏幕上轮播展示，与更多观众分享宋韵之美。
        </p>
        <p class="text-song-text-muted text-xs mt-2">
          选择「仅保存本地」则不会在大屏幕展示，照片仅供您个人保存。
        </p>
      </div>

      <!-- 按钮 -->
      <div class="flex gap-3">
        <button class="btn-song flex-1" @click="handleConsent(false)">
          仅保存本地
        </button>
        <button class="btn-song-accent flex-1" @click="handleConsent(true)">
          同意展示
        </button>
      </div>

      <!-- 关闭按钮 -->
      <button
        class="absolute top-4 right-4 text-song-text-muted hover:text-song-text-primary"
        @click="close"
      >
        ✕
      </button>
    </div>
  </div>
</template>