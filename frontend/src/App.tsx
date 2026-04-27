import { useCallback, useEffect, useRef, useState } from "react"
import TitleBar from "./components/TitleBar"
import Toolbar, { type ViewMode } from "./components/Toolbar"
import Editor, { type EditorHandle } from "./components/Editor"
import Preview from "./components/Preview"
import { type Preset } from "./presets"
import {
  OpenFileWithDialog,
  SaveFile,
  SaveFileWithDialog,
} from "../wailsjs/go/main/App"

const PLACEHOLDER = `# Привет, Aura Glyph

Это **редактор** с поддержкой Markdown.

## Возможности

- Подсветка синтаксиса в редакторе
- Живой *предпросмотр* справа
- Пресеты оформления (скоро)

### Таблица

| Колонка     | Значение |
|-------------|----------|
| Строка 1    | данные   |
| Строка 2    | данные   |

> Это цитата с акцентным синим бордером.
`

// TitleBar 40px + Toolbar 44px
const HEADER_H = 84

export default function App() {
  const [content,    setContent]    = useState(PLACEHOLDER)
  const [isDirty,    setIsDirty]    = useState(false)
  const [filePath,   setFilePath]   = useState<string | null>(null)
  const [splitPct,   setSplitPct]   = useState(50)
  const [viewMode,   setViewMode]   = useState<ViewMode>("split")
  const [fontFamily,     setFontFamily]     = useState("Inter, system-ui, sans-serif")
  const [fontSize,       setFontSize]       = useState("14px")
  const [lineHeight,     setLineHeight]     = useState("1.8")
  const [activePresetId, setActivePresetId] = useState("default")

  const editorRef    = useRef<EditorHandle>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Рефы нужны чтобы хоткеи всегда видели актуальные значения
  // (хендлеры создаются один раз — без рефов был бы stale closure)
  const contentRef  = useRef(content)
  const filePathRef = useRef(filePath)
  useEffect(() => { contentRef.current  = content  }, [content])
  useEffect(() => { filePathRef.current = filePath }, [filePath])

  const filename = filePath ? filePath.split("/").pop()! : "untitled.md"

  function handleChange(val: string) {
    setContent(val)
    setIsDirty(true)
  }

  const handleOpen = useCallback(async () => {
    const result = await OpenFileWithDialog()
    if (!result) return
    setContent(result.content)
    setFilePath(result.path || null)
    setIsDirty(false)
  }, [])

  const handleSaveAs = useCallback(async () => {
    const newPath = await SaveFileWithDialog(contentRef.current, filePathRef.current ?? "")
    if (newPath) {
      setFilePath(newPath)
      setIsDirty(false)
    }
  }, [])

  const handleSave = useCallback(async () => {
    if (filePathRef.current) {
      await SaveFile(filePathRef.current, contentRef.current)
      setIsDirty(false)
    } else {
      // Ещё нет пути — показываем "Сохранить как"
      const newPath = await SaveFileWithDialog(contentRef.current, "")
      if (newPath) {
        setFilePath(newPath)
        setIsDirty(false)
      }
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.ctrlKey) return
      if (e.key === "o") { e.preventDefault(); handleOpen() }
      if (e.key === "s") { e.preventDefault(); e.shiftKey ? handleSaveAs() : handleSave() }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [handleOpen, handleSave, handleSaveAs])

  function handleApplyPreset(preset: Preset) {
    setFontFamily(preset.fontFamily)
    setFontSize(preset.fontSize)
    setLineHeight(preset.lineHeight)
    setActivePresetId(preset.id)
  }

  function handleDividerMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    function onMove(ev: MouseEvent) {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setSplitPct(Math.min(80, Math.max(20, ((ev.clientX - rect.left) / rect.width) * 100)))
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }

  const showEditor  = viewMode === "source" || viewMode === "split"
  const showPreview = viewMode === "preview" || viewMode === "split"
  const showDivider = viewMode === "split"

  return (
    <div className="relative h-screen bg-bg-deep overflow-hidden">

      {/* ── Ambient background glows — radial-gradient, zero blur cost ── */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: `
          radial-gradient(ellipse 55% 45% at 0% 0%,   rgba(59,130,246,0.13) 0%, transparent 100%),
          radial-gradient(ellipse 45% 40% at 100% 0%, rgba(124,58,237,0.10) 0%, transparent 100%),
          radial-gradient(ellipse 50% 35% at 50% 100%, rgba(45,212,191,0.07) 0%, transparent 100%)
        `}}
      />

      {/* ── Fixed glass header (контент скроллится ПОД ними) ── */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TitleBar filename={filename} isDirty={isDirty} />
        <Toolbar
          editorRef={editorRef}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          fontFamily={fontFamily}
          onFontFamilyChange={setFontFamily}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          activePresetId={activePresetId}
          onApplyPreset={handleApplyPreset}
        />
      </div>

      {/* ── Main — контент начинается НИЖЕ фиксированного хедера ── */}
      <main ref={containerRef} className="flex h-screen overflow-hidden select-none" style={{ paddingTop: HEADER_H }}>
        {showEditor && (
          <div
            style={{ width: showDivider ? `${splitPct}%` : "100%" }}
            className="flex flex-col overflow-hidden shrink-0"
          >
            <Editor ref={editorRef} value={content} onChange={handleChange} />
          </div>
        )}

        {showDivider && (
          <div
            onMouseDown={handleDividerMouseDown}
            className="w-px bg-white/5 hover:bg-accent/50 hover:w-0.5
                       transition-colors duration-150 cursor-col-resize shrink-0 z-10"
          />
        )}

        {showPreview && (
          <div className="flex flex-col flex-1 overflow-hidden min-w-0">
            <Preview
              content={content}
              fontFamily={fontFamily}
              fontSize={fontSize}
              lineHeight={lineHeight}
            />
          </div>
        )}
      </main>
    </div>
  )
}
