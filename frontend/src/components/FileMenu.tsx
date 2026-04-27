import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

interface FileMenuProps {
  onNew:    () => void
  onOpen:   () => void
  onSave:   () => void
  onSaveAs: () => void
}

export default function FileMenu({ onNew, onOpen, onSave, onSaveAs }: FileMenuProps) {
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

  function act(fn: () => void) {
    setOpen(false)
    fn()
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`
          flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] shrink-0
          border transition-all duration-150
          ${open
            ? "bg-accent/20 text-accent-light border-accent/30"
            : "text-text-muted hover:bg-white/[0.07] hover:text-text-primary border-transparent"
          }
        `}
      >
        <span>Файл</span>
        <ChevronDown size={10} className="opacity-50" />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-200 rounded-xl border border-white/8
                     shadow-[0_8px_32px_rgba(0,0,0,0.55)] overflow-hidden"
          style={{ width: 224, background: "rgba(12,12,18,0.95)", backdropFilter: "blur(20px)" }}
        >
          <div className="p-1.5 flex flex-col">
            <Item label="Создать"        hint="Ctrl N"   onClick={() => act(onNew)}    />
            <div className="h-px bg-white/6 my-1 mx-2" />
            <Item label="Открыть..."     hint="Ctrl O"   onClick={() => act(onOpen)}   />
            <div className="h-px bg-white/6 my-1 mx-2" />
            <Item label="Сохранить"      hint="Ctrl S"   onClick={() => act(onSave)}   />
            <Item label="Сохранить как…" hint="Ctrl ⇧ S" onClick={() => act(onSaveAs)} />
          </div>
        </div>
      )}
    </div>
  )
}

function Item({ label, hint, onClick }: {
  label:   string
  hint:    string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-[12px]
                 text-text-muted hover:bg-white/6 hover:text-text-primary
                 transition-colors duration-100"
    >
      <span>{label}</span>
      <span className="text-[10px] text-text-subtle font-mono tracking-wide">{hint}</span>
    </button>
  )
}
