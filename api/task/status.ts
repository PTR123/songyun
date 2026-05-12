/**
 * 查询任务状态
 * GET /api/task/status?taskId=xxx
 *
 * 内联所有依赖以避免 Edge Runtime 打包问题
 */

export const config = {
  runtime: 'edge'
}

// 通义万相 API URL
const TASK_URL = 'https://dashscope.aliyuncs.com/api/v1/tasks'

// 查询任务状态
async function queryTaskStatus(taskId: string): Promise<{
  taskId: string
  status: string
  results?: Array<{ url: string }>
  message?: string
}> {
  const apiKey = process.env.TONGYI_API_KEY
  if (!apiKey) {
    throw new Error('TONGYI_API_KEY 未配置')
  }

  const response = await fetch(`${TASK_URL}/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  })

  if (!response.ok) {
    throw new Error(`查询任务状态失败: ${response.status}`)
  }

  const data = await response.json()
  return {
    taskId: data.output.task_id,
    status: data.output.task_status,
    results: data.output.results,
    message: data.output.message
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const url = new URL(request.url)
    const taskId = url.searchParams.get('taskId')

    if (!taskId) {
      return Response.json({ success: false, error: '缺少 taskId 参数' }, { status: 400 })
    }

    const result = await queryTaskStatus(taskId)

    return Response.json({
      success: true,
      data: {
        taskId: result.taskId,
        status: result.status,
        resultImageUrl: result.results?.[0]?.url,
        message: result.message
      }
    })
  } catch (error) {
    console.error('查询任务状态失败:', error)
    return Response.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}