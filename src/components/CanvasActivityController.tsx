import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import useSceneActivity from '../hooks/useSceneActivity'
import { CanvasClockController } from '../utils/canvasClock'

export default function CanvasActivityController({ sectionId }: { sectionId: string }) {
  // This listener belongs to the persistent Canvas root. Canvas.configure does not
  // propagate parent props while its container has zero bounds after being hidden.
  const { isActive, reducedMotion } = useSceneActivity(sectionId)
  const frameloop = useThree(state => state.frameloop)
  const getState = useThree(state => state.get)
  const controller = useRef(new CanvasClockController()).current

  useLayoutEffect(() => {
    controller.apply(getState(), isActive, reducedMotion)
  }, [controller, getState, isActive, reducedMotion, frameloop])

  // Run before OrbitControls and decorative subscribers.
  useFrame(state => controller.frame(state, isActive && !reducedMotion), -100)
  return null
}
