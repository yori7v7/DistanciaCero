import { useEffect, useRef, useState } from 'react'
import scenes from '../data/scenes.json'
import { prefersReducedMotion } from '../utils/motion'
import { CENTRO_VISIBLE_KEY, readScenePreference, resolveSceneId } from '../utils/sceneSelection'

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion)

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!media) return
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reducedMotion
}

function isSectionActive(sectionId: string): boolean {
  if (typeof document === 'undefined' || document.hidden) return false
  const section = document.getElementById(sectionId)
  if (section?.closest('.scene-hidden, [inert], [aria-hidden="true"]')) return false
  if (section?.classList.contains('scene-visible') || section?.getAttribute('aria-hidden') === 'false') return true
  if (section && !document.body.classList.contains('scene-mode-enabled')) return true

  // A lazy section can mount after the navigation event. Read the current selection,
  // using the same rule as navigation, until its DOM visibility has been applied.
  if (sectionId === 'centro-universo') return readScenePreference(CENTRO_VISIBLE_KEY) === 'true'
  const sceneId = resolveSceneId(window.location.hash)
  return Boolean(scenes.find(scene => scene.id === sceneId)?.sectionIds.includes(sectionId))
}

export default function useSceneActivity(sectionId: string) {
  const [isActive, setIsActive] = useState(() => isSectionActive(sectionId))
  const activityRef = useRef(isActive)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const update = () => {
      const next = isSectionActive(sectionId)
      if (next === activityRef.current) return
      activityRef.current = next
      setIsActive(next)
    }
    update()
    window.addEventListener('distancia-cero-scene-change', update)
    window.addEventListener('hashchange', update)
    window.addEventListener('popstate', update)
    document.addEventListener('visibilitychange', update)
    const observer = new MutationObserver(update)
    observer.observe(document.body, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ['class', 'aria-hidden', 'inert'],
    })
    return () => {
      observer.disconnect()
      window.removeEventListener('distancia-cero-scene-change', update)
      window.removeEventListener('hashchange', update)
      window.removeEventListener('popstate', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [sectionId])

  return { isActive, reducedMotion }
}
