<script setup lang="ts">
/**
 * 宋韵主题布局组件
 */

interface Props {
  title?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '宋韵美学体验',
  subtitle: '感受传统美学的现代转化'
})
</script>

<template>
  <div class="min-h-screen flex flex-col ink-bg">
    <!-- 头部 -->
    <header class="text-center py-8 px-4 animate-fade-in">
      <h1 class="text-2xl md:text-3xl font-song text-gradient-song text-shadow-song mb-2">
        {{ title }}
      </h1>
      <p class="text-song-text-secondary text-sm md:text-base">
        {{ subtitle }}
      </p>
    </header>

    <!-- 主内容 -->
    <main class="flex-1 flex flex-col items-center justify-center px-4 pb-8">
      <slot />
    </main>

    <!-- 底部 -->
    <footer class="text-center text-song-text-muted text-xs py-4">
      <p>照片仅用于本次生成，不会保存或分享</p>
    </footer>
  </div>
</template>