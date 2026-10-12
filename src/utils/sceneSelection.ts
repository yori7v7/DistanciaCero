import scenes from '../data/scenes.json'

export const SCENE_STORAGE_KEY = 'distancia-cero-active-scene'
export const CENTRO_VISIBLE_KEY = 'distancia-cero-centro-visible'

export function readScenePreference(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

/** One selection rule for navigation, lazy mounting and animation activity. */
export function resolveSceneId(hash: string): string {
  const cleanHash = hash.replace('#/', '').replace('#', '').trim()
  const saved = readScenePreference(SCENE_STORAGE_KEY)
  const isScene = (id: string) => scenes.some(scene => scene.id === id && id !== 'centro-universo')
  if (cleanHash && isScene(cleanHash)) return cleanHash
  if (saved && isScene(saved)) return saved
  return scenes.find(scene => scene.id !== 'centro-universo')?.id || 'inicio'
}
