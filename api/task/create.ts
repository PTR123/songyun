/**
 * 创建图像生成任务
 * POST /api/task/create
 *
 * 内联所有依赖以避免 Edge Runtime 打包问题
 */

export const config = {
  runtime: 'edge'
}

// 内联风格配置
const SONG_STYLES = [
  {
    id: 'ink-wash',
    name: '水墨风',
    prompt: '中国水墨画风格，传统国画，黑白水墨，笔触流畅，意境深远，优雅艺术，大师作品，高质量',
    negativePrompt: '彩色，明亮，现代，写实，照片，低质量'
  },
  {
    id: 'gongbi',
    name: '工笔画',
    prompt: '中国工笔画风格，细腻笔触，精细线条，传统中国艺术，优雅人物，淡雅设色，大师作品，高质量',
    negativePrompt: '抽象，松散，印象派，西方风格，低质量'
  },
  {
    id: 'shinv',
    name: '仕女图',
    prompt: '宋代仕女画风格，古典美人，优雅传统服饰，柔和色彩，精致风格，大师作品，高质量',
    negativePrompt: '现代服饰，西方风格，休闲，照片，低质量'
  },
  {
    id: 'landscape',
    name: '山水意境',
    prompt: '宋代山水画风格，烟雨朦胧，流水潺潺，传统中国山水，诗意氛围，大师作品，高质量',
    negativePrompt: '城市，现代建筑，明亮色彩，照片，低质量'
  }
]

// 通义万相 API URL
const API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis'

// 提交生成任务
async function submitGeneration(params: {
  prompt: string
  negativePrompt?: string
}): Promise<string> {
  const apiKey = process.env.TONGYI_API_KEY
  if (!apiKey) {
    throw new Error('TONGYI_API_KEY 未配置')
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable'
    },
    body: JSON.stringify({
      model: 'wanx-v1',
      input: {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt
      },
      parameters: {
        style: '<auto>',
        size: '1024*1024',
        n: 1
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`通义万相 API 错误: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.output.task_id
}

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

    const taskId = await submitGeneration({
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