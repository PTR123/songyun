/**
 * 图片压缩逻辑
 */

import { ref } from 'vue'
import { compressImage, validateImage, fileToBase64 } from '../utils/imageValidator'

interface UseImageCompressReturn {
  isCompressing: boolean
  progress: number
  error: string | null | undefined
  compress: (file: File) => Promise<{ compressedFile: File; base64: string } | null>
}

export function useImageCompress(): UseImageCompressReturn {
  const isCompressing = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  async function compress(file: File): Promise<{ compressedFile: File; base64: string } | null> {
    // 验证文件
    const validation = validateImage(file)
    if (!validation.valid) {
      error.value = validation.error ?? null
      return null
    }

    isCompressing.value = true
    progress.value = 0
    error.value = null

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        if (progress.value < 90) {
          progress.value += 10
        }
      }, 100)

      // 压缩图片
      const compressedFile = await compressImage(file)

      // 转换为 Base64
      const base64 = await fileToBase64(compressedFile)

      clearInterval(progressInterval)
      progress.value = 100

      return { compressedFile, base64 }
    } catch (err) {
      error.value = (err as Error).message
      return null
    } finally {
      isCompressing.value = false
    }
  }

  return {
    isCompressing: isCompressing.value,
    progress: progress.value,
    error: error.value,
    compress
  }
}