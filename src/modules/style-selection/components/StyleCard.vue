<script setup lang="ts">
/**
 * 风格卡片组件
 */

import type { SongStyle } from '@/types'

interface Props {
  style: SongStyle
  selected?: boolean
}

interface Emits {
  (e: 'select', style: SongStyle): void
}

const props = withDefaults(defineProps<Props>(), {
  selected: false
})

const emit = defineEmits<Emits>()

function handleClick() {
  emit('select', props.style)
}
</script>

<template>
  <div
    :class="[
      'style-card overflow-hidden transition-all duration-300',
      selected ? 'selected' : ''
    ]"
    @click="handleClick"
  >
    <!-- 缩略图 -->
    <img
      :src="style.thumbnail"
      :alt="style.name"
      class="w-full h-full object-cover opacity-70 transition-opacity"
      :class="{ 'opacity-100': selected }"
    />

    <!-- 信息层 -->
    <div class="absolute inset-0 flex flex-col items-center justify-center p-2 bg-gradient-to-b from-song-bg-dark/30 to-song-bg-dark/70">
      <!-- 名称 -->
      <p class="text-song-text-primary text-sm font-song mb-1">
        {{ style.name }}
      </p>

      <!-- 描述（截取） -->
      <p class="text-song-text-muted text-xs text-center line-clamp-2">
        {{ style.description }}
      </p>

      <!-- 选中指示 -->
      <div v-if="selected" class="mt-2">
        <span class="bg-song-accent text-song-text-primary text-xs px-2 py-1 rounded-full">
          已选择
        </span>
      </div>
    </div>
  </div>
</template>