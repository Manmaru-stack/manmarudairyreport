import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { GripHorizontal, X } from "lucide-react"

const POSITION_STORAGE_KEY = "floating-form-panel-position"
const DEFAULT_PANEL_WIDTH = 560
const DEFAULT_TOP = 96
const EDGE_MARGIN = 8

type Position = { x: number; y: number }

function clampPosition(pos: Position, panelWidth: number): Position {
  const maxX = Math.max(EDGE_MARGIN, window.innerWidth - panelWidth - EDGE_MARGIN)
  const maxY = Math.max(EDGE_MARGIN, window.innerHeight - 56)
  return {
    x: Math.min(Math.max(EDGE_MARGIN, pos.x), maxX),
    y: Math.min(Math.max(EDGE_MARGIN, pos.y), maxY),
  }
}

function readSavedPosition(): Position | null {
  try {
    const raw = window.localStorage.getItem(POSITION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Position>
    if (typeof parsed.x === "number" && typeof parsed.y === "number") {
      return { x: parsed.x, y: parsed.y }
    }
    return null
  } catch {
    return null
  }
}

function saveSavedPosition(pos: Position) {
  try {
    window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(pos))
  } catch {
    // 保存できなくても表示には影響させない
  }
}

interface FloatingFormPanelProps {
  open: boolean
  title: string
  onClose: () => void
  onSave: () => void
  saveLabel?: string
  cancelLabel?: string
  isSaving?: boolean
  footerExtra?: ReactNode
  children: ReactNode
}

/**
 * 背面の画面を隠さない、ドラッグで移動できるフォームパネル。
 * 外側クリックや Esc では閉じない（入力途中の内容を失わないため）。
 * 閉じるのは「×」「キャンセル」のみ。
 */
export function FloatingFormPanel({
  open,
  title,
  onClose,
  onSave,
  saveLabel = "保存",
  cancelLabel = "キャンセル",
  isSaving = false,
  footerExtra,
  children,
}: FloatingFormPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const dragOffsetRef = useRef<{ dx: number; dy: number } | null>(null)
  const [position, setPosition] = useState<Position | null>(null)
  const [dragging, setDragging] = useState(false)

  const currentWidth = () => panelRef.current?.offsetWidth ?? DEFAULT_PANEL_WIDTH

  useEffect(() => {
    if (!open) return
    const saved = readSavedPosition()
    const width = currentWidth()
    setPosition(
      clampPosition(saved ?? { x: window.innerWidth - width - 24, y: DEFAULT_TOP }, width),
    )
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleResize = () => {
      setPosition((prev) => (prev ? clampPosition(prev, currentWidth()) : prev))
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [open])

  if (!open) return null

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return
    const rect = panelRef.current?.getBoundingClientRect()
    if (!rect) return
    dragOffsetRef.current = { dx: event.clientX - rect.left, dy: event.clientY - rect.top }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const offset = dragOffsetRef.current
    if (!offset) return
    setPosition(
      clampPosition(
        { x: event.clientX - offset.dx, y: event.clientY - offset.dy },
        currentWidth(),
      ),
    )
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragOffsetRef.current) return
    dragOffsetRef.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (position) saveSavedPosition(position)
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={title}
      className="fixed z-[45] flex max-h-[80vh] min-w-[320px] flex-col rounded-xl border border-border bg-background shadow-2xl"
      style={{
        width: "min(40vw, calc(100vw - 16px))",
        ...(position ? { left: position.x, top: position.y } : { right: 24, top: DEFAULT_TOP }),
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`flex touch-none select-none items-center justify-between gap-3 rounded-t-xl border-b border-border bg-primary/10 px-5 py-3 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        title="ドラッグで移動できます"
      >
        <div className="flex min-w-0 items-center gap-2">
          <GripHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
          <h2 className="truncate text-lg font-semibold text-foreground">{title}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="閉じる" disabled={isSaving}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

      <div className="flex items-center justify-between gap-3 rounded-b-xl border-t border-border bg-muted/30 px-5 py-3">
        <div>{footerExtra}</div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            {cancelLabel}
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "保存中..." : saveLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
