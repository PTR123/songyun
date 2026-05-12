/**
 * API 客户端
 * 用于调用后端 API
 */

import axios from 'axios'
import type { ApiResponse, CreateTaskResponse, TaskStatusResponse, QueueStats, DisplayItem } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 创建生成任务
 */
export async function createTask(styleId: string): Promise<CreateTaskResponse> {
  const response = await api.post<ApiResponse<CreateTaskResponse>>('/task/create', { styleId })
  return response.data.data!
}

/**
 * 查询任务状态
 */
export async function getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const response = await api.get<ApiResponse<TaskStatusResponse>>('/task/status', { params: { taskId } })
  return response.data.data!
}

/**
 * 获取排队统计
 */
export async function getQueueStats(): Promise<QueueStats> {
  const response = await api.get<ApiResponse<{ totalTasks: number; pendingTasks: number; processingTasks: number; averageWaitTime: number }>>('/display/queue-stats')
  return response.data.data!
}

/**
 * 获取最新成果
 */
export async function getRecentResults(limit = 10): Promise<DisplayItem[]> {
  const response = await api.get<ApiResponse<{ items: DisplayItem[]; total: number }>>('/display/recent-results', { params: { limit } })
  return response.data.data?.items || []
}

export default api