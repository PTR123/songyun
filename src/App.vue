<script setup lang="ts">
import { RouterView } from 'vue-router'
import ErrorBoundary from '@/shared/components/ErrorBoundary.vue'
</script>

<template>
  <ErrorBoundary>
    <div class="min-h-screen ink-bg">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </div>
  </ErrorBoundary>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>