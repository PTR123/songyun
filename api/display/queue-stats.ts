/**
 * 大屏排队统计
 * GET /api/display/queue-stats
 */

interface QueueStatsResponse {
  success: boolean
  data?: {
    totalTasks: number
    pendingTasks: number
    processingTasks: number
    averageWaitTime: number
  }
  error?: string
}

// 模拟排队数据（后续使用 Redis 实现）
let queueStats = {
  totalTasks: 0,
  pendingTasks: 0,
  processingTasks: 0,
  averageWaitTime: 30
}

export default async function handler(
  request: Request
): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 })
  }

  // TODO: 从 Redis 获取真实排队数据

  const response: QueueStatsResponse = {
    success: true,
    data: queueStats
  }

  return Response.json(response)
}

// 用于更新排队统计的内部函数
export function updateQueueStats(stats: Partial<typeof queueStats>) {
  queueStats = { ...queueStats, ...stats }
}