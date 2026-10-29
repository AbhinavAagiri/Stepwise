import { useCallback, useEffect, useMemo, useState } from 'react'

export const PLAYBACK_SPEEDS = [0.5, 1, 2, 4, 8] as const

interface PlaybackOptions {
  /** Changing this resets the playhead (new array, grid, or algorithm). */
  resetKey?: string | number
  /** Milliseconds per step at 1x speed. */
  baseDelay?: number
  initialSpeed?: number
  autoPlay?: boolean
}

export interface Playback {
  index: number
  total: number
  playing: boolean
  speed: number
  atStart: boolean
  atEnd: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  goTo: (index: number) => void
  reset: () => void
  restart: () => void
  finish: () => void
  setSpeed: (speed: number) => void
}

export function usePlayback(total: number, options: PlaybackOptions = {}): Playback {
  const { resetKey, baseDelay = 120, initialSpeed = 2, autoPlay = false } = options
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(initialSpeed)

  const lastIndex = Math.max(0, total - 1)

  useEffect(() => {
    setIndex(0)
    setPlaying(autoPlay && total > 1)
  }, [resetKey, total, autoPlay])

  useEffect(() => {
    if (!playing) return
    if (total <= 1) {
      setPlaying(false)
      return
    }
    if (index >= lastIndex) {
      setPlaying(false)
      return
    }
    const delay = Math.max(12, baseDelay / speed)
    const timer = window.setTimeout(() => {
      setIndex((current) => Math.min(current + 1, lastIndex))
    }, delay)
    return () => window.clearTimeout(timer)
  }, [playing, index, total, lastIndex, baseDelay, speed])

  const play = useCallback(() => {
    if (total <= 1) return
    setIndex((current) => (current >= lastIndex ? 0 : current))
    setPlaying(true)
  }, [lastIndex, total])

  const pause = useCallback(() => setPlaying(false), [])

  const toggle = useCallback(() => {
    if (playing) setPlaying(false)
    else play()
  }, [playing, play])

  const next = useCallback(() => {
    setPlaying(false)
    setIndex((current) => Math.min(current + 1, lastIndex))
  }, [lastIndex])

  const prev = useCallback(() => {
    setPlaying(false)
    setIndex((current) => Math.max(current - 1, 0))
  }, [])

  const goTo = useCallback(
    (nextIndex: number) => {
      setPlaying(false)
      setIndex(Math.max(0, Math.min(Math.round(nextIndex), lastIndex)))
    },
    [lastIndex],
  )

  const reset = useCallback(() => {
    setPlaying(false)
    setIndex(0)
  }, [])

  const restart = useCallback(() => {
    setIndex(0)
    setPlaying(total > 1)
  }, [total])

  const finish = useCallback(() => {
    setPlaying(false)
    setIndex(lastIndex)
  }, [lastIndex])

  return useMemo(
    () => ({
      index,
      total,
      playing,
      speed,
      atStart: index === 0,
      atEnd: index >= lastIndex,
      play,
      pause,
      toggle,
      next,
      prev,
      goTo,
      reset,
      restart,
      finish,
      setSpeed,
    }),
    [index, total, playing, speed, lastIndex, play, pause, toggle, next, prev, goTo, reset, restart, finish],
  )
}
