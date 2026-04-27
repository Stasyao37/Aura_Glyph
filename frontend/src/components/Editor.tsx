import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { EditorView, keymap, lineNumbers } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { defaultKeymap, historyKeymap, history } from "@codemirror/commands"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { tags } from "@lezer/highlight"

export interface EditorHandle {
  wrapSelection(before: string, after: string): void
  insertAtLineStart(prefix: string): void
  clearLinePrefix(): void
  insertAtCursor(text: string): void
}

function toggleWrap(view: EditorView, before: string, after: string): boolean {
  const { from, to } = view.state.selection.main
  const doc = view.state.doc
  const hasSelection = from !== to

  if (hasSelection) {
    const selected = doc.sliceString(from, to)
    // Case 1: selection already includes the markers themselves
    if (
      selected.startsWith(before) &&
      selected.endsWith(after) &&
      selected.length > before.length + after.length
    ) {
      const inner = selected.slice(before.length, selected.length - after.length)
      view.dispatch({
        changes: { from, to, insert: inner },
        selection: { anchor: from, head: from + inner.length },
      })
      view.focus()
      return true
    }
    // Case 2: markers sit just outside the selection
    const prevChars = from >= before.length ? doc.sliceString(from - before.length, from) : ""
    const nextChars = to + after.length <= doc.length ? doc.sliceString(to, to + after.length) : ""
    if (prevChars === before && nextChars === after) {
      view.dispatch({
        changes: [
          { from: from - before.length, to: from, insert: "" },
          { from: to, to: to + after.length, insert: "" },
        ],
        selection: { anchor: from - before.length, head: to - before.length },
      })
      view.focus()
      return true
    }
  }

  // Default: wrap (with placeholder when no selection)
  const text   = hasSelection ? doc.sliceString(from, to) : "текст"
  const insert = `${before}${text}${after}`
  view.dispatch({
    changes: { from, to, insert },
    selection: { anchor: from + before.length, head: from + before.length + text.length },
  })
  view.focus()
  return true
}

interface EditorProps {
  value:    string
  onChange: (value: string) => void
}

const auraHighlight = HighlightStyle.define([
  { tag: tags.heading1, color: "#EDEDF0", fontWeight: "700", fontSize: "1.35em" },
  { tag: tags.heading2, color: "#EDEDF0", fontWeight: "600", fontSize: "1.15em" },
  { tag: tags.heading3, color: "#EDEDF0", fontWeight: "600" },
  { tag: tags.strong,   color: "#EDEDF0", fontWeight: "700" },
  { tag: tags.emphasis, color: "#C4C4D0", fontStyle: "italic" },
  { tag: tags.link,     color: "#3B82F6" },
  { tag: tags.url,      color: "#2DD4BF" },
  { tag: tags.monospace,      color: "#A78BFA", fontFamily: "monospace" },
  { tag: tags.strikethrough,  color: "#5A5A6A", textDecoration: "line-through" },
  { tag: tags.meta,           color: "#5A5A6A" },
  { tag: tags.processingInstruction, color: "#5A5A6A" },
])

const auraTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "transparent",
    color: "#C4C4D0",
    fontSize: "14px",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  },
  ".cm-content": { paddingTop: "108px", paddingBottom: "24px", paddingLeft: "32px", paddingRight: "32px", caretColor: "#3B82F6", lineHeight: "1.75" },
  ".cm-line":    { padding: "0" },
  ".cm-cursor":  { borderLeftColor: "#3B82F6", borderLeftWidth: "2px" },
  ".cm-selectionBackground, ::selection": { backgroundColor: "rgba(30,64,175,0.3) !important" },
  ".cm-focused .cm-selectionBackground":  { backgroundColor: "rgba(30,64,175,0.3) !important" },
  ".cm-scroller": { overflow: "auto", fontFamily: "inherit" },
  ".cm-gutters":  {
    backgroundColor: "transparent",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    color: "#3A3A4A",
    minWidth: "48px",
  },
  ".cm-gutterElement":    { padding: "0 12px 0 8px", lineHeight: "1.75" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "#5A5A6A" },
  ".cm-activeLine":       { backgroundColor: "rgba(255,255,255,0.025)" },
}, { dark: true })

const Editor = forwardRef<EditorHandle, EditorProps>(function Editor(
  { value, onChange },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef      = useRef<EditorView | null>(null)

  useImperativeHandle(ref, () => ({
    wrapSelection(before, after) {
      const view = viewRef.current
      if (!view) return
      toggleWrap(view, before, after)
    },

    insertAtLineStart(prefix) {
      const view = viewRef.current
      if (!view) return
      const { from } = view.state.selection.main
      const line = view.state.doc.lineAt(from)
      const existing = line.text.match(/^#{1,4} /)
      const removeEnd = existing ? line.from + existing[0].length : line.from
      view.dispatch({ changes: { from: line.from, to: removeEnd, insert: prefix } })
      view.focus()
    },

    clearLinePrefix() {
      const view = viewRef.current
      if (!view) return
      const { from } = view.state.selection.main
      const line = view.state.doc.lineAt(from)
      const existing = line.text.match(/^#{1,4} /)
      if (existing) {
        view.dispatch({ changes: { from: line.from, to: line.from + existing[0].length, insert: "" } })
      }
      view.focus()
    },

    insertAtCursor(text) {
      const view = viewRef.current
      if (!view) return
      const { from, to } = view.state.selection.main
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      })
      view.focus()
    },
  }))

  useEffect(() => {
    if (!containerRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        history(),
        keymap.of([
          { key: "Ctrl-b", run: (v) => toggleWrap(v, "**", "**") },
          { key: "Ctrl-i", run: (v) => toggleWrap(v, "*",  "*")  },
          { key: "Ctrl-u", run: (v) => toggleWrap(v, "<u>", "</u>") },
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        syntaxHighlighting(auraHighlight),
        EditorView.lineWrapping,
        lineNumbers(),
        auraTheme,
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChange(u.state.doc.toString())
        }),
      ],
    })
    viewRef.current = new EditorView({ state, parent: containerRef.current })
    return () => { viewRef.current?.destroy(); viewRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view || view.state.doc.toString() === value) return
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } })
  }, [value])

  return <div ref={containerRef} className="h-full w-full overflow-hidden" style={{ userSelect: "text" }} />
})

export default Editor
