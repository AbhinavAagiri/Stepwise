interface LegendItem {
  label: string
  color: string
  shape?: 'square' | 'line' | 'ring'
}

interface PlotLegendProps {
  items: LegendItem[]
  note?: string
}

export function PlotLegend({ items, note }: PlotLegendProps) {
  return (
    <div className="plot-legend" aria-label="Visual state legend">
      {items.map((item) => (
        <span className="legend-item" key={item.label} style={{ color: item.color }}>
          <span
            className={item.shape === 'line' ? 'legend-line' : 'legend-swatch'}
            style={
              item.shape === 'ring'
                ? { background: 'transparent', border: `1px solid ${item.color}` }
                : undefined
            }
            aria-hidden="true"
          />
          {item.label}
        </span>
      ))}
      {note && <span className="legend-note">{note}</span>}
    </div>
  )
}
