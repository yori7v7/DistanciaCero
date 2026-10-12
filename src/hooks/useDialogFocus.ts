import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

interface DialogFocusOptions {
  isOpen: boolean
  dialogRef: RefObject<HTMLElement | null>
  onClose?: () => void
  initialFocusRef?: RefObject<HTMLElement | null>
  returnFocusRef?: RefObject<HTMLElement | null>
  /** Inline readers move focus without making the rest of the page modal. */
  trapFocus?: boolean
  restoreFocus?: boolean
}

const focusableSelector = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',')

function canReceiveFocus(element: HTMLElement | null): element is HTMLElement {
  if (!element?.isConnected || element.closest('.scene-hidden, [hidden], [inert], [aria-hidden="true"]')) return false
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden'
}

/** Focus entry/return for dialogs and inline readers; optional modal keyboard containment. */
export default function useDialogFocus({
  isOpen, dialogRef, onClose, initialFocusRef, returnFocusRef,
  trapFocus = true, restoreFocus = true,
}: DialogFocusOptions) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const dialog = dialogRef.current
    if (!isOpen || !dialog) return

    const previousFocus = returnFocusRef?.current ||
      (document.activeElement instanceof HTMLElement ? document.activeElement : null)
    const focusableElements = () => Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
      .filter(canReceiveFocus)
    const focusStart = () => {
      if (!canReceiveFocus(dialog)) return
      const initialTarget = initialFocusRef?.current || null
      const target = canReceiveFocus(initialTarget)
        ? initialTarget
        : focusableElements()[0] || dialog
      target.focus({ preventScroll: true })
    }

    focusStart()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onCloseRef.current &&
          (trapFocus || dialog.contains(document.activeElement))) {
        event.preventDefault()
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !trapFocus) return

      const elements = focusableElements()
      const first = elements[0]
      const last = elements[elements.length - 1]
      const active = document.activeElement
      if (!first) {
        event.preventDefault()
        dialog.focus({ preventScroll: true })
      } else if (!dialog.contains(active) || active === dialog ||
                 (event.shiftKey ? active === first : active === last)) {
        event.preventDefault()
        const target = event.shiftKey ? last : first
        // Wrapping in a scrollable dialog must bring the focused control into view.
        target.focus()
      }
    }
    const handleFocusIn = (event: FocusEvent) => {
      if (trapFocus && event.target instanceof Node && !dialog.contains(event.target)) focusStart()
    }

    document.addEventListener('keydown', handleKeyDown)
    if (trapFocus) document.addEventListener('focusin', handleFocusIn)
    const previousOverflow = document.body.style.overflow
    if (trapFocus) document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)
      if (trapFocus) document.body.style.overflow = previousOverflow
      // An inline reader must not take focus back from another action the user selected.
      const active = document.activeElement
      const shouldReturn = trapFocus || dialog.contains(active) || active === document.body || active === null
      const returnTarget = returnFocusRef?.current || previousFocus
      if (restoreFocus && shouldReturn && canReceiveFocus(returnTarget)) returnTarget.focus({ preventScroll: true })
    }
  }, [isOpen, dialogRef, initialFocusRef, returnFocusRef, trapFocus, restoreFocus])
}
