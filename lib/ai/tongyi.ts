/**
 * 通义万相 API 客户端
 * 用于调用阿里云 DashScope 图像生成服务
 */

interface TongyiGenerateParams {
  prompt: string
  negativePrompt?: string
  style?: string
  size?: string
  n?: number
}

interface TongyiTaskResult {
  taskId: string
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED'
  results?: Array<{ url: string }>
  message?: string
}

const API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis'
const TASK_URL = 'https://dashscope.aliyuncs.com/api/v1/tasks'

export class TongyiClient {
  private apiKey: string
  private maxRetries = 3
  private retryDelay = 2000

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * 提交图像生成任务
   */
  async submitGeneration(params: TongyiGenerateParams): Promise<string> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
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
          style: params.style || '<auto>',
          size: params.size || '1024*1024',
          n: params.n || 1
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

  /**
   * 查询任务状态
   */
  async queryTaskStatus(taskId: string): Promise<TongyiTaskResult> {
    const response = await fetch(`${TASK_URL}/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
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

  /**
   * 等待任务完成并返回结果
   */
  async waitForCompletion(taskId: string, maxWaitSeconds = 120): Promise<string> {
    for (let i = 0; i < maxWaitSeconds / 3; i++) {
      await this.delay(3000)

      const result = await this.queryTaskStatus(taskId)

      if (result.status === 'SUCCEEDED' && result.results?.[0]) {
        return result.results[0].url
      }

      if (result.status === 'FAILED') {
        throw new Error(`图像生成失败: ${result.message}`)
      }

      if (result.status === 'CANCELED') {
        throw new Error('任务被取消')
      }
    }

    throw new Error('任务超时')
  }

  /**
   * 一站式生成：提交 + 等待
   */
  async generate(params: TongyiGenerateParams): Promise<string> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const taskId = await this.submitGeneration(params)
        const resultUrl = await this.waitForCompletion(taskId)
        return resultUrl
      } catch (error) {
        lastError = error as Error
        console.error(`第 ${attempt + 1} 次尝试失败:`, error)

        if (attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelay * (attempt + 1))
        }
      }
    }

    throw new Error(`生成失败，已尝试 ${this.maxRetries} 次: ${lastError?.message}`)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 创建默认客户端实例
export function createTongyiClient(): TongyiClient {
  const apiKey = process.env.TONGYI_API_KEY
  if (!apiKey) {
    throw new Error('TONGYI_API_KEY 未配置')
  }
  return new TongyiClient(apiKey)
}