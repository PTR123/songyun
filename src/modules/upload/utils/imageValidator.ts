/**
 * 图片压缩工具
 */

import imageCompression from 'browser-image-compression'

interface CompressOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  fileType?: string
}

const defaultOptions: CompressOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1024,
  fileType: 'image/jpeg'
}

/**
 * 压缩图片
 * @param file 原始文件
 * @param options 压缩选项
 * @returns 压缩后的文件
 */
export async function compressImage(
  file: File,
  options: CompressOptions = defaultOptions
): Promise<File> {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    useWebWorker: true
  }

  try {
    const compressedFile = await imageCompression(file, mergedOptions)
    return compressedFile
  } catch (error) {
    console.error('图片压缩失败:', error)
    throw new Error('图片压缩失败')
  }
}

/**
 * 验证图片文件
 * @param file 文件
 * @returns 是否有效
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // 检查文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: '请上传 JPG、PNG 或 WEBP 格式的图片' }
  }

  // 检查文件大小（最大 10MB）
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: '图片大小不能超过 10MB' }
  }

  return { valid: true }
}

/**
 * 将文件转换为 Base64
 * @param file 文件
 * @returns Base64 字符串
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsDataURL(file)
  })
}

/**
 * 从 Base64 创建 Blob
 * @param base64 Base64 字符串
 * @returns Blob
 */
export function base64ToBlob(base64: string): Blob {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  const n = bstr.length
  const u8arr = new Uint8Array(n)
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }
  return new Blob([u8arr], { type: mime })
}