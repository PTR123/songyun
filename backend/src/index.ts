/**
 * 宋韵照片生成后端服务
 */

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { createTongyiClient } from './lib/ai/tongyi.js'
import { SONG_STYLES } from './constants/song-styles.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/styles', (req, res) => {
  res.json({ success: true, data: SONG_STYLES })
})

app.post('/api/task/create', async (req, res) => {
  try {
    const { styleId } = req.body
    const style = SONG_STYLES.find(s => s.id === styleId)
    if (!style) return res.json({ success: false, error: '无效的风格 ID' })

    const client = createTongyiClient()
    const taskId = await client.submitGeneration({
      prompt: style.prompt,
      negativePrompt: style.negativePrompt
    })

    res.json({ success: true, data: { taskId, estimatedWaitTime: 30 } })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

app.get('/api/task/status', async (req, res) => {
  try {
    const { taskId } = req.query
    if (!taskId) return res.json({ success: false, error: '缺少 taskId' })

    const client = createTongyiClient()
    const result = await client.queryTaskStatus(taskId as string)

    res.json({
      success: true,
      data: {
        taskId: result.taskId,
        status: result.status,
        resultImageUrl: result.results?.[0]?.url,
        message: result.message
      }
    })
  } catch (error) {
    res.json({ success: false, error: (error as Error).message })
  }
})

app.post('/api/consent/toggle', (req, res) => {
  res.json({ success: true })
})

app.get('/api/display/queue-stats', (req, res) => {
  res.json({ success: true, data: { totalTasks: 0, pendingTasks: 0, processingTasks: 0, averageWaitTime: 30 } })
})

app.get('/api/display/recent-results', (req, res) => {
  res.json({ success: true, data: { items: [], total: 0 } })
})

const distPath = path.join(import.meta.dirname, '../dist')
app.use(express.static(distPath))
app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')))

app.listen(PORT, () => {
  console.log(`宋韵照片生成服务: http://localhost:${PORT}`)
})