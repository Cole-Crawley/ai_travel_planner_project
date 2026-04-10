"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react"
import {
  AnimatePresence,
  motion,
  MotionProps,
  Transition,
} from "framer-motion"
import { cn } from "@/lib/utils"

interface TextRotateProps {
  texts: string[]
  rotationInterval?: number
  initial?: MotionProps["initial"]
  animate?: MotionProps["animate"]
  exit?: MotionProps["exit"]
  staggerDuration?: number
  transition?: Transition
  loop?: boolean
  auto?: boolean
  mainClassName?: string
  elementLevelClassName?: string
}

export interface TextRotateRef {
  next: () => void
  previous: () => void
  jumpTo: (index: number) => void
  reset: () => void
}

const TextRotate = forwardRef<TextRotateRef, TextRotateProps>(
  (
    {
      texts,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      rotationInterval = 2000,
      staggerDuration = 0.025,
      loop = true,
      auto = true,
      mainClassName,
      elementLevelClassName,
      ...props
    },
    ref
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0)

    // Simplified splitting that handles emojis correctly
    const splitIntoCharacters = (text: string): string[] => {
      if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
        const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" })
        return Array.from(segmenter.segment(text), ({ segment }) => segment)
      }
      return Array.from(text)
    }

    const next = useCallback(() => {
      setCurrentTextIndex((prev) => (prev + 1) % texts.length)
    }, [texts.length])

    const previous = useCallback(() => {
      setCurrentTextIndex((prev) => (prev - 1 + texts.length) % texts.length)
    }, [texts.length])

    const jumpTo = useCallback((index: number) => {
      const validIndex = Math.max(0, Math.min(index, texts.length - 1))
      setCurrentTextIndex(validIndex)
    }, [texts.length])

    const reset = useCallback(() => {
      setCurrentTextIndex(0)
    }, [])

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [next, previous, jumpTo, reset])

    useEffect(() => {
      if (!auto) return
      const intervalId = setInterval(next, rotationInterval)
      return () => clearInterval(intervalId)
    }, [next, rotationInterval, auto])

    const currentText = texts[currentTextIndex]
    const characters = splitIntoCharacters(currentText)

    return (
      <motion.span
        className={cn("inline-flex flex-wrap whitespace-pre-wrap relative", mainClassName)}
        {...props}
      >
        <span className="sr-only">{currentText}</span>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTextIndex}
            className="flex flex-wrap"
            aria-hidden="true"
          >
            {characters.map((char, i) => (
              <motion.span
                key={`${currentTextIndex}-${i}`}
                initial={initial}
                animate={animate}
                exit={exit}
                transition={{
                  ...transition,
                  delay: i * staggerDuration,
                }}
                className={cn("inline-block", elementLevelClassName)}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.span>
    )
  }
)

TextRotate.displayName = "TextRotate"
export { TextRotate }