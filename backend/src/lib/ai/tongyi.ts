interface TongyiGenerateParams {
  prompt: string
  negativePrompt?: string
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
  constructor(apiKey: string) { this.apiKey = apiKey }

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
        input: { prompt: params.prompt, negative_prompt: params.negativePrompt },
        parameters: { style: '<auto>', size: '1024*1024', n: 1 }
      })
    })

    if (!response.ok) throw new Error(`API 错误: ${response.status}`)
    const data = await response.json() as { output: { task_id: string } }
    return data.output.task_id
  }

  async queryTaskStatus(taskId: string): Promise<TongyiTaskResult> {
    const response = await fetch(`${TASK_URL}/${taskId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    })

    if (!response.ok) throw new Error(`查询失败: ${response.status}`)
    const data = await response.json() as {
      output: { task_id: string; task_status: string; results?: Array<{ url: string }>; message?: string }
    }
    return { taskId: data.output.task_id, status: data.output.task_status as TongyiTaskResult['status'], results: data.output.results, message: data.output.message }
  }
}

export function createTongyiClient(): TongyiClient {
  const apiKey = process.env.TONGYI_API_KEY
  if (!apiKey) throw new Error('TONGYI_API_KEY 未配置')
  return new TongyiClient(apiKey)
}