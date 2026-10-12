export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}

export function getScrollBehavior(smooth = true): ScrollBehavior {
  return smooth && !prefersReducedMotion() ? 'smooth' : 'auto'
}
