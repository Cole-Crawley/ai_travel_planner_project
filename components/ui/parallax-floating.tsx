"use client"

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { useAnimationFrame } from "motion/react"
import { cn } from "@/lib/utils"
import { useMousePositionRef } from "@/hooks/use-mouse-position-ref"

interface FloatingContextType {
  registerElement: (id: string, element: HTMLDivElement, depth: number) => void
  unregisterElement: (id: string) => void
}

const FloatingContext = createContext<FloatingContextType | null>(null)

interface FloatingProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  sensitivity?: number
  easingFactor?: number
}

const Floating = ({
  children,
  className,
  style,
  sensitivity = 1,
  easingFactor = 0.05,
  ...props
}: FloatingProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementsMap = useRef(
    new Map<
      string,
      {
        element: HTMLDivElement
        depth: number
        currentPosition: { x: number; y: number }
      }
    >()
  )
  const mousePositionRef = useMousePositionRef(containerRef)

  const registerElement = useCallback(
    (id: string, element: HTMLDivElement, depth: number) => {
      elementsMap.current.set(id, {
        element,
        depth,
        currentPosition: { x: 0, y: 0 },
      })
    },
    []
  )

  const unregisterElement = useCallback((id: string) => {
    elementsMap.current.delete(id)
  }, [])

  useAnimationFrame(() => {
    if (!containerRef.current) return

    elementsMap.current.forEach((data) => {
      const strength = (data.depth * sensitivity) / 20

      const newTargetX = mousePositionRef.current.x * strength
      const newTargetY = mousePositionRef.current.y * strength

      const dx = newTargetX - data.currentPosition.x
      const dy = newTargetY - data.currentPosition.y

      data.currentPosition.x += dx * easingFactor
      data.currentPosition.y += dy * easingFactor

      data.element.style.transform = `translate3d(${data.currentPosition.x}px, ${data.currentPosition.y}px, 0)`
    })
  })

  return (
    <FloatingContext.Provider value={{ registerElement, unregisterElement }}>
      <div
        ref={containerRef}
        className={cn("absolute inset-0 w-full h-full overflow-hidden", className)}
        style={{ ...style, pointerEvents: "none", zIndex: 1, position: "absolute" }}
        {...props}
      >
        {children}
      </div>
    </FloatingContext.Provider>
  )
}

export default Floating

interface FloatingElementProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  depth?: number
}

export const FloatingElement = ({ children, className, style, depth = 1 }: FloatingElementProps) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const [idRef] = useState(() => Math.random().toString(36).substring(7))
  const context = useContext(FloatingContext)

  useEffect(() => {
    if (!elementRef.current || !context) return
    const nonNullDepth = depth ?? 0.01
    context.registerElement(idRef, elementRef.current, nonNullDepth)
    return () => context.unregisterElement(idRef)
  }, [depth, context, idRef])

  return (
    <div 
      ref={elementRef} 
      className={cn("will-change-transform pointer-events-auto", className)} 
      style={{ ...style, position: "absolute" }}
    >
      {children}
    </div>
  )
}