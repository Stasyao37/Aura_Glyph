import { useRef, type RefObject } from "react"
import {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered,
  Link, Table, FileDown,
  Code2, Columns2, Eye, Palette,
} from "lucide-react"
import type { EditorHandle } from "./Editor"

export type ViewMode = "source" | "split" | "preview"

interface ToolbarProps {
  editorRef:          RefObject<EditorHandle | null>
  viewMode:           ViewMode
  onViewModeChange:   (mode: ViewMode) => void
  fontFamily:         string
  onFontFamilyChange: (f: string) => void
  fontSize:           string
  onFontSizeChange:   (s: string) => void
}

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
}: ToolbarProps) {
  const ed = () => editorRef.current
  const colorRef = useRef<HTMLInputElement>(null)

  function heading(level: string) {
    if (level === "0") { ed()?.clearLinePrefix(); return }
    ed()?.insertAtLineStart("#".repeat(Number(level)) + " ")
  }

  function insertLink() {
    const url = prompt("URL ссылки:")
    if (!url) return
    ed()?.wrapSelection("[", `](${url})`)
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
    <div className="flex items-center h-11 shrink-0 px-2 gap-0.5 glass-panel">

      {/* Heading */}
      <GlassSelect value="0" onChange={(e) => heading(e.target.value)} style={{ minWidth: 96 }}>
        <option value="0">Параграф</option>
        <option value="1">Заголовок 1</option>
        <option value="2">Заголовок 2</option>
        <option value="3">Заголовок 3</option>
        <option value="4">Заголовок 4</option>
      </GlassSelect>

      <Sep />

      {/* Font family */}
      <GlassSelect value={fontFamily} onChange={(e) => onFontFamilyChange(e.target.value)} style={{ minWidth: 110 }}>
        <option value="Inter, system-ui, sans-serif">Sans-serif</option>
        <option value="'Times New Roman', Times, serif">Times New Roman</option>
        <option value="Arial, Helvetica, sans-serif">Arial</option>
        <option value="Georgia, serif">Georgia</option>
      </GlassSelect>

      {/* Font size */}
      <GlassSelect value={fontSize} onChange={(e) => onFontSizeChange(e.target.value)} style={{ minWidth: 62 }}>
        <option value="12px">12pt</option>
        <option value="13px">13pt</option>
        <option value="14px">14pt</option>
        <option value="16px">16pt</option>
      </GlassSelect>

      <Sep />

      {/* Bold / Italic / Underline */}
      <Btn title="Жирный"       onClick={() => ed()?.wrapSelection("**", "**")}        glow><Bold       size={14} /></Btn>
      <Btn title="Курсив"       onClick={() => ed()?.wrapSelection("*",  "*")}         glow><Italic     size={14} /></Btn>
      <Btn title="Подчёркнутый" onClick={() => ed()?.wrapSelection("<u>", "</u>")}     glow><Underline  size={14} /></Btn>

      {/* Color picker */}
      <input ref={colorRef} type="color" className="hidden" onChange={onColorChange} />
      <Btn title="Цвет текста" onClick={() => colorRef.current?.click()} glow>
        <Palette size={14} />
      </Btn>

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
        {/* View mode toggle */}
        <div className="flex items-center rounded-lg border border-white/8 overflow-hidden
                        shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <ViewBtn active={viewMode === "source"}  onClick={() => onViewModeChange("source")}  title="Редактор"><Code2   size={13} /></ViewBtn>
          <ViewBtn active={viewMode === "split"}   onClick={() => onViewModeChange("split")}   title="Split">  <Columns2 size={13} /></ViewBtn>
          <ViewBtn active={viewMode === "preview"} onClick={() => onViewModeChange("preview")} title="Превью"> <Eye      size={13} /></ViewBtn>
        </div>

        <Sep />

        <Btn title="Экспорт PDF" onClick={() => alert("PDF export — скоро")}>
          <FileDown size={14} />
        </Btn>
      </div>
    </div>
  )
}

/* ── Primitives ── */

function Sep() {
  return <div className="w-px h-5 bg-white/[0.07] mx-1 shrink-0" />
}

function GlassSelect({ children, value, onChange, style }: {
  children: React.ReactNode
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  style?: React.CSSProperties
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={style}
      className="h-7 px-2 rounded-md text-[11px] text-text-muted
                 bg-white/4 border border-white/[0.07] cursor-pointer
                 hover:bg-white/[0.07] hover:text-text-primary
                 focus:outline-none transition-colors appearance-none
                 [&>option]:bg-bg-surface [&>option]:text-text-primary"
    >
      {children}
    </select>
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
        text-text-muted transition-all duration-150
        hover:bg-white/[0.07] hover:text-text-primary active:scale-95
        ${glow
          ? "hover:shadow-[0_0_10px_rgba(30,64,175,0.4)] hover:border hover:border-accent/30"
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
          ? "bg-accent/25 text-accent-light shadow-[0_0_12px_rgba(30,64,175,0.45)_inset]"
          : "text-text-muted hover:bg-white/5 hover:text-text-primary"
        }
      `}
    >
      {children}
    </button>
  )
}
