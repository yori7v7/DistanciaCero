// AudioProvider creates detached elements, so querying the DOM alone misses them.
const players = new Map<HTMLAudioElement, () => void>()
let currentAudio: HTMLAudioElement | null = null

export function registerAudio(audio: HTMLAudioElement, interrupt: () => void): () => void {
  players.set(audio, interrupt)
  return () => {
    players.delete(audio)
    releaseAudio(audio)
  }
}

export function claimAudio(audio: HTMLAudioElement): void {
  currentAudio = audio
  for (const [other, interrupt] of players) {
    if (other !== audio) interrupt()
  }
  document.querySelectorAll('audio').forEach((other) => {
    if (other !== audio && !players.has(other)) other.pause()
  })
}

export function releaseAudio(audio: HTMLAudioElement): void {
  if (currentAudio === audio) currentAudio = null
}

export function isCurrentAudio(audio: HTMLAudioElement): boolean {
  return currentAudio === audio
}

export function pauseAllAudio(): void {
  currentAudio = null
  for (const interrupt of players.values()) interrupt()
  document.querySelectorAll('audio').forEach((audio) => {
    if (!players.has(audio)) audio.pause()
  })
}
