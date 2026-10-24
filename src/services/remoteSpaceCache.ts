let cachedSpaceId: string | null = null

export function getCachedSpaceId(): string | null {
  return cachedSpaceId
}

export function setCachedSpaceId(spaceId: string): void {
  cachedSpaceId = spaceId
}

/** Clear synchronously on sign-out so the next account cannot reuse this space. */
export function resetSpaceIdCache(): void {
  cachedSpaceId = null
}
