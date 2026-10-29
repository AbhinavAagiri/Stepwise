import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { AppStateProvider } from './state/AppState'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/HomePage'
import { SortingPage } from './pages/SortingPage'
import { SearchingPage } from './pages/SearchingPage'
import { PathfindingPage } from './pages/PathfindingPage'
import { StructuresPage } from './pages/StructuresPage'
import { RecursionPage } from './pages/RecursionPage'
import { LearnPage, LearnTopicPage } from './pages/LearnPage'

function NotFoundPage() {
  return (
    <div className="page not-found-page">
      <p className="page-kicker">404</p>
      <h1 className="page-title">That route is off the grid.</h1>
      <p className="page-sub">
        The page does not exist, but the labs do. Pick a starting point and step through something.
      </p>
      <div className="not-found-links">
        <Link to="/" className="btn btn-sm btn-primary">
          Back home
        </Link>
        <Link to="/sorting/bubble-sort" className="btn btn-sm btn-outline">
          Open sorting
        </Link>
        <Link to="/learn" className="btn btn-sm btn-ghost">
          Read the notes
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="sorting" element={<Navigate to="/sorting/bubble-sort" replace />} />
            <Route path="sorting/:slug" element={<SortingPage />} />
            <Route path="searching" element={<Navigate to="/searching/linear-search" replace />} />
            <Route path="searching/:slug" element={<SearchingPage />} />
            <Route path="pathfinding" element={<PathfindingPage />} />
            <Route path="structures" element={<Navigate to="/structures/array" replace />} />
            <Route path="structures/:slug" element={<StructuresPage />} />
            <Route path="recursion" element={<Navigate to="/recursion/factorial" replace />} />
            <Route path="recursion/:slug" element={<RecursionPage />} />
            <Route path="learn" element={<LearnPage />} />
            <Route path="learn/:slug" element={<LearnTopicPage />} />
            <Route path="algorithms" element={<Navigate to="/sorting/bubble-sort" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AppStateProvider>
    </BrowserRouter>
  )
}
