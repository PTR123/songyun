/**
 * 生成提交（带用户上传图片）
 * POST /api/generation/submit
 */

import { createTongyiClient } from '../../lib/ai/tongyi'
import { SONG_STYLES } from '../../src/modules/style-selection/constants/song-styles'

interface SubmitRequest {
  styleId: string
  imageUrl?: string  // 用户上传图片 URL（后续支持）
}

interface SubmitResponse {
  success: boolean
  data?: {
    taskId: string
    estimatedWaitTime: number
  }
  error?: string
}

export default async function handler(
  request: Request
): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const body: SubmitRequest = await request.json()
    const { styleId } = body

    // 查找风格配置
    const style = SONG_STYLES.find(s => s.id === styleId)
    if (!style) {
      return Response.json({ success: false, error: '无效的风格 ID' }, { status: 400 })
    }

    // 创建通义万相客户端
    const client = createTongyiClient()

    // 提交生成任务
    const taskId = await client.submitGeneration({
      prompt: style.prompt,
      negativePrompt: style.negativePrompt
    })

    const response: SubmitResponse = {
      success: true,
      data: {
        taskId,
        estimatedWaitTime: 30
      }
    }

    return Response.json(response)
  } catch (error) {
    console.error('提交生成任务失败:', error)
    return Response.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}