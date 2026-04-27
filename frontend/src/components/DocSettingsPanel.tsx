import { useEffect, useRef, useState } from "react"
import { Settings } from "lucide-react"
import { type DocSettings } from "../presets"

interface Props {
  docSettings: DocSettings
  onChange:    (s: DocSettings) => void
}

export default function DocSettingsPanel({ docSettings, onChange }: Props) {
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

  function set(key: keyof DocSettings, value: string | boolean) {
    onChange({ ...docSettings, [key]: value })
  }

  const s = docSettings

  return (
    <div className="relative" ref={rootRef}>

      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Колонтитулы"
        className={`
          flex items-center gap-1.5 h-7 px-2 rounded-md text-[11px] shrink-0
          border transition-all duration-150
          ${open
            ? "bg-accent/20 text-accent-light border-accent/30"
            : "text-text-muted hover:bg-white/[0.07] hover:text-text-primary border-transparent"
          }
        `}
      >
        <Settings size={13} />
        <span>Колонтитулы</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-200 rounded-xl border border-white/8
                     shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
          style={{ width: 400, background: "rgba(12,12,18,0.97)", backdropFilter: "blur(20px)" }}
        >
          <div className="p-4 flex flex-col gap-3">

            {/* Variable hints */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-text-subtle">Переменные:</span>
              {["{page}", "{total}", "{filename}"].map(v => (
                <span key={v} className="px-1.5 py-0.5 rounded text-[10px] font-mono
                                         text-text-muted bg-white/5 border border-white/8">
                  {v}
                </span>
              ))}
            </div>

            <div className="h-px bg-white/6" />

            <Zone
              label="ВЕРХНИЙ КОЛОНТИТУЛ"
              left={s.headerLeft}     onLeft={v   => set("headerLeft",   v)}
              center={s.headerCenter} onCenter={v => set("headerCenter", v)}
              right={s.headerRight}   onRight={v  => set("headerRight",  v)}
            />

            <Zone
              label="НИЖНИЙ КОЛОНТИТУЛ"
              left={s.footerLeft}     onLeft={v   => set("footerLeft",   v)}
              center={s.footerCenter} onCenter={v => set("footerCenter", v)}
              right={s.footerRight}   onRight={v  => set("footerRight",  v)}
            />

            <div className="h-px bg-white/6" />

            {/* Special first page toggle */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={s.specialFirstPage}
                onChange={e => set("specialFirstPage", e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[#3B82F6] cursor-pointer"
              />
              <span className="text-[11px] text-text-muted group-hover:text-text-primary transition-colors">
                Особый колонтитул первой страницы
              </span>
            </label>

            {s.specialFirstPage && (
              <>
                <Zone
                  label="ВЕРХНИЙ — СТРАНИЦА 1"
                  left={s.firstHeaderLeft}     onLeft={v   => set("firstHeaderLeft",   v)}
                  center={s.firstHeaderCenter} onCenter={v => set("firstHeaderCenter", v)}
                  right={s.firstHeaderRight}   onRight={v  => set("firstHeaderRight",  v)}
                />
                <Zone
                  label="НИЖНИЙ — СТРАНИЦА 1"
                  left={s.firstFooterLeft}     onLeft={v   => set("firstFooterLeft",   v)}
                  center={s.firstFooterCenter} onCenter={v => set("firstFooterCenter", v)}
                  right={s.firstFooterRight}   onRight={v  => set("firstFooterRight",  v)}
                />
              </>
            )}

          </div>
        </div>
      )}
    </div>
  )
}

/* ── Helpers ── */

function Zone({ label, left, onLeft, center, onCenter, right, onRight }: {
  label:    string
  left:     string; onLeft:   (v: string) => void
  center:   string; onCenter: (v: string) => void
  right:    string; onRight:  (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[9px] font-semibold tracking-widest text-text-subtle uppercase">
        {label}
      </span>
      <div className="grid grid-cols-3 gap-1.5">
        <SI value={left}   onChange={onLeft}   placeholder="Лево" />
        <SI value={center} onChange={onCenter} placeholder="Центр" />
        <SI value={right}  onChange={onRight}  placeholder="Право" />
      </div>
    </div>
  )
}

function SI({ value, onChange, placeholder }: {
  value:       string
  onChange:    (v: string) => void
  placeholder: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-6 px-2 w-full rounded text-[11px] text-text-primary
                 bg-white/5 border border-white/8 placeholder:text-text-subtle
                 focus:outline-none focus:border-accent/40 focus:bg-accent/5
                 transition-colors"
      style={{ userSelect: "text" }}
    />
  )
}
