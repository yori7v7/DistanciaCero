import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Clock } from 'three'
import type { Frameloop } from '@react-three/fiber'
import { CanvasClockController } from '../utils/canvasClock'

let now = 0

// Reproduce Fiber's installed setFrameloop behavior, which resets elapsedTime.
function makeCanvas() {
  const clock = new Clock()
  clock.start()
  const state = {
    clock,
    frameloop: 'demand' as Frameloop,
    internal: { frames: 0 },
    invalidate: vi.fn(() => { if (state.frameloop !== 'never') state.internal.frames = 1 }),
    setFrameloop: (mode: Frameloop) => {
      clock.stop()
      clock.elapsedTime = 0
      if (mode !== 'never') {
        clock.start()
        clock.elapsedTime = 0
      }
      state.frameloop = mode
    },
  }
  return state
}

beforeEach(() => {
  now = 0
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => vi.restoreAllMocks())

describe('reloj de las escenas persistentes', () => {
  it('continúa desde la última fase visible sin sumar el tiempo oculto al delta', () => {
    const state = makeCanvas()
    const controller = new CanvasClockController()
    controller.apply(state, true, false)
    now = 160
    state.clock.getDelta()
    controller.frame(state, true)
    const orbitBefore = Math.cos(state.clock.elapsedTime * 0.105 + 0.25)
    state.internal.frames = 2

    controller.apply(state, false, false)
    now = 300_160
    expect(state.clock.getDelta()).toBe(0)
    expect(state.internal.frames).toBe(0)
    expect(Math.cos(state.clock.elapsedTime * 0.105 + 0.25)).toBe(orbitBefore)

    controller.apply(state, true, false)
    expect(state.clock.elapsedTime).toBeCloseTo(0.16)
    now += 16
    expect(state.clock.getDelta()).toBeCloseTo(0.016)
    controller.frame(state, true)
    expect(state.clock.elapsedTime).toBeCloseTo(0.176)
  })

  it('permite renders bajo demanda sin avanzar estrellas ni el tiempo decorativo', () => {
    const state = makeCanvas()
    const controller = new CanvasClockController()
    controller.apply(state, true, false)
    now = 1200
    state.clock.getDelta()
    controller.frame(state, true)
    controller.apply(state, true, true)
    const starUniformBefore = state.clock.elapsedTime * 0.18

    for (const interactionTime of [2000, 9000, 900_000]) {
      now = interactionTime
      state.invalidate() // The same invalidation used by OrbitControls.
      expect(state.clock.getDelta()).toBe(0)
      controller.frame(state, false)
      expect(state.clock.elapsedTime * 0.18).toBe(starUniformBefore)
      expect(state.internal.frames).toBe(1)
      state.internal.frames = 0
    }
    controller.apply(state, true, false)
    now += 16
    expect(state.clock.getDelta()).toBeCloseTo(0.016)
    expect(state.clock.elapsedTime).toBeCloseTo(1.216)
  })

  it('recupera la fase si Canvas.configure restablece el modo declarativo', () => {
    const state = makeCanvas()
    const controller = new CanvasClockController()
    controller.apply(state, true, false)
    now = 4000
    state.clock.getDelta()
    controller.frame(state, true)

    state.setFrameloop('demand')
    expect(state.clock.elapsedTime).toBe(0)
    controller.apply(state, true, false)
    expect(state.clock.elapsedTime).toBe(4)
    now += 16
    expect(state.clock.getDelta()).toBeCloseTo(0.016)
  })

  it('empieza estático con movimiento reducido y elimina frames pendientes al ocultarlo', () => {
    const state = makeCanvas()
    const controller = new CanvasClockController()
    controller.apply(state, true, true)
    now = 5000
    state.clock.getDelta()
    controller.frame(state, false)
    expect(state.clock.elapsedTime).toBe(0)
    controller.apply(state, false, true)
    expect(state.internal.frames).toBe(0)
    const before = state.invalidate.mock.calls.length
    controller.apply(state, false, true)
    expect(state.invalidate.mock.calls.length).toBe(before)
    controller.apply(state, true, true)
    now = 100_000
    expect(state.clock.getDelta()).toBe(0)
    expect(state.clock.elapsedTime).toBe(0)
    expect(state.internal.frames).toBe(1)
  })
})
