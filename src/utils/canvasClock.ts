import type { RootState } from '@react-three/fiber'

type CanvasClockState = Pick<RootState, 'clock' | 'frameloop' | 'setFrameloop' | 'invalidate'> & {
  internal: Pick<RootState['internal'], 'frames'>
}

/** Keep the last rendered phase across Fiber's setFrameloop clock resets. */
export class CanvasClockController {
  private elapsedTime = 0

  apply(state: CanvasClockState, isActive: boolean, reducedMotion: boolean) {
    const mode = !isActive ? 'never' : reducedMotion ? 'demand' : 'always'
    if (state.frameloop !== mode) state.setFrameloop(mode)

    if (mode === 'always') {
      if (!state.clock.running) state.clock.start()
    } else {
      // Demand renders still run useFrame, including Drei's Stars. Freeze the clock
      // as well as decorative callbacks so OrbitControls cannot advance their phase.
      state.clock.stop()
    }
    state.clock.elapsedTime = this.elapsedTime

    if (!isActive) {
      // Fiber can finish a previously invalidated frame even in "never" mode.
      state.internal.frames = 0
    } else {
      state.invalidate()
    }
  }

  frame(state: Pick<RootState, 'clock'>, isAnimating: boolean) {
    if (isAnimating) this.elapsedTime = state.clock.elapsedTime
    else state.clock.elapsedTime = this.elapsedTime
  }
}
