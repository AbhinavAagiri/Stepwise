import { Link, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { NAV_GROUPS } from '../../content/navigation'
import { LEARN_TOPICS } from '../../content/learn'
import { useAppState } from '../../state/AppState'
import { cn } from '../../lib/cn'

interface NavLinksProps {
  onNavigate?: () => void
  animate?: boolean
  layoutId?: string
}

export function NavLinks({ onNavigate, animate = true, layoutId = 'sidebar-active' }: NavLinksProps) {
  const { pathname } = useLocation()
  const { explored, reduceMotion } = useAppState()
  const exploredTopics = explored.filter((slug) => LEARN_TOPICS.some((topic) => topic.slug === slug)).length

  return (
    <nav aria-label="Primary">
      {NAV_GROUPS.map((group, groupIndex) => (
        <div className="nav-group" key={group.label ?? `group-${groupIndex}`}>
          {group.label && <span className="nav-label">{group.label}</span>}
          {group.items.map((item) => {
            const active =
              item.to === '/' ? pathname === '/' : pathname === item.to || pathname.startsWith(`${item.to}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn('nav-item', active && 'is-current')}
                aria-current={active ? 'page' : undefined}
                onClick={onNavigate}
              >
                {active &&
                  (animate ? (
                    <motion.span
                      className="nav-active"
                      layoutId={layoutId}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: 'tween', duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }
                      }
                    />
                  ) : (
                    <span className="nav-active" />
                  ))}
                <Icon className="nav-icon" aria-hidden="true" />
                <span className="nav-item-text">{item.label}</span>
                {item.to === '/learn' && (
                  <span className="nav-count" aria-label={`${exploredTopics} of ${LEARN_TOPICS.length} topics explored`}>
                    {exploredTopics}/{LEARN_TOPICS.length}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
