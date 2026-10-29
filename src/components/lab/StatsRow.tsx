export interface StatItem {
  label: string
  value: string | number
  sub?: string
}

export function StatsRow({ items }: { items: StatItem[] }) {
  return (
    <div className="stat-grid">
      {items.map((item) => (
        <div className="stat" key={item.label}>
          <div className="stat-label">{item.label}</div>
          <div className="stat-value">
            {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            {item.sub && <span className="stat-sub"> {item.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
