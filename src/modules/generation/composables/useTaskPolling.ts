/**
 * 任务轮询逻辑
 */

import { ref } from 'vue'
import { getTaskStatus } from '@/shared/utils/apiClient'
import type { TaskStatus } from '@/types'

interface UseTaskPollingReturn {
  isPolling: boolean
  status: TaskStatus
  resultImageUrl: string | null
  error: string | null
  startPolling: (taskId: string, maxPolls?: number, intervalMs?: number) => Promise<void>
  stopPolling: () => void
}

export function useTaskPolling(): UseTaskPollingReturn {
  const isPolling = ref(false)
  const status = ref<TaskStatus>('pending')
  const resultImageUrl = ref<string | null>(null)
  const error = ref<string | null>(null)

  let pollingTimer: number | null = null

  async function startPolling(
    taskId: string,
    maxPolls = 40,
    intervalMs = 3000
  ): Promise<void> {
    isPolling.value = true
    error.value = null
    status.value = 'pending'

    for (let i = 0; i < maxPolls; i++) {
      if (!isPolling.value) break

      try {
        const result = await getTaskStatus(taskId)

        status.value = result.status as TaskStatus

        if (result.status === 'SUCCEEDED') {
          resultImageUrl.value = result.resultImageUrl ?? null
          isPolling.value = false
          return
        }

        if (result.status === 'FAILED') {
          error.value = result.message ?? '生成失败'
          isPolling.value = false
          return
        }

        // 等待下一次轮询
        await new Promise(resolve => {
          pollingTimer = window.setTimeout(resolve, intervalMs)
        })
      } catch (err) {
        error.value = (err as Error).message
        isPolling.value = false
        return
      }
    }

    error.value = '生成超时，请稍后重试'
    isPolling.value = false
  }

  function stopPolling(): void {
    isPolling.value = false
    if (pollingTimer) {
      clearTimeout(pollingTimer)
      pollingTimer = null
    }
  }

  return {
    isPolling: isPolling.value,
    status: status.value,
    resultImageUrl: resultImageUrl.value,
    error: error.value,
    startPolling,
    stopPolling
  }
}