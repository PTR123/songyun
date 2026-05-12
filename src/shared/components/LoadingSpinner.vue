<script setup lang="ts">
/**
 * 加载动画组件
 */

interface Props {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  text: '加载中...'
})

const sizeClass = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2">
    <!-- 宋韵风格加载动画 -->
    <div :class="[sizeClass[size], 'relative']">
      <!-- 外圈 -->
      <div class="absolute inset-0 rounded-full border-2 border-song-bg-medium animate-spin"
           style="animation-duration: 2s;"></div>
      <!-- 内圈 -->
      <div class="absolute inset-1 rounded-full border border-song-gold animate-spin"
           style="animation-duration: 1.5s; animation-direction: reverse;"></div>
      <!-- 中心点 -->
      <div class="absolute inset-2 rounded-full bg-song-accent animate-pulse"></div>
    </div>

    <!-- 文字 -->
    <p v-if="text" class="text-song-text-muted text-sm font-song">{{ text }}</p>
  </div>
</template>