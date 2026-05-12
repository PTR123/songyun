/**
 * 大屏排队统计
 * GET /api/display/queue-stats
 */

export const config = {
  runtime: 'edge'
}

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

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 })
  }

  // 模拟排队数据（后续使用 Redis 实现）
  const response: QueueStatsResponse = {
    success: true,
    data: {
      totalTasks: 0,
      pendingTasks: 0,
      processingTasks: 0,
      averageWaitTime: 30
    }
  }

  return Response.json(response)
}