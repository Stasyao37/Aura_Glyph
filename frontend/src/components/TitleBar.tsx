import {
  WindowMinimise,
  WindowToggleMaximise,
  Quit,
} from "../../wailsjs/runtime/runtime"

interface TitleBarProps {
  filename?: string
  isDirty?: boolean
}

const drag   = { "--wails-draggable": "drag"    } as React.CSSProperties
const noDrag = { "--wails-draggable": "no-drag" } as React.CSSProperties

export default function TitleBar({ filename, isDirty }: TitleBarProps) {
  return (
    <header
      className="relative flex items-center h-10 shrink-0
                 bg-[#101012]/80 backdrop-blur-xl
                 border-b border-white/[0.06]"
    >
      {/* Subtle accent line at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1E40AF]/60 to-transparent" />

      {/* Left — app name (not draggable so clicks register) */}
      <div className="flex items-center gap-2 px-4 w-44 shrink-0" style={noDrag}>
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase
                         bg-gradient-to-r from-[#2DD4BF] to-[#7C3AED]
                         bg-clip-text text-transparent select-none">
          Aura Glyph
        </span>
      </div>

      {/* Center — filename, fills as drag region */}
      <div
        className="flex-1 flex items-center justify-center h-full cursor-default"
        style={drag}
      >
        {filename && (
          <span className="text-[12px] text-[#5A5A6A] select-none">
            {filename}
            {isDirty && (
              <span className="ml-1 text-[#3B82F6]">•</span>
            )}
          </span>
        )}
      </div>

      {/* Right — window controls */}
      <div className="flex items-center w-44 justify-end shrink-0" style={noDrag}>
        <WinButton onClick={WindowMinimise} label="−" />
        <WinButton onClick={WindowToggleMaximise} label="⬜" small />
        <WinButton onClick={Quit} label="✕" isClose />
      </div>
    </header>
  )
}

function WinButton({
  onClick,
  label,
  isClose = false,
  small = false,
}: {
  onClick: () => void
  label: string
  isClose?: boolean
  small?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center w-11 h-10 text-[13px]
        text-[#5A5A6A] transition-all duration-150
        ${small ? "text-[10px]" : ""}
        ${isClose
          ? "hover:bg-red-500/15 hover:text-red-400 hover:[box-shadow:0_0_12px_rgba(239,68,68,0.3)]"
          : "hover:bg-white/[0.06] hover:text-[#EDEDF0]"
        }
      `}
    >
      {label}
    </button>
  )
}
