/**
 * 创建图像生成任务
 * POST /api/task/create
 */

import { createTongyiClient } from '../../lib/ai/tongyi'
import { SONG_STYLES } from '../../lib/constants/song-styles'

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const body = await request.json()
    const { styleId } = body

    const style = SONG_STYLES.find(s => s.id === styleId)
    if (!style) {
      return Response.json({ success: false, error: '无效的风格 ID' }, { status: 400 })
    }

    const client = createTongyiClient()
    const taskId = await client.submitGeneration({
      prompt: style.prompt,
      negativePrompt: style.negativePrompt
    })

    return Response.json({
      success: true,
      data: { taskId, estimatedWaitTime: 30 }
    })
  } catch (error) {
    return Response.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}