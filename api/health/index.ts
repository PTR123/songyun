/**
 * 健康检查
 * GET /api/health
 */

export const config = {
  runtime: 'edge'
}

export default async function handler(request: Request): Promise<Response> {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'local',
    edge: true
  })
}