/**
 * 文件上传逻辑
 */

import { ref } from 'vue'
import axios from 'axios'

interface UploadResult {
  url: string
  key: string
}

interface UseFileUploadReturn {
  isUploading: boolean
  progress: number
  error: string | null
  upload: (file: File) => Promise<UploadResult | null>
}

export function useFileUpload(): UseFileUploadReturn {
  const isUploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  async function upload(file: File): Promise<UploadResult | null> {
    isUploading.value = true
    progress.value = 0
    error.value = null

    try {
      // TODO: 获取预签名 URL
      // const presignResponse = await axios.post('/api/upload/presign-url', {
      //   filename: file.name,
      //   contentType: file.type
      // })

      // 模拟上传过程
      // 实际项目中使用 Vercel Blob 或其他存储服务

      // 模拟进度
      for (let i = 0; i <= 100; i += 10) {
        progress.value = i
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // 返回模拟 URL
      const result: UploadResult = {
        url: URL.createObjectURL(file), // 本地临时 URL
        key: `uploads/${Date.now()}-${file.name}`
      }

      return result
    } catch (err) {
      error.value = (err as Error).message
      return null
    } finally {
      isUploading.value = false
    }
  }

  return {
    isUploading: isUploading.value,
    progress: progress.value,
    error: error.value,
    upload
  }
}