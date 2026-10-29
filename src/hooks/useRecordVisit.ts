import { useEffect } from 'react'
import { useAppState } from '../state/AppState'

interface VisitDescriptor {
  title: string
  path: string
  group: string
}

export function useRecordVisit({ title, path, group }: VisitDescriptor): void {
  const { recordRecent } = useAppState()

  useEffect(() => {
    recordRecent({ title, path, group })
  }, [recordRecent, title, path, group])
}
