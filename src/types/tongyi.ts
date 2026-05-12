/**
 * 通义万相 API 客户端（浏览器端类型定义）
 */

export interface TongyiGenerateParams {
  prompt: string
  negativePrompt?: string
  style?: string
  size?: string
  n?: number
}

export interface TongyiTaskResult {
  taskId: string
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED'
  results?: Array<{ url: string }>
  message?: string
}