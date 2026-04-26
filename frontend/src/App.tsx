import { useState } from "react"
import TitleBar from "./components/TitleBar"
import Editor from "./components/Editor"

const PLACEHOLDER = `# Привет, Aura Glyph

Это **редактор** с поддержкой Markdown.

## Возможности

- Подсветка синтаксиса
- Живой *предпросмотр* (скоро)
- Пресеты оформления (скоро)

\`\`\`ts
const greet = (name: string) => \`Hello, \${name}\`
\`\`\`
`

export default function App() {
  const [content, setContent] = useState(PLACEHOLDER)
  const [isDirty, setIsDirty]  = useState(false)

  function handleChange(val: string) {
    setContent(val)
    setIsDirty(true)
  }

  return (
    <div className="flex flex-col h-screen bg-[#101012] overflow-hidden">
      <TitleBar filename="untitled.md" isDirty={isDirty} />

      <main className="flex flex-1 overflow-hidden">
        {/* Editor pane */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-white/5">
          <Editor value={content} onChange={handleChange} />
        </div>

        {/* Preview pane — шаг 5 */}
        <div className="flex flex-col w-[45%] shrink-0 items-center justify-center">
          <p className="text-[#3A3A4A] text-xs tracking-widest uppercase select-none">
            Preview · шаг 5
          </p>
        </div>
      </main>
    </div>
  )
}
