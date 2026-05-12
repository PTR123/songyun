<script setup lang="ts">
/**
 * 大屏展示页面
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { useDisplayStore } from '@/stores/displayStore'
import { getQueueStats, getRecentResults } from '@/shared/utils/apiClient'
import { WebSocketClient } from '@/shared/utils/websocketClient'
import { SONG_STYLES } from '@/modules/style-selection/constants/song-styles'
import type { QueueStats, DisplayItem, WSMessage } from '@/types'

// 状态管理
const displayStore = useDisplayStore()

// WebSocket 客户端
let wsClient: WebSocketClient | null = null
let pollingInterval: number | null = null

// 自动轮播
const currentIndex = ref(0)
const autoPlayInterval = ref<number | null>(null)

// 连接 WebSocket
function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host

  wsClient = new WebSocketClient({
    url: `${protocol}//${host}/api/display/websocket`,
    onOpen: () => {
      displayStore.setConnected(true)
      wsClient?.subscribe(['queue', 'display'])
      stopPolling()
    },
    onClose: () => {
      displayStore.setConnected(false)
      startPolling()
    },
    onError: () => {
      displayStore.setConnectionError('WebSocket 连接失败')
      startPolling()
    },
    onMessage: (data) => {
      handleWSMessage(data as WSMessage)
    }
  })

  wsClient.connect()
}

// 处理 WebSocket 消息
function handleWSMessage(message: WSMessage) {
  switch (message.type) {
    case 'queue:update':
      displayStore.updateQueueStats(message.payload as QueueStats)
      break
    case 'display:new':
      displayStore.addDisplayItem(message.payload as DisplayItem)
      break
  }
}

// 开始轮询（WebSocket 失败时的备用方案）
function startPolling() {
  if (pollingInterval) return

  pollingInterval = window.setInterval(async () => {
    try {
      const stats = await getQueueStats()
      displayStore.updateQueueStats(stats)

      const items = await getRecentResults(10)
      displayStore.setDisplayItems(items)
    } catch (error) {
      console.error('轮询失败:', error)
    }
  }, 2000)
}

// 停止轮询
function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

// 开始自动轮播
function startAutoPlay() {
  if (displayStore.displayItems.length <= 1) return

  autoPlayInterval.value = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % displayStore.displayItems.length
  }, 5000)
}

// 停止自动轮播
function stopAutoPlay() {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value)
    autoPlayInterval.value = null
  }
}

// 获取风格名称
function getStyleName(styleId: string): string {
  const style = SONG_STYLES.find(s => s.id === styleId)
  return style?.name || styleId
}

// 格式化时间
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(async () => {
  // 初始化数据
  try {
    const stats = await getQueueStats()
    displayStore.updateQueueStats(stats)

    const items = await getRecentResults(10)
    displayStore.setDisplayItems(items)
  } catch (error) {
    console.error('初始化数据失败:', error)
  }

  // 连接 WebSocket
  connectWebSocket()

  // 开始自动轮播
  startAutoPlay()
})

onUnmounted(() => {
  wsClient?.disconnect()
  stopPolling()
  stopAutoPlay()
})
</script>

<template>
  <div class="min-h-screen bg-song-bg-dark p-8 ink-bg">
    <!-- 标题 -->
    <header class="text-center mb-12 animate-fade-in">
      <h1 class="text-4xl md:text-5xl font-song text-gradient-song text-shadow-song mb-4">
        宋韵照片展示
      </h1>
      <p class="text-song-text-secondary text-lg">
        实时展示排队状态与生成成果
      </p>

      <!-- 连接状态指示 -->
      <div class="mt-4 flex items-center justify-center gap-2">
        <span
          :class="[
            'w-2 h-2 rounded-full',
            displayStore.isConnected ? 'bg-song-jade' : 'bg-song-accent'
          ]"
        ></span>
        <span class="text-song-text-muted text-xs">
          {{ displayStore.isConnected ? '实时同步' : '轮询更新' }}
        </span>
      </div>
    </header>

    <!-- 排队状态区 -->
    <section class="mb-16 animate-slide-up">
      <h2 class="text-xl font-song text-song-text-primary mb-6 text-center">
        当前排队状态
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <div class="card-song text-center p-8 hover:border-song-accent transition-colors">
          <p class="text-song-text-muted text-sm mb-2">总任务数</p>
          <p class="text-4xl font-song text-song-accent animate-ink-spread">
            {{ displayStore.queueStats.totalTasks }}
          </p>
        </div>
        <div class="card-song text-center p-8 hover:border-song-gold transition-colors">
          <p class="text-song-text-muted text-sm mb-2">等待中</p>
          <p class="text-4xl font-song text-song-gold animate-ink-spread">
            {{ displayStore.queueStats.pendingTasks }}
          </p>
        </div>
        <div class="card-song text-center p-8 hover:border-song-jade transition-colors">
          <p class="text-song-text-muted text-sm mb-2">正在处理</p>
          <p class="text-4xl font-song text-song-jade animate-ink-spread">
            {{ displayStore.queueStats.processingTasks }}
          </p>
        </div>
        <div class="card-song text-center p-8 hover:border-song-text-secondary transition-colors">
          <p class="text-song-text-muted text-sm mb-2">预计等待</p>
          <p class="text-4xl font-song text-song-text-secondary animate-ink-spread">
            {{ displayStore.queueStats.averageWaitTime }}秒
          </p>
        </div>
      </div>
    </section>

    <!-- 成果展示区 -->
    <section class="animate-fade-in">
      <h2 class="text-xl font-song text-song-text-primary mb-6 text-center">
        最新生成成果
      </h2>

      <!-- 无内容提示 -->
      <div v-if="!displayStore.hasItems" class="text-center py-16">
        <div class="text-song-text-muted">
          <p class="text-lg mb-2">暂无展示内容</p>
          <p class="text-sm">等待用户生成并授权展示...</p>
        </div>
      </div>

      <!-- 成果展示网格 -->
      <div v-else class="max-w-6xl mx-auto">
        <!-- 大屏轮播（当前展示项） -->
        <div
          v-if="displayStore.displayItems.length > 0"
          class="mb-8 card-song p-4 max-w-2xl mx-auto"
        >
          <div class="grid grid-cols-2 gap-4">
            <div class="relative">
              <img
                :src="displayStore.displayItems[currentIndex]?.originalImage"
                alt="原图"
                class="w-full h-48 object-cover rounded-lg"
              />
              <span class="absolute bottom-2 left-2 bg-song-bg-dark/80 text-song-text-muted text-xs px-2 py-1 rounded">
                原图
              </span>
            </div>
            <div class="relative">
              <img
                :src="displayStore.displayItems[currentIndex]?.resultImage"
                alt="宋韵版"
                class="w-full h-48 object-cover rounded-lg"
              />
              <span class="absolute bottom-2 left-2 bg-song-accent/80 text-song-text-primary text-xs px-2 py-1 rounded">
                {{ getStyleName(displayStore.displayItems[currentIndex]?.style?.id || '') }}
              </span>
            </div>
          </div>
          <p class="text-center text-song-text-muted text-xs mt-4">
            {{ formatTime(displayStore.displayItems[currentIndex]?.createdAt) }}
          </p>
        </div>

        <!-- 历史成果列表 -->
        <div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          <div
            v-for="(item, idx) in displayStore.displayItems"
            :key="item.taskId"
            :class="[
              'card-song overflow-hidden transition-all duration-300 cursor-pointer',
              idx === currentIndex ? 'border-song-accent ring-2 ring-song-accent/30' : ''
            ]"
            @click="currentIndex = idx"
          >
            <img
              :src="item.resultImage"
              :alt="getStyleName(item.style?.id || '')"
              class="w-full h-20 object-cover"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 底部信息 -->
    <footer class="text-center text-song-text-muted text-xs mt-16">
      <p>宋韵照片生成体验 | 活动现场互动展示</p>
    </footer>
  </div>
</template>