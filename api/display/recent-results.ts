/**
 * 大屏最新成果
 * GET /api/display/recent-results?limit=10
 */

export const config = {
  runtime: 'edge'
}

interface DisplayItem {
  taskId: string
  originalImage: string
  resultImage: string
  style: string
  createdAt: string
}

interface RecentResultsResponse {
  success: boolean
  data?: {
    items: DisplayItem[]
    total: number
  }
  error?: string
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 })
  }

  const url = new URL(request.url)
  const limit = parseInt(url.searchParams.get('limit') || '10', 10)

  // 模拟数据（后续使用 Redis/Vercel Blob 实现）
  const response: RecentResultsResponse = {
    success: true,
    data: {
      items: [],
      total: 0
    }
  }

  return Response.json(response)
}