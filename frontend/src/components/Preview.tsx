import { useEffect, useRef, useState } from "react"
import { RenderMarkdown } from "../../wailsjs/go/main/App"

interface PreviewProps {
  content:    string
  fontFamily: string
  fontSize:   string
}

export default function Preview({ content, fontFamily, fontSize }: PreviewProps) {
  const [html, setHtml] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        setHtml(await RenderMarkdown(content))
      } catch (err) {
        console.error("RenderMarkdown:", err)
      }
    }, 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [content])

  return (
    <div className="h-full overflow-y-auto">
      <div
        className="prose mx-auto px-8 pb-6"
        style={{ fontFamily, fontSize, paddingTop: 24 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
