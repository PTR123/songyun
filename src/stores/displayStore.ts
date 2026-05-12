/**
 * 大屏展示状态管理
 */

import { defineStore } from 'pinia'
import type { QueueStats, DisplayItem } from '@/types'

interface DisplayState {
  queueStats: QueueStats
  displayItems: DisplayItem[]
  isConnected: boolean
  connectionError: string | null
}

export const useDisplayStore = defineStore('display', {
  state: (): DisplayState => ({
    queueStats: {
      totalTasks: 0,
      pendingTasks: 0,
      processingTasks: 0,
      averageWaitTime: 30
    },
    displayItems: [],
    isConnected: false,
    connectionError: null
  }),

  getters: {
    hasItems: (state) => state.displayItems.length > 0,
    latestItems: (state) => state.displayItems.slice(0, 10)
  },

  actions: {
    updateQueueStats(stats: QueueStats) {
      this.queueStats = stats
    },

    addDisplayItem(item: DisplayItem) {
      this.displayItems.unshift(item)
      if (this.displayItems.length > 20) {
        this.displayItems.pop()
      }
    },

    setDisplayItems(items: DisplayItem[]) {
      this.displayItems = items
    },

    setConnected(connected: boolean) {
      this.isConnected = connected
      if (connected) {
        this.connectionError = null
      }
    },

    setConnectionError(error: string) {
      this.connectionError = error
      this.isConnected = false
    }
  }
})