/**
 * 通义万相 API 测试脚本
 * 测试四种宋韵风格的图像生成效果
 */

import 'dotenv/config'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const API_KEY = process.env.TONGYI_API_KEY || ''
const API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis'

// 四种宋韵风格
const SONG_STYLES = [
  {
    id: 'ink-wash',
    name: '水墨风',
    prompt: '中国水墨画风格，传统国画，黑白水墨，笔触流畅，意境深远，优雅艺术，大师作品，高质量',
    style: '<auto>'
  },
  {
    id: 'gongbi',
    name: '工笔画',
    prompt: '中国工笔画风格，细腻笔触，精细线条，传统中国艺术，优雅人物，淡雅设色，大师作品，高质量',
    style: '<auto>'
  },
  {
    id: 'shinv',
    name: '仕女图',
    prompt: '宋代仕女画风格，古典美人，优雅传统服饰，柔和色彩，精致风格，大师作品，高质量',
    style: '<auto>'
  },
  {
    id: 'landscape',
    name: '山水意境',
    prompt: '宋代山水画风格，烟雨朦胧，流水潺潺，传统中国山水，诗意氛围，大师作品，高质量',
    style: '<auto>'
  }
]

interface GenerateResponse {
  output: {
    task_id: string
    task_status: string
  }
  request_id: string
}

interface TaskStatusResponse {
  output: {
    task_id: string
    task_status: string
    results?: Array<{
      url: string
    }>
    message?: string
  }
  request_id: string
}

// 提交生成任务
async function submitGeneration(style: typeof SONG_STYLES[0]): Promise<string> {
  console.log(`\n提交 ${style.name} 风格生成任务...`)
  console.log(`Prompt: ${style.prompt}`)

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable'
    },
    body: JSON.stringify({
      model: 'wanx-v1',
      input: {
        prompt: style.prompt
      },
      parameters: {
        style: style.style,
        size: '1024*1024',
        n: 1
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API 请求失败: ${response.status} - ${errorText}`)
  }

  const data: GenerateResponse = await response.json()
  console.log(`任务 ID: ${data.output.task_id}`)
  return data.output.task_id
}

// 查询任务状态
async function queryTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const response = await fetch(
    `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    }
  )

  if (!response.ok) {
    throw new Error(`查询任务状态失败: ${response.status}`)
  }

  return await response.json()
}

// 等待任务完成
async function waitForCompletion(taskId: string, maxWait: number = 120): Promise<string> {
  console.log('等待任务完成...')

  for (let i = 0; i < maxWait / 3; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000))

    const status = await queryTaskStatus(taskId)
    console.log(`状态: ${status.output.task_status}`)

    if (status.output.task_status === 'SUCCEEDED') {
      if (status.output.results && status.output.results[0]) {
        return status.output.results[0].url
      }
    }

    if (status.output.task_status === 'FAILED') {
      throw new Error(`任务失败: ${status.output.message}`)
    }
  }

  throw new Error('任务超时')
}

// 下载图片
async function downloadImage(url: string, outputPath: string): Promise<void> {
  console.log(`下载图片到: ${outputPath}`)

  const response = await fetch(url)
  const buffer = await response.buffer()

  fs.writeFileSync(outputPath, buffer)
  console.log('下载完成')
}

// 主测试流程
async function runTests() {
  console.log('=== 通义万相 API 测试 ===')
  console.log(`API Key: ${API_KEY.slice(0, 10)}...${API_KEY.slice(-4)}`)

  // 创建输出目录
  const outputDir = path.join(process.cwd(), 'test-output')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }

  const results: { style: string; taskId: string; url: string }[] = []

  for (const style of SONG_STYLES) {
    try {
      const taskId = await submitGeneration(style)
      const resultUrl = await waitForCompletion(taskId)
      const outputPath = path.join(outputDir, `${style.id}.jpg`)
      await downloadImage(resultUrl, outputPath)

      results.push({
        style: style.name,
        taskId,
        url: resultUrl
      })

      console.log(`✓ ${style.name} 测试完成`)
    } catch (error) {
      console.error(`✗ ${style.name} 测试失败:`, error)
    }
  }

  console.log('\n=== 测试结果汇总 ===')
  for (const r of results) {
    console.log(`${r.style}: ${r.url}`)
  }
  console.log(`\n本地文件保存在: ${outputDir}`)
}

runTests().catch(console.error)