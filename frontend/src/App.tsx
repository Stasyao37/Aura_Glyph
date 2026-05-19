import { useCallback, useEffect, useRef, useState, lazy, Suspense } from "react"
import TitleBar from "./components/TitleBar"
import Toolbar, { type ViewMode } from "./components/Toolbar"
import type { EditorHandle } from "./components/Editor"
import Preview from "./components/Preview"
import PagePreview from "./components/PagePreview"
import { BUILT_IN_PRESETS, DEFAULT_DOC_SETTINGS, type Preset, type DocSettings } from "./presets"
import {
  OpenFileWithDialog,
  SaveFile,
  SaveFileWithDialog,
  SetDirty,
  ForceQuit,
} from "../wailsjs/go/main/App"
import { EventsOn, EventsOff } from "../wailsjs/runtime/runtime"
import { useTheme } from "./hooks/useTheme"
import { useModal } from "./hooks/useModal"
import { useDraftPersistence } from "./hooks/useDraftPersistence"

const Editor = lazy(() => import("./components/Editor"))

const PLACEHOLDER = `# Привет, Aura Glyph

Это **редактор** с поддержкой Markdown.

## Возможности

- Подсветка синтаксиса в редакторе
- Живой *предпросмотр* справа
- Пресеты оформления

### Таблица

| Колонка     | Значение |
|-------------|----------|
| Строка 1    | данные   |
| Строка 2    | данные   |

> Это цитата с акцентным синим бордером.
`

export default function App() {
  useTheme()
  const modal = useModal()

  const [content,    setContent]    = useState(PLACEHOLDER)
  const [isDirty,    setIsDirty]    = useState(false)
  const [filePath,   setFilePath]   = useState<string | null>(null)
  const [splitPct,   setSplitPct]   = useState(50)
  const [viewMode,   setViewMode]   = useState<ViewMode>("split")
  const [fontFamily,     setFontFamily]     = useState("Inter, system-ui, sans-serif")
  const [fontSize,       setFontSize]       = useState("14px")
  const [lineHeight,     setLineHeight]     = useState("1.8")
  const [activePresetId, setActivePresetId] = useState("default")
  const [docSettings,    setDocSettings]    = useState<DocSettings>(DEFAULT_DOC_SETTINGS)

  const editorRef    = useRef<EditorHandle>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Refs so hotkey callbacks always see current values (avoids stale closure)
  const contentRef  = useRef(content)
  const filePathRef = useRef(filePath)
  const isDirtyRef  = useRef(isDirty)
  useEffect(() => { contentRef.current  = content  }, [content])
  useEffect(() => { filePathRef.current = filePath }, [filePath])
  useEffect(() => { isDirtyRef.current  = isDirty  }, [isDirty])

  const filename = filePath
    ? filePath.replace(/\\/g, "/").split("/").pop()!
    : "untitled.md"

  // Helper: mark document as dirty and sync to Go side
  function markDirty() {
    setIsDirty(true)
    SetDirty(true).catch(() => {})
  }

  // Helper: mark document as clean and sync to Go side
  function markClean() {
    setIsDirty(false)
    SetDirty(false).catch(() => {})
  }

  function handleChange(val: string) {
    setContent(val)
    if (!isDirtyRef.current) markDirty()
  }

  const handleNew = useCallback(async () => {
    if (isDirtyRef.current) {
      const ok = await modal.confirm({
        message: "Есть несохранённые изменения. Создать новый документ?",
        confirmLabel: "Создать",
      })
      if (!ok) return
    }
    setContent("")
    setFilePath(null)
    markClean()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal])

  const handleOpen = useCallback(async () => {
    if (isDirtyRef.current) {
      const ok = await modal.confirm({
        message: "Есть несохранённые изменения. Открыть другой файл?",
        confirmLabel: "Открыть",
      })
      if (!ok) return
    }
    const result = await OpenFileWithDialog()
    if (!result) return
    setContent(result.content)
    setFilePath(result.path || null)
    markClean()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal])

  const handleSaveAs = useCallback(async () => {
    const newPath = await SaveFileWithDialog(contentRef.current, filePathRef.current ?? "")
    if (newPath) {
      setFilePath(newPath)
      markClean()
      clearDraftRef.current()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = useCallback(async () => {
    if (filePathRef.current) {
      await SaveFile(filePathRef.current, contentRef.current)
      markClean()
      clearDraftRef.current()
    } else {
      const newPath = await SaveFileWithDialog(contentRef.current, "")
      if (newPath) {
        setFilePath(newPath)
        markClean()
        clearDraftRef.current()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close button in TitleBar — shows modal when dirty, else quits directly
  const handleCloseRequest = useCallback(async () => {
    if (!isDirtyRef.current) { ForceQuit(); return }
    const ok = await modal.confirm({
      title: "Закрыть Aura Glyph",
      message: "Есть несохранённые изменения. Выйти без сохранения?",
      confirmLabel: "Закрыть",
    })
    if (ok) ForceQuit()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal])

  // Alt+F4 / taskbar close — Go emits "close-requested" when OnBeforeClose fires
  useEffect(() => {
    EventsOn("close-requested", () => {
      modal
        .confirm({
          title: "Закрыть Aura Glyph",
          message: "Есть несохранённые изменения. Выйти без сохранения?",
          confirmLabel: "Закрыть",
        })
        .then(ok => { if (ok) ForceQuit() })
    })
    return () => EventsOff("close-requested")
  }, [modal])

  // Draft persistence — stable clearDraft exposed via ref for handleSave/handleSaveAs
  const clearDraftRef = useRef(() => {})
  const { clearDraft } = useDraftPersistence({
    content,
    filePath,
    isDirty,
    onRestore: useCallback((c, p) => {
      setContent(c)
      setFilePath(p)
      markDirty()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  })
  useEffect(() => { clearDraftRef.current = clearDraft }, [clearDraft])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.ctrlKey) return
      const k = e.key.toLowerCase()
      if (k === "n") { e.preventDefault(); handleNew() }
      if (k === "o") { e.preventDefault(); handleOpen() }
      if (k === "s") { e.preventDefault(); e.shiftKey ? handleSaveAs() : handleSave() }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [handleNew, handleOpen, handleSave, handleSaveAs])

  function handleApplyPreset(preset: Preset) {
    setFontFamily(preset.fontFamily)
    setFontSize(preset.fontSize)
    setLineHeight(preset.lineHeight)
    setActivePresetId(preset.id)
    setDocSettings({
      ...DEFAULT_DOC_SETTINGS,
      headerLeft:   preset.headerLeft   ?? "",
      headerCenter: preset.headerCenter ?? "",
      headerRight:  preset.headerRight  ?? "",
      footerLeft:   preset.footerLeft   ?? "",
      footerCenter: preset.footerCenter ?? "",
      footerRight:  preset.footerRight  ?? "",
    })
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

  const activePreset = BUILT_IN_PRESETS.find(p => p.id === activePresetId) ?? BUILT_IN_PRESETS[0]
  const isPageMode   = activePreset.pageMode === true

  const showEditor  = viewMode === "source" || viewMode === "split"
  const showPreview = viewMode === "preview" || viewMode === "split"
  const showDivider = viewMode === "split"

  return (
    <div className="relative h-screen bg-bg-deep overflow-hidden">

      {/* ── Ambient background glows ── */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: 'var(--bg-ambient)' }}
      />

      {/* ── Fixed frosted header (TitleBar + Toolbar) ── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl"
        style={{
          background: 'var(--glass-bg)',
          borderBottom: "1px solid var(--glass-border)",
          boxShadow: 'var(--shadow-header)',
        }}
      >
        <TitleBar filename={filename} isDirty={isDirty} onCloseRequest={handleCloseRequest} />
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
          isPageMode={isPageMode}
          docSettings={docSettings}
          onDocSettingsChange={setDocSettings}
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
        />
      </div>

      {/* ── Main — content scrolls under the frosted header ── */}
      <main ref={containerRef} className="flex h-screen overflow-hidden select-none">
        {showEditor && (
          <div
            style={{ width: showDivider ? `${splitPct}%` : "100%" }}
            className="flex flex-col overflow-hidden shrink-0"
          >
            <Suspense fallback={<div className="h-full w-full bg-transparent p-8 text-text-dim">Loading Editor...</div>}>
              <Editor ref={editorRef} value={content} onChange={handleChange} />
            </Suspense>
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
            {isPageMode ? (
              <PagePreview
                content={content}
                fontFamily={fontFamily}
                fontSize={fontSize}
                lineHeight={lineHeight}
                filename={filename}
                docSettings={docSettings}
              />
            ) : (
              <Preview
                content={content}
                fontFamily={fontFamily}
                fontSize={fontSize}
                lineHeight={lineHeight}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
