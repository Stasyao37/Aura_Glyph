import { Minus, Maximize2, X } from "lucide-react"
import {
  WindowMinimise,
  WindowToggleMaximise,
} from "../../wailsjs/runtime/runtime"
import { VERSION_LABEL } from "../version"

interface TitleBarProps {
  filename?:       string
  isDirty?:        boolean
  onCloseRequest?: () => void
}

const drag   = { "--wails-draggable": "drag"    } as React.CSSProperties
const noDrag = { "--wails-draggable": "no-drag" } as React.CSSProperties

export default function TitleBar({ filename, isDirty, onCloseRequest }: TitleBarProps) {
  return (
    <header className="relative flex items-center h-10 shrink-0">
      {/* Theme-aware accent line at top edge */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: 'var(--titlebar-accent)' }}
      />

      {/* Left — version label */}
      <div className="flex items-center gap-2 px-4 w-44 shrink-0" style={noDrag}>
        <span
          className="text-[11px] font-semibold tracking-[0.18em] uppercase select-none"
          style={{ color: "var(--color-aura-blue)" }}
        >
          {VERSION_LABEL}
        </span>
      </div>

      {/* Center — filename + dirty indicator (drag region) */}
      <div
        className="flex-1 flex items-center justify-center h-full cursor-default"
        style={drag}
      >
        {filename && (
          <span
            className="text-[12px] select-none"
            style={{ color: "var(--color-text-muted)" }}
          >
            {filename}
            {isDirty && (
              <span className="ml-1" style={{ color: "var(--color-aura-blue)" }}>•</span>
            )}
          </span>
        )}
      </div>

      {/* Right — window controls */}
      <div className="flex items-center w-44 justify-end shrink-0" style={noDrag}>
        <WinButton onClick={WindowMinimise}><Minus size={13} /></WinButton>
        <WinButton onClick={WindowToggleMaximise}><Maximize2 size={11} /></WinButton>
        <WinButton onClick={onCloseRequest ?? (() => {})} isClose><X size={13} /></WinButton>
      </div>
    </header>
  )
}

function WinButton({
  children,
  onClick,
  isClose = false,
}: {
  children: React.ReactNode
  onClick: () => void
  isClose?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center w-11 h-10
        transition-all duration-150
        ${isClose
          ? "hover:bg-red-500/15 hover:text-red-400 hover:[box-shadow:var(--glow-close)]"
          : "hover:bg-white/[0.06] hover:text-[var(--color-text-primary)]"
        }
      `}
      style={{ color: "var(--color-text-subtle)" }}
    >
      {children}
    </button>
  )
}
