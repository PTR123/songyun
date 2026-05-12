/**
 * 四种宋韵风格配置
 */

import type { SongStyle } from '@/types'

// 四个宋韵风格配置
export const SONG_STYLES: SongStyle[] = [
  {
    id: 'ink-wash',
    name: '水墨风',
    description: '浓淡相宜，意境深远，泼墨山水般的艺术效果',
    thumbnail: '/images/styles/ink-wash.jpg',
    prompt: '中国水墨画风格，传统国画，黑白水墨，笔触流畅，意境深远，优雅艺术，大师作品，高质量',
    negativePrompt: '彩色，明亮，现代，写实，照片，低质量'
  },
  {
    id: 'gongbi',
    name: '工笔画',
    description: '细腻精致，线条流畅，传统工笔人物画风格',
    thumbnail: '/images/styles/gongbi.jpg',
    prompt: '中国工笔画风格，细腻笔触，精细线条，传统中国艺术，优雅人物，淡雅设色，大师作品，高质量',
    negativePrompt: '抽象，松散，印象派，西方风格，低质量'
  },
  {
    id: 'shinv',
    name: '仕女图',
    description: '古典美人，婉约动人，宋代仕女画风格',
    thumbnail: '/images/styles/shinv.jpg',
    prompt: '宋代仕女画风格，古典美人，优雅传统服饰，柔和色彩，精致风格，大师作品，高质量',
    negativePrompt: '现代服饰，西方风格，休闲，照片，低质量'
  },
  {
    id: 'landscape',
    name: '山水意境',
    description: '空灵悠远，诗情画意，融入宋代山水画卷',
    thumbnail: '/images/styles/landscape.jpg',
    prompt: '宋代山水画风格，烟雨朦胧，流水潺潺，传统中国山水，诗意氛围，大师作品，高质量',
    negativePrompt: '城市，现代建筑，明亮色彩，照片，低质量'
  }
]

// 获取风格配置
export function getStyleById(id: string): SongStyle | undefined {
  return SONG_STYLES.find(style => style.id === id)
}