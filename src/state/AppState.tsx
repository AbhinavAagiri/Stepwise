import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { readJSON, removeStored, writeJSON } from '../lib/storage'
import { useMediaQuery } from '../hooks/useMediaQuery'

export type ThemeChoice = 'light' | 'dark' | 'system'

export interface Settings {
  theme: ThemeChoice
  reduceMotion: boolean
  showGrid: boolean
  defaultSpeed: number
}

export interface RecentTopic {
  title: string
  path: string
  group: string
  at: number
}

export interface QuizResult {
  correct: number
  total: number
  answers: Record<string, number>
  updatedAt: number
}

interface AppStateValue {
  settings: Settings
  resolvedTheme: 'light' | 'dark'
  reduceMotion: boolean
  updateSettings: (patch: Partial<Settings>) => void
  toggleTheme: () => void
  recents: RecentTopic[]
  recordRecent: (item: Omit<RecentTopic, 'at'>) => void
  clearRecents: () => void
  explored: string[]
  markExplored: (slug: string) => void
  quizzes: Record<string, QuizResult>
  saveQuiz: (slug: string, result: Omit<QuizResult, 'updatedAt'>) => void
  resetLocalData: () => void
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  reduceMotion: false,
  showGrid: true,
  defaultSpeed: 2,
}

const AppStateContext = createContext<AppStateValue | null>(null)

function normaliseSettings(input: unknown): Settings {
  if (!input || typeof input !== 'object') return DEFAULT_SETTINGS
  const parsed = input as Partial<Settings>
  const theme: ThemeChoice =
    parsed.theme === 'dark' || parsed.theme === 'system' || parsed.theme === 'light'
      ? parsed.theme
      : DEFAULT_SETTINGS.theme
  return {
    theme,
    reduceMotion: typeof parsed.reduceMotion === 'boolean' ? parsed.reduceMotion : false,
    showGrid: typeof parsed.showGrid === 'boolean' ? parsed.showGrid : true,
    defaultSpeed:
      typeof parsed.defaultSpeed === 'number' && parsed.defaultSpeed >= 0.5 && parsed.defaultSpeed <= 8
        ? parsed.defaultSpeed
        : DEFAULT_SETTINGS.defaultSpeed,
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() =>
    normaliseSettings(readJSON('settings.v1', DEFAULT_SETTINGS)),
  )
  const [recents, setRecents] = useState<RecentTopic[]>(() =>
    readJSON<RecentTopic[]>('recents.v1', []),
  )
  const [explored, setExplored] = useState<string[]>(() =>
    readJSON<string[]>('explored.v1', []),
  )
  const [quizzes, setQuizzes] = useState<Record<string, QuizResult>>(() =>
    readJSON('quizzes.v1', {}),
  )

  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')
  const systemReduce = useMediaQuery('(prefers-reduced-motion: reduce)')

  const resolvedTheme: 'light' | 'dark' =
    settings.theme === 'system' ? (systemDark ? 'dark' : 'light') : settings.theme

  const reduceMotion = settings.reduceMotion || systemReduce

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.classList.toggle('reduce-motion', reduceMotion)
    root.classList.toggle('no-grid', !settings.showGrid)
    root.dataset.theme = resolvedTheme
    writeJSON('settings.v1', settings)
  }, [resolvedTheme, reduceMotion, settings])

  useEffect(() => {
    writeJSON('recents.v1', recents)
  }, [recents])

  useEffect(() => {
    writeJSON('explored.v1', explored)
  }, [explored])

  useEffect(() => {
    writeJSON('quizzes.v1', quizzes)
  }, [quizzes])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => normaliseSettings({ ...current, ...patch }))
  }, [])

  const toggleTheme = useCallback(() => {
    setSettings((current) => ({
      ...current,
      theme: current.theme === 'dark' ? 'light' : 'dark',
    }))
  }, [])

  const recordRecent = useCallback((item: Omit<RecentTopic, 'at'>) => {
    setRecents((current) => {
      const entry: RecentTopic = { ...item, at: Date.now() }
      const filtered = current.filter((entryItem) => entryItem.path !== item.path)
      return [entry, ...filtered].slice(0, 6)
    })
  }, [])

  const clearRecents = useCallback(() => setRecents([]), [])

  const markExplored = useCallback((slug: string) => {
    setExplored((current) => (current.includes(slug) ? current : [...current, slug]))
  }, [])

  const saveQuiz = useCallback((slug: string, result: Omit<QuizResult, 'updatedAt'>) => {
    setQuizzes((current) => ({
      ...current,
      [slug]: { ...result, updatedAt: Date.now() },
    }))
  }, [])

  const resetLocalData = useCallback(() => {
    setRecents([])
    setExplored([])
    setQuizzes({})
    setSettings(DEFAULT_SETTINGS)
    removeStored('recents.v1')
    removeStored('explored.v1')
    removeStored('quizzes.v1')
    writeJSON('settings.v1', DEFAULT_SETTINGS)
  }, [])

  const value = useMemo<AppStateValue>(
    () => ({
      settings,
      resolvedTheme,
      reduceMotion,
      updateSettings,
      toggleTheme,
      recents,
      recordRecent,
      clearRecents,
      explored,
      markExplored,
      quizzes,
      saveQuiz,
      resetLocalData,
    }),
    [
      settings,
      resolvedTheme,
      reduceMotion,
      updateSettings,
      toggleTheme,
      recents,
      recordRecent,
      clearRecents,
      explored,
      markExplored,
      quizzes,
      saveQuiz,
      resetLocalData,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const context = useContext(AppStateContext)
  if (!context) throw new Error('useAppState must be used inside AppStateProvider')
  return context
}
