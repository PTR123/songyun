/**
 * 大屏最新成果
 * GET /api/display/recent-results?limit=10
 */

import type { DisplayItem } from '../../lib/types'

interface RecentResultsResponse {
  success: boolean
  data?: {
    items: DisplayItem[]
    total: number
  }
  error?: string
}

// 模拟展示数据（后续使用 Redis 实现）
const displayItems: DisplayItem[] = []

export default async function handler(
  request: Request
): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '10', 10)

    // TODO: 从 Redis 获取真实展示数据

    const response: RecentResultsResponse = {
      success: true,
      data: {
        items: displayItems.slice(0, limit),
        total: displayItems.length
      }
    }

    return Response.json(response)
  } catch (error) {
    console.error('获取最新成果失败:', error)
    return Response.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}

// 用于添加展示项的内部函数
export function addDisplayItem(item: DisplayItem) {
  displayItems.unshift(item)
  // 保持最多 20 条记录
  if (displayItems.length > 20) {
    displayItems.pop()
  }
}