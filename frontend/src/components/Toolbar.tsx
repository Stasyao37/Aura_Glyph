import { useEffect, useRef, useState, type RefObject } from "react"
import { useModal } from "../hooks/useModal"
import {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered,
  Link, Table, FileDown,
  Code2, Columns2, Eye, Palette, ChevronDown, Settings,
} from "lucide-react"
import type { EditorHandle } from "./Editor"
import PresetPicker from "./PresetPicker"
import DocSettingsPanel from "./DocSettingsPanel"
import FileMenu from "./FileMenu"
import type { Preset, DocSettings } from "../presets"
import SettingsPanel from "./SettingsPanel"

export type ViewMode = "source" | "split" | "preview"

interface ToolbarProps {
  editorRef:            RefObject<EditorHandle | null>
  viewMode:             ViewMode
  onViewModeChange:     (mode: ViewMode) => void
  fontFamily:           string
  onFontFamilyChange:   (f: string) => void
  fontSize:             string
  onFontSizeChange:     (s: string) => void
  activePresetId:       string
  onApplyPreset:        (preset: Preset) => void
  isPageMode:           boolean
  docSettings:          DocSettings
  onDocSettingsChange:  (s: DocSettings) => void
  onNew:                () => void
  onOpen:               () => void
  onSave:               () => void
  onSaveAs:             () => void
}

const HEADING_OPTIONS = [
  { value: "0", label: "Параграф" },
  { value: "1", label: "Заголовок 1" },
  { value: "2", label: "Заголовок 2" },
  { value: "3", label: "Заголовок 3" },
  { value: "4", label: "Заголовок 4" },
]

const FONT_FAMILY_OPTIONS = [
  { value: "Inter, system-ui, sans-serif",   label: "Sans-serif" },
  { value: "'Times New Roman', Times, serif", label: "Times New Roman" },
  { value: "Arial, Helvetica, sans-serif",   label: "Arial" },
  { value: "Georgia, serif",                 label: "Georgia" },
]

const FONT_SIZE_OPTIONS = [
  { value: "12px", label: "12pt" },
  { value: "13px", label: "13pt" },
  { value: "14px", label: "14pt" },
  { value: "15px", label: "15pt" },
  { value: "16px", label: "16pt" },
]

const TABLE_TEMPLATE = `
| Заголовок 1 | Заголовок 2 | Заголовок 3 |
|-------------|-------------|-------------|
| Ячейка      | Ячейка      | Ячейка      |
| Ячейка      | Ячейка      | Ячейка      |
`

export default function Toolbar({
  editorRef, viewMode, onViewModeChange,
  fontFamily, onFontFamilyChange,
  fontSize, onFontSizeChange,
  activePresetId, onApplyPreset,
  isPageMode, docSettings, onDocSettingsChange,
  onNew, onOpen, onSave, onSaveAs,
}: ToolbarProps) {
  const ed = () => editorRef.current
  const modal = useModal()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  function heading(level: string) {
    if (level === "0") { ed()?.clearLinePrefix(); return }
    ed()?.insertAtLineStart("#".repeat(Number(level)) + " ")
  }

  async function insertLink() {
    const result = await modal.prompt({
      title: "Вставить ссылку",
      fields: [{ id: "url", label: "URL", placeholder: "https://..." }],
    })
    if (!result?.url) return
    ed()?.wrapSelection("[", `](${result.url})`)
  }

  function insertTOC() {
    ed()?.insertAtCursor("## Содержание\n\n<!-- TOC -->\n\n")
  }

  function wrapAlign(align: string) {
    ed()?.wrapSelection(`<div align="${align}">\n\n`, "\n\n</div>")
  }

  function onColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    ed()?.wrapSelection(`<span style="color:${e.target.value}">`, "</span>")
  }

  return (
    <>
      <div className="flex items-center h-11 shrink-0 px-2 gap-0.5">

        {/* File menu */}
        <FileMenu onNew={onNew} onOpen={onOpen} onSave={onSave} onSaveAs={onSaveAs} />
        <Sep />

        {/* Heading */}
        <GlassDropdown
          value="0"
          onChange={(val) => heading(val)}
          options={HEADING_OPTIONS}
          style={{ minWidth: 104 }}
        />

        <Sep />

        {/* Font family */}
        <GlassDropdown
          value={fontFamily}
          onChange={onFontFamilyChange}
          options={FONT_FAMILY_OPTIONS}
          style={{ minWidth: 118 }}
        />

        {/* Font size */}
        <GlassDropdown
          value={fontSize}
          onChange={onFontSizeChange}
          options={FONT_SIZE_OPTIONS}
          style={{ minWidth: 66 }}
        />

        <Sep />

        {/* Bold / Italic / Underline */}
        <Btn title="Жирный"       onClick={() => ed()?.wrapSelection("**", "**")}        glow><Bold       size={14} /></Btn>
        <Btn title="Курсив"       onClick={() => ed()?.wrapSelection("*",  "*")}         glow><Italic     size={14} /></Btn>
        <Btn title="Подчёркнутый" onClick={() => ed()?.wrapSelection("<u>", "</u>")}     glow><Underline  size={14} /></Btn>

        {/* Color picker — label wraps hidden input so click всегда работает */}
        <label
          title="Цвет текста"
          className="relative flex items-center justify-center w-7 h-7 rounded-md shrink-0
                     text-[var(--color-text-muted)] cursor-pointer transition-all duration-150
                     border border-transparent
                     hover:bg-[var(--glass-border)] hover:text-[var(--color-text-primary)] active:scale-95
                     hover:shadow-[0_0_10px_rgba(30,64,175,0.4)] hover:border-accent/30"
        >
          <Palette size={14} />
          <input type="color" className="sr-only" onChange={onColorChange} />
        </label>

        <Sep />

        {/* Alignment */}
        <Btn title="По левому краю"   onClick={() => wrapAlign("left")}   ><AlignLeft    size={14} /></Btn>
        <Btn title="По центру"        onClick={() => wrapAlign("center")} ><AlignCenter  size={14} /></Btn>
        <Btn title="По правому краю"  onClick={() => wrapAlign("right")}  ><AlignRight   size={14} /></Btn>
        <Btn title="По ширине (ГОСТ)" onClick={() => wrapAlign("justify")}><AlignJustify size={14} /></Btn>

        <Sep />

        {/* Lists */}
        <Btn title="Маркированный список" onClick={() => ed()?.insertAtLineStart("- ")}  ><List        size={14} /></Btn>
        <Btn title="Нумерованный список"  onClick={() => ed()?.insertAtLineStart("1. ")} ><ListOrdered size={14} /></Btn>

        <Sep />

        {/* Insert */}
        <Btn title="Ссылка"       onClick={insertLink}><Link  size={14} /></Btn>
        <Btn title="Таблица"      onClick={() => ed()?.insertAtCursor(TABLE_TEMPLATE)}><Table size={14} /></Btn>
        <Btn title="Оглавление"   onClick={insertTOC}>
          <span className="text-[10px] font-semibold leading-none tracking-tight">TOC</span>
        </Btn>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-1">
          {isPageMode && (
            <>
              <DocSettingsPanel docSettings={docSettings} onChange={onDocSettingsChange} />
              <Sep />
            </>
          )}
          <PresetPicker activePresetId={activePresetId} onApply={onApplyPreset} />
          <Sep />
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-[var(--glass-border)] overflow-hidden
                          shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
            <ViewBtn active={viewMode === "source"}  onClick={() => onViewModeChange("source")}  title="Редактор"><Code2   size={13} /></ViewBtn>
            <ViewBtn active={viewMode === "split"}   onClick={() => onViewModeChange("split")}   title="Split">  <Columns2 size={13} /></ViewBtn>
            <ViewBtn active={viewMode === "preview"} onClick={() => onViewModeChange("preview")} title="Превью"> <Eye      size={13} /></ViewBtn>
          </div>

          <Sep />

          <Btn title="Настройки" onClick={() => setIsSettingsOpen(v => !v)} glow>
            <Settings size={14} />
          </Btn>

          <Btn title="Экспорт PDF" onClick={() => void modal.info({
            title: "PDF-экспорт",
            message: "Функция в разработке — появится в следующем обновлении.",
          })}>
            <FileDown size={14} />
          </Btn>
        </div>
      </div>
      {isSettingsOpen && <SettingsPanel onClose={() => setIsSettingsOpen(false)} />}
    </>
  )
}

/* ── Primitives ── */

function Sep() {
  return <div className="w-px h-5 bg-white/[0.07] mx-1 shrink-0" />
}

function GlassDropdown({ value, onChange, options, style }: {
  value:   string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  style?:  React.CSSProperties
}) {
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

  const label = options.find(o => o.value === value)?.label ?? value

  return (
    <div className="relative shrink-0" ref={rootRef} style={style}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`
          flex items-center justify-between gap-1 w-full h-7 px-2 rounded-md text-[11px]
          border transition-all duration-150
          ${open
            ? "bg-[var(--color-accent)]/15 text-[var(--color-text-primary)] border-[var(--color-accent)]/25"
            : "bg-[var(--glass-bg)]/20 text-[var(--color-text-muted)] border-[var(--glass-border)] hover:bg-[var(--glass-border)] hover:text-[var(--color-text-primary)]"
          }
        `}
      >
        <span className="truncate">{label}</span>
        <ChevronDown size={10} className="shrink-0 opacity-40" />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 min-w-full z-200
                     rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] frosted-glass-sm
                     shadow-[0_8px_32px_rgba(0,0,0,0.55)] overflow-hidden"
        >
          <div className="p-1 flex flex-col gap-px">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`
                  w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-colors duration-100
                  ${opt.value === value
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent-light)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--glass-border)] hover:text-[var(--color-text-primary)]"
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Btn({ children, onClick, title, glow = false }: {
  children: React.ReactNode
  onClick: () => void
  title?: string
  glow?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        flex items-center justify-center w-7 h-7 rounded-md shrink-0
        text-[var(--color-text-muted)] transition-all duration-150
        border border-transparent
        hover:bg-[var(--glass-border)] hover:text-[var(--color-text-primary)] active:scale-95
        ${glow
          ? "hover:shadow-[0_0_10px_rgba(30,64,175,0.4)] hover:border-accent/30"
          : ""
        }
      `}
    >
      {children}
    </button>
  )
}

function ViewBtn({ children, active, onClick, title }: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        flex items-center justify-center w-7 h-7 transition-all duration-150
        ${active
          ? "bg-[var(--color-accent)]/25 text-[var(--color-accent-light)] shadow-[0_0_12px_rgba(30,64,175,0.45)_inset]"
          : "text-[var(--color-text-muted)] hover:bg-[var(--glass-border)] hover:text-[var(--color-text-primary)]"
        }
      `}
    >
      {children}
    </button>
  )
}
