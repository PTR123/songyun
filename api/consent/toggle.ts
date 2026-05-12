/**
 * 授权状态切换
 * POST /api/consent/toggle
 */

interface ConsentRequest {
  taskId: string
  consent: boolean
}

interface ConsentResponse {
  success: boolean
  error?: string
}

export default async function handler(
  request: Request
): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const body: ConsentRequest = await request.json()
    const { taskId, consent } = body

    if (!taskId) {
      return Response.json({ success: false, error: '缺少 taskId' }, { status: 400 })
    }

    // TODO: 在 Redis 中更新授权状态
    // 当前为模拟实现

    console.log(`任务 ${taskId} 授权状态: ${consent ? '已授权展示' : '仅保存本地'}`)

    const response: ConsentResponse = {
      success: true
    }

    return Response.json(response)
  } catch (error) {
    console.error('更新授权状态失败:', error)
    return Response.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}