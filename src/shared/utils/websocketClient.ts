/**
 * WebSocket 客户端
 * 用于大屏实时同步
 */

interface WSOptions {
  url: string
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Error) => void
  onMessage?: (data: unknown) => void
  reconnectAttempts?: number
  reconnectDelay?: number
}

export class WebSocketClient {
  private ws: WebSocket | null = null
  private options: WSOptions
  private reconnectAttempts = 0
  private maxReconnectAttempts: number
  private reconnectDelay: number
  private isConnecting = false
  private shouldReconnect = true

  constructor(options: WSOptions) {
    this.options = options
    this.maxReconnectAttempts = options.reconnectAttempts ?? 5
    this.reconnectDelay = options.reconnectDelay ?? 1000
  }

  connect(): void {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.isConnecting = true
    this.shouldReconnect = true

    try {
      this.ws = new WebSocket(this.options.url)

      this.ws.onopen = () => {
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.options.onOpen?.()
      }

      this.ws.onclose = () => {
        this.isConnecting = false
        this.options.onClose?.()
        this.attemptReconnect()
      }

      this.ws.onerror = (event) => {
        this.isConnecting = false
        this.options.onError?.(new Error('WebSocket error'))
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.options.onMessage?.(data)
        } catch {
          this.options.onMessage?.(event.data)
        }
      }
    } catch (error) {
      this.isConnecting = false
      this.options.onError?.(error as Error)
      this.attemptReconnect()
    }
  }

  disconnect(): void {
    this.shouldReconnect = false
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  subscribe(channels: string[]): void {
    this.send({ action: 'subscribe', channels })
  }

  private attemptReconnect(): void {
    if (!this.shouldReconnect || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts

    setTimeout(() => {
      this.connect()
    }, delay)
  }
}

/**
 * 创建 WebSocket 客户端
 */
export function createWebSocketClient(options: Partial<WSOptions>): WebSocketClient {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  const url = `${protocol}//${host}/api/display/websocket`

  return new WebSocketClient({
    url,
    ...options
  })
}