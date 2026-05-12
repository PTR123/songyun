export interface SongStyle {
  id: string
  name: string
  description: string
  prompt: string
  negativePrompt: string
}

export const SONG_STYLES: SongStyle[] = [
  { id: 'ink-wash', name: '水墨风', description: '浓淡相宜，意境深远', prompt: '中国水墨画风格，传统国画，黑白水墨，笔触流畅，意境深远，大师作品', negativePrompt: '彩色，现代，照片' },
  { id: 'gongbi', name: '工笔画', description: '细腻精致，线条流畅', prompt: '中国工笔画风格，细腻笔触，精细线条，传统中国艺术，大师作品', negativePrompt: '抽象，西方风格' },
  { id: 'shinv', name: '仕女图', description: '古典美人，婉约动人', prompt: '宋代仕女画风格，古典美人，优雅传统服饰，柔和色彩，大师作品', negativePrompt: '现代服饰，照片' },
  { id: 'landscape', name: '山水意境', description: '空灵悠远，诗情画意', prompt: '宋代山水画风格，烟雨朦胧，流水潺潺，传统中国山水，诗意氛围，大师作品', negativePrompt: '城市，现代建筑' }
]