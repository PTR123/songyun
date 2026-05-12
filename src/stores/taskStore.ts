/**
 * 任务状态管理
 */

import { defineStore } from 'pinia'
import type { TaskStatus, SongStyle } from '@/types'

interface TaskState {
  taskId: string | null
  status: TaskStatus
  style: SongStyle | null
  originalImage: string | null
  resultImage: string | null
  queuePosition: number
  consentToDisplay: boolean
  error: string | null
}

export const useTaskStore = defineStore('task', {
  state: (): TaskState => ({
    taskId: null,
    status: 'pending',
    style: null,
    originalImage: null,
    resultImage: null,
    queuePosition: 0,
    consentToDisplay: false,
    error: null
  }),

  getters: {
    isProcessing: (state) => state.status === 'RUNNING' || state.status === 'pending',
    isCompleted: (state) => state.status === 'SUCCEEDED',
    isFailed: (state) => state.status === 'FAILED',
    canDownload: (state) => state.resultImage !== null
  },

  actions: {
    setTask(taskId: string, style: SongStyle) {
      this.taskId = taskId
      this.style = style
      this.status = 'pending'
      this.error = null
    },

    setStatus(status: TaskStatus) {
      this.status = status
    },

    setResult(resultImage: string) {
      this.resultImage = resultImage
      this.status = 'SUCCEEDED'
    },

    setQueuePosition(position: number) {
      this.queuePosition = position
    },

    setError(error: string) {
      this.error = error
      this.status = 'FAILED'
    },

    setConsent(consent: boolean) {
      this.consentToDisplay = consent
    },

    setOriginalImage(image: string) {
      this.originalImage = image
    },

    reset() {
      this.taskId = null
      this.status = 'pending'
      this.style = null
      this.originalImage = null
      this.resultImage = null
      this.queuePosition = 0
      this.consentToDisplay = false
      this.error = null
    }
  }
})