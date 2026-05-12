/**
 * 查询任务状态
 * GET /api/task/status?taskId=xxx
 */

import { createTongyiClient } from '../../lib/ai/tongyi'

interface TaskStatusResponse {
  success: boolean
  data?: {
    taskId: string
    status: string
    resultImageUrl?: string
    message?: string
  }
  error?: string
}

export default async function handler(
  request: Request
): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const url = new URL(request.url)
    const taskId = url.searchParams.get('taskId')

    if (!taskId) {
      return Response.json({ success: false, error: '缺少 taskId 参数' }, { status: 400 })
    }

    // 创建通义万相客户端
    const client = createTongyiClient()

    // 查询任务状态
    const result = await client.queryTaskStatus(taskId)

    const response: TaskStatusResponse = {
      success: true,
      data: {
        taskId: result.taskId,
        status: result.status,
        resultImageUrl: result.results?.[0]?.url,
        message: result.message
      }
    }

    return Response.json(response)
  } catch (error) {
    console.error('查询任务状态失败:', error)
    return Response.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}