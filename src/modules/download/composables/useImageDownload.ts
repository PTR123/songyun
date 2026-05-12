/**
 * 图片下载逻辑
 */

import { ref } from 'vue'

interface UseImageDownloadReturn {
  isDownloading: boolean
  error: string | null
  download: (imageUrl: string, filename?: string) => Promise<void>
}

export function useImageDownload(): UseImageDownloadReturn {
  const isDownloading = ref(false)
  const error = ref<string | null>(null)

  async function download(imageUrl: string, filename?: string): Promise<void> {
    isDownloading.value = true
    error.value = null

    try {
      // 获取图片
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('下载图片失败')
      }

      const blob = await response.blob()

      // 创建下载链接
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)

      // 设置文件名
      const defaultFilename = `宋韵照片-${Date.now()}.jpg`
      link.download = filename || defaultFilename

      // 执行下载
      link.click()

      // 清理
      URL.revokeObjectURL(link.href)
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      isDownloading.value = false
    }
  }

  return {
    isDownloading: isDownloading.value,
    error: error.value,
    download
  }
}