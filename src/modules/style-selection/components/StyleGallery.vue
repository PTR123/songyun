<script setup lang="ts">
/**
 * 风格画廊组件
 */

import { ref } from 'vue'
import { SONG_STYLES } from '../constants/song-styles'
import StyleCard from './StyleCard.vue'
import type { SongStyle } from '@/types'

interface Emits {
  (e: 'select', style: SongStyle): void
}

const emit = defineEmits<Emits>()

const selectedStyle = ref<SongStyle | null>(null)

function handleSelect(style: SongStyle) {
  selectedStyle.value = style
  emit('select', style)
}
</script>

<template>
  <div class="style-gallery">
    <h2 class="text-lg font-song text-song-text-primary mb-4">选择风格</h2>

    <div class="grid grid-cols-2 gap-3">
      <StyleCard
        v-for="style in SONG_STYLES"
        :key="style.id"
        :style="style"
        :selected="selectedStyle?.id === style.id"
        @select="handleSelect"
      />
    </div>
  </div>
</template>