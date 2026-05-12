<script setup lang="ts">
/**
 * 进度指示器组件
 */

import type { TaskStatus } from '@/types'

interface Props {
  status: TaskStatus
  progress?: number
  queuePosition?: number
  estimatedWaitTime?: number
}

const props = withDefaults(defineProps<Props>(), {
  progress: 60,
  queuePosition: 0,
  estimatedWaitTime: 30
})

const statusTextMap: Record<TaskStatus, string> = {
  pending: '任务排队中...',
  processing: '正在处理...',
  RUNNING: '正在生成宋韵照片...',
  SUCCEEDED: '生成完成',
  FAILED: '生成失败',
  CANCELED: '任务已取消',
  completed: '生成完成',
  failed: '生成失败',
  cancelled: '任务已取消'
}

function getStatusText(status: TaskStatus): string {
  return statusTextMap[status] || '处理中'
}
</script>

<template>
  <div class="progress-indicator text-center">
    <!-- 状态文字 -->
    <p class="text-lg font-song text-song-text-primary mb-2">
      {{ getStatusText(props.status) }}
    </p>

    <!-- 排队位置 -->
    <p v-if="queuePosition > 0 && (status === 'pending' || status === 'RUNNING')" class="text-sm text-song-text-secondary mb-4">
      排队位置: {{ queuePosition }}
    </p>

    <!-- 进度条 -->
    <div v-if="status === 'pending' || status === 'RUNNING' || status === 'processing'" class="progress-bar w-full">
      <div class="progress-bar-fill" :style="{ width: `${progress}%` }"></div>
    </div>

    <!-- 预估等待时间 -->
    <p v-if="status === 'pending' || status === 'RUNNING'" class="text-xs text-song-text-muted mt-4">
      预计等待约 {{ estimatedWaitTime }} 秒
    </p>
  </div>
</template>