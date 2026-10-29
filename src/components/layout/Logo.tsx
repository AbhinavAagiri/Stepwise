import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link to="/" className="brand" aria-label="Stepwise home">
      <span className="brand-mark" aria-hidden="true">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="9" width="3" height="5.5" fill="currentColor" />
          <rect x="6.5" y="5.5" width="3" height="9" fill="currentColor" opacity="0.85" />
          <rect x="11.5" y="2" width="3" height="12.5" fill="currentColor" opacity="0.66" />
          <path d="M1.5 6.5h3M6.5 3h3M11.5 0.5h3" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </svg>
      </span>
      <span className="brand-name">stepwise</span>
    </Link>
  )
}
