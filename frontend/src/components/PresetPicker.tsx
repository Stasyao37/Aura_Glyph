import { useEffect, useRef, useState } from "react"
import { LayoutTemplate } from "lucide-react"
import { BUILT_IN_PRESETS, type Preset } from "../presets"

interface PresetPickerProps {
  activePresetId: string
  onApply:        (preset: Preset) => void
}

export default function PresetPicker({ activePresetId, onApply }: PresetPickerProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  return (
    <div className="relative" ref={rootRef}>

      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Пресеты оформления"
        className={`
          flex items-center gap-1.5 h-7 px-2 rounded-md text-[11px] shrink-0
          transition-all duration-150
          ${open
            ? "bg-accent/20 text-accent-light border border-accent/30"
            : "text-text-muted hover:bg-white/[0.07] hover:text-text-primary border border-transparent"
          }
        `}
      >
        <LayoutTemplate size={13} />
        <span>Пресет</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-52 z-[200]
                     rounded-xl border border-white/8
                     shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
          style={{ background: "rgba(12, 12, 18, 0.94)", backdropFilter: "blur(20px)" }}
        >
          <div className="p-1.5 flex flex-col gap-0.5">
            {BUILT_IN_PRESETS.map(preset => (
              <PresetCard
                key={preset.id}
                preset={preset}
                active={preset.id === activePresetId}
                onClick={() => { onApply(preset); setOpen(false) }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PresetCard({ preset, active, onClick }: {
  preset: Preset
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150
        ${active
          ? "bg-accent/15 border border-accent/25"
          : "hover:bg-white/[0.05] border border-transparent"
        }
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-text-primary">{preset.name}</span>
        {active && <span className="w-1.5 h-1.5 rounded-full bg-accent-light shrink-0" />}
      </div>
      <span
        className="text-[11px] text-text-muted mt-0.5 block"
        style={{ fontFamily: preset.fontFamily }}
      >
        {preset.sample}
      </span>
    </button>
  )
}
