// 风格类型
export interface SongStyle {
  id: string
  name: string
  description: string
  thumbnail: string
  prompt: string
  negativePrompt?: string
}

// 任务状态（包含通义万相 API 返回的状态）
export type TaskStatus = 'pending' | 'processing' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'completed' | 'failed' | 'cancelled'

// 任务数据
export interface Task {
  id: string
  userId: string
  originalImage: string
  resultImage?: string
  style: SongStyle
  status: TaskStatus
  queuePosition: number
  createdAt: Date
  completedAt?: Date
  consentToDisplay: boolean
  error?: string
}

// 大屏展示项
export interface DisplayItem {
  taskId: string
  originalImage: string
  resultImage: string
  style: SongStyle
  createdAt: Date
}

// 排队统计
export interface QueueStats {
  totalTasks: number
  pendingTasks: number
  processingTasks: number
  averageWaitTime: number
}

// API 响应
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 上传预签名响应
export interface PresignUrlResponse {
  uploadUrl: string
  fileKey: string
  expiresIn: number
}

// 创建任务请求
export interface CreateTaskRequest {
  originalImageUrl: string
  styleId: string
}

// 创建任务响应
export interface CreateTaskResponse {
  taskId: string
  queuePosition: number
  estimatedWaitTime: number
}

// 任务状态响应
export interface TaskStatusResponse {
  taskId: string
  status: TaskStatus
  queuePosition: number
  resultImageUrl?: string
  error?: string
  message?: string
}

// WebSocket 事件类型
export type WSEventType =
  | 'queue:update'
  | 'task:created'
  | 'task:completed'
  | 'display:new'

// WebSocket 消息
export interface WSMessage {
  type: WSEventType
  payload: unknown
  timestamp: number
}