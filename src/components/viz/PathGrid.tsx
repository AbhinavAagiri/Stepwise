import { useEffect, useRef, useState } from 'react'
import { useElementSize } from '../../hooks/useElementSize'
import { useAppState } from '../../state/AppState'
import { WALL, WEIGHT, type GridModel, type PathFrame } from '../../engine/types'
import { pointOf } from '../../algorithms/pathfinding/grid'

export type GridTool = 'wall' | 'erase' | 'weight' | 'start' | 'end'

interface PathGridProps {
  grid: GridModel
  frame: PathFrame | null
  tool: GridTool
  onEdit: (index: number, tool: GridTool) => void
  showGrid: boolean
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function PathGrid({ grid, frame, tool, onEdit, showGrid }: PathGridProps) {
  const { ref, size } = useElementSize<HTMLDivElement>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const paintRef = useRef(false)
  const lastCellRef = useRef<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [cursor, setCursor] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const { resolvedTheme } = useAppState()

  const cellSize =
    size.width > 0 && size.height > 0
      ? Math.max(7, Math.floor(Math.min(size.width / grid.cols, size.height / grid.rows)))
      : 16
  const canvasWidth = cellSize * grid.cols
  const canvasHeight = cellSize * grid.rows

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || canvasWidth <= 0) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.floor(canvasWidth * dpr)
    canvas.height = Math.floor(canvasHeight * dpr)
    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const styles = getComputedStyle(document.documentElement)
    const color = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback

    const surface = color('--surface-raised', '#fbfaf6')
    const raised = color('--surface', '#f7f6f1')
    const ink = color('--ink', '#141917')
    const faint = color('--faint', '#858d86')
    const line = color('--line', '#d8d7ca')
    const accent = color('--accent', '#0d5c4a')
    const accentInk = color('--accent-ink', '#f4f9f5')
    const swap = color('--swap', '#9c3b23')
    const compareSoft = color('--compare-soft', '#f2e6c8')
    const compare = color('--compare', '#8a5a05')
    const slateSoft = color('--slate-soft', '#dee8eb')
    const slate = color('--slate', '#3c6579')
    const pivot = color('--pivot-fill', '#6a76c7')
    const pivotSoft = color('--pivot-soft', '#e3e4f1')

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.fillStyle = surface
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    const explored = frame?.explored
    const current = frame?.current ?? null
    const frontierSet = new Set(frame?.frontier ?? [])
    const pathSet = new Set(frame?.path ?? [])
    const start = grid.start
    const end = grid.end

    for (let index = 0; index < grid.cells.length; index += 1) {
      const { x, y } = pointOf(index, grid.cols)
      const px = x * cellSize
      const py = y * cellSize
      const cell = grid.cells[index]

      if (cell === WALL) {
        ctx.fillStyle = ink
        ctx.fillRect(px, py, cellSize, cellSize)
        ctx.strokeStyle = raised
        ctx.globalAlpha = 0.18
        ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1)
        ctx.globalAlpha = 1
        continue
      }

      if (cell === WEIGHT) {
        ctx.fillStyle = compareSoft
        ctx.fillRect(px, py, cellSize, cellSize)
        ctx.fillStyle = compare
        const dotR = Math.max(0.8, cellSize * 0.045)
        for (let dot = 0; dot < 3; dot += 1) {
          const dx = px + cellSize * (0.28 + dot * 0.22)
          const dy = py + cellSize * 0.28
          ctx.beginPath()
          ctx.arc(dx, dy, dotR, 0, Math.PI * 2)
          ctx.fill()
        }
        if (cellSize >= 16) {
          ctx.fillStyle = compare
          ctx.font = `${Math.max(7, Math.floor(cellSize * 0.28))}px "JetBrains Mono Variable", monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('5', px + cellSize / 2, py + cellSize * 0.68)
        }
      }

      if (explored?.[index]) {
        ctx.fillStyle = slateSoft
        ctx.fillRect(px, py, cellSize, cellSize)
        ctx.fillStyle = slate
        ctx.globalAlpha = 0.35
        ctx.fillRect(px + cellSize * 0.42, py + cellSize * 0.42, Math.max(1, cellSize * 0.16), Math.max(1, cellSize * 0.16))
        ctx.globalAlpha = 1
      }

      if (frontierSet.has(index)) {
        ctx.fillStyle = compareSoft
        ctx.globalAlpha = 0.85
        ctx.fillRect(px, py, cellSize, cellSize)
        ctx.globalAlpha = 1
        ctx.strokeStyle = compare
        ctx.lineWidth = 1
        ctx.strokeRect(px + 1.5, py + 1.5, cellSize - 3, cellSize - 3)
      }

      if (current === index) {
        ctx.fillStyle = pivot
        ctx.fillRect(px, py, cellSize, cellSize)
        ctx.strokeStyle = pivotSoft
        ctx.lineWidth = 1
        ctx.strokeRect(px + 2.5, py + 2.5, cellSize - 5, cellSize - 5)
      }

      if (pathSet.has(index) && index !== start && index !== end) {
        ctx.fillStyle = accent
        ctx.globalAlpha = 0.85
        const pad = cellSize * 0.34
        ctx.fillRect(px + pad, py + pad, cellSize - pad * 2, cellSize - pad * 2)
        ctx.globalAlpha = 1
      }
    }

    if (frame?.path && frame.path.length > 1) {
      ctx.strokeStyle = accent
      ctx.lineWidth = Math.max(2, cellSize * 0.16)
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.beginPath()
      frame.path.forEach((index, position) => {
        const { x, y } = pointOf(index, grid.cols)
        const cx = x * cellSize + cellSize / 2
        const cy = y * cellSize + cellSize / 2
        if (position === 0) ctx.moveTo(cx, cy)
        else ctx.lineTo(cx, cy)
      })
      ctx.stroke()
    }

    if (showGrid) {
      ctx.strokeStyle = line
      ctx.globalAlpha = 0.55
      ctx.lineWidth = 1
      for (let x = 0; x <= grid.cols; x += 1) {
        ctx.beginPath()
        ctx.moveTo(x * cellSize + 0.5, 0)
        ctx.lineTo(x * cellSize + 0.5, canvasHeight)
        ctx.stroke()
      }
      for (let y = 0; y <= grid.rows; y += 1) {
        ctx.beginPath()
        ctx.moveTo(0, y * cellSize + 0.5)
        ctx.lineTo(canvasWidth, y * cellSize + 0.5)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const drawTerminal = (index: number, label: string, fill: string) => {
      const { x, y } = pointOf(index, grid.cols)
      const inset = Math.max(1, cellSize * 0.12)
      roundedRect(
        ctx,
        x * cellSize + inset,
        y * cellSize + inset,
        cellSize - inset * 2,
        cellSize - inset * 2,
        Math.max(2, cellSize * 0.18),
      )
      ctx.fillStyle = fill
      ctx.fill()
      if (cellSize >= 13) {
        ctx.fillStyle = accentInk
        ctx.font = `600 ${Math.max(7, Math.floor(cellSize * 0.4))}px "JetBrains Mono Variable", monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2 + 0.5)
      }
    }

    drawTerminal(start, 'S', accent)
    drawTerminal(end, 'T', swap)

    const outline = (index: number, stroke: string, dashed: boolean) => {
      const { x, y } = pointOf(index, grid.cols)
      ctx.save()
      ctx.strokeStyle = stroke
      ctx.lineWidth = 2
      if (dashed) ctx.setLineDash([4, 3])
      ctx.strokeRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2)
      ctx.restore()
    }

    if (hover !== null && hover !== start && hover !== end) {
      outline(hover, accent, false)
    }
    if (cursor !== null) {
      outline(cursor, faint, true)
    }

    // Keep the current cell legible even at small cell sizes.
    if (current !== null && cellSize < 13) {
      ctx.fillStyle = pivotSoft
      ctx.fillRect(
        (current % grid.cols) * cellSize,
        Math.floor(current / grid.cols) * cellSize,
        cellSize,
        1,
      )
    }
  }, [grid, frame, hover, cursor, showGrid, resolvedTheme, canvasWidth, canvasHeight, cellSize])

  const locate = (event: React.PointerEvent<HTMLCanvasElement>): number | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * grid.cols)
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * grid.rows)
    if (x < 0 || y < 0 || x >= grid.cols || y >= grid.rows) return null
    return y * grid.cols + x
  }

  const describe = (index: number | null): string => {
    if (index === null) return 'Outside the grid.'
    const { x, y } = pointOf(index, grid.cols)
    const cell = grid.cells[index]
    const terrain = cell === WALL ? 'wall' : cell === WEIGHT ? 'rough terrain, cost 5' : 'open ground, cost 1'
    const role = index === grid.start ? ', start' : index === grid.end ? ', destination' : ''
    return `Column ${x + 1}, row ${y + 1}: ${terrain}${role}.`
  }

  const apply = (index: number, activeTool: GridTool) => {
    onEdit(index, activeTool)
    setAnnouncement(describe(index))
  }

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const index = locate(event)
    if (index === null) return
    event.preventDefault()
    const canvas = canvasRef.current
    canvas?.focus()
    paintRef.current = true
    lastCellRef.current = index
    canvas?.setPointerCapture(event.pointerId)
    apply(index, event.button === 2 || event.shiftKey ? 'erase' : tool)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const index = locate(event)
    setHover(index)
    if (!paintRef.current || index === null || index === lastCellRef.current) return
    lastCellRef.current = index
    apply(index, event.button === 2 || event.shiftKey ? 'erase' : tool)
  }

  const stopPainting = () => {
    paintRef.current = false
    lastCellRef.current = null
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    const base = cursor ?? grid.start
    const { x, y } = pointOf(base, grid.cols)
    let nextX = x
    let nextY = y
    if (event.key === 'ArrowLeft') nextX = Math.max(0, x - 1)
    else if (event.key === 'ArrowRight') nextX = Math.min(grid.cols - 1, x + 1)
    else if (event.key === 'ArrowUp') nextY = Math.max(0, y - 1)
    else if (event.key === 'ArrowDown') nextY = Math.min(grid.rows - 1, y + 1)
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      apply(base, tool)
      setCursor(base)
      return
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      apply(base, 'erase')
      setCursor(base)
      return
    } else {
      return
    }
    event.preventDefault()
    const next = nextY * grid.cols + nextX
    setCursor(next)
    setAnnouncement(describe(next))
  }

  return (
    <div className="path-canvas-wrap" ref={ref}>
      <canvas
        ref={canvasRef}
        className={`path-canvas tool-${tool}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopPainting}
        onPointerCancel={stopPainting}
        onPointerLeave={() => {
          setHover(null)
          stopPainting()
        }}
        onContextMenu={(event) => event.preventDefault()}
        onFocus={() => setCursor(grid.start)}
        onBlur={() => setCursor(null)}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="application"
        aria-label={`Interactive ${grid.cols} by ${grid.rows} pathfinding grid. Use arrow keys to move the cell cursor, Enter to apply the current tool, Delete to erase. Pointer users can drag to paint.`}
        aria-describedby="path-grid-announcer"
      />
      <p className="sr-only" id="path-grid-announcer" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
}
