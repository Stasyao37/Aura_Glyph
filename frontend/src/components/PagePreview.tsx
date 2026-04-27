import { useEffect, useRef, useState } from "react"
import { RenderMarkdown } from "../../wailsjs/go/main/App"
import { type DocSettings } from "../presets"

// A4 at 96 DPI
const A4_W = 794
const A4_H = 1123

// ГОСТ 7.32 margins: left 30mm, right 15mm, top/bottom 20mm
const M_LEFT   = 113   // px
const M_RIGHT  = 57
const M_TOP    = 76
const M_BOTTOM = 76

const HEADER_ZONE = 32  // px
const FOOTER_ZONE = 28  // px

const CONTENT_W = A4_W - M_LEFT - M_RIGHT
const CONTENT_H = A4_H - M_TOP - M_BOTTOM - HEADER_ZONE - FOOTER_ZONE

interface PagePreviewProps {
  content:     string
  fontFamily:  string
  fontSize:    string
  lineHeight:  string
  filename:    string
  docSettings: DocSettings
}

function interpolate(tpl: string, page: number, total: number, filename: string): string {
  return tpl
    .replace(/\{page\}/g,     String(page))
    .replace(/\{total\}/g,    String(total))
    .replace(/\{filename\}/g, filename)
}

function headerValues(ds: DocSettings, isFirst: boolean) {
  return isFirst && ds.specialFirstPage
    ? [ds.firstHeaderLeft, ds.firstHeaderCenter, ds.firstHeaderRight]
    : [ds.headerLeft,      ds.headerCenter,      ds.headerRight]
}

function footerValues(ds: DocSettings, isFirst: boolean) {
  return isFirst && ds.specialFirstPage
    ? [ds.firstFooterLeft, ds.firstFooterCenter, ds.firstFooterRight]
    : [ds.footerLeft,      ds.footerCenter,      ds.footerRight]
}

export default function PagePreview({
  content, fontFamily, fontSize, lineHeight, filename, docSettings,
}: PagePreviewProps) {
  const [html,  setHtml]  = useState("")
  const [pages, setPages] = useState<string[][]>([])
  const [scale, setScale] = useState(1)
  const measureRef  = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      setScale(Math.min(1, w / (A4_W + 48)))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Debounced markdown → HTML (same pattern as Preview)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try { setHtml(await RenderMarkdown(content)) }
      catch (err) { console.error("RenderMarkdown:", err) }
    }, 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [content])

  // After html updates in measuring div, split children into pages by height
  useEffect(() => {
    if (!html) { setPages([]); return }

    requestAnimationFrame(() => {
      const container = measureRef.current
      if (!container) return

      const children = Array.from(container.children) as HTMLElement[]
      const result: string[][] = [[]]
      let usedH = 0

      for (const child of children) {
        const style  = getComputedStyle(child)
        const mt     = parseFloat(style.marginTop)    || 0
        const mb     = parseFloat(style.marginBottom) || 0
        const height = child.getBoundingClientRect().height
        const block  = mt + height + mb

        if (usedH + block > CONTENT_H && result[result.length - 1].length > 0) {
          result.push([])
          usedH = 0
        }
        result[result.length - 1].push(child.outerHTML)
        usedH += block
      }

      setPages(result)
    })
  }, [html])

  const total = pages.length
  const ds    = docSettings

  const metaStyle: React.CSSProperties = {
    fontSize: 9,
    color: "#888",
    fontFamily,
    flex: 1,
  }

  return (
    <>
      {/* ── Hidden measuring div: same typography, off-screen ── */}
      <div
        ref={measureRef}
        className="prose prose-light"
        style={{
          position:      "fixed",
          left:          -9999,
          top:           0,
          width:         CONTENT_W,
          maxWidth:      "none",
          fontFamily,
          fontSize,
          lineHeight,
          visibility:    "hidden",
          pointerEvents: "none",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* ── Page viewport ── */}
      <div ref={viewportRef} className="h-full overflow-auto" style={{ background: "#101014" }}>
        <div style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          padding:        "124px 24px 40px",
          gap:            32,
          zoom:           scale,
        } as React.CSSProperties}>
          {pages.map((chunks, pageIdx) => {
            const isFirst = pageIdx === 0
            const hVals   = headerValues(ds, isFirst)
            const fVals   = footerValues(ds, isFirst)
            const hasH    = hVals.some(Boolean)
            const hasF    = fVals.some(Boolean)

            return (
              <div
                key={pageIdx}
                style={{
                  width:         A4_W,
                  minHeight:     A4_H,
                  background:    "#fff",
                  boxShadow:     "0 4px 40px rgba(0,0,0,0.45)",
                  display:       "flex",
                  flexDirection: "column",
                  padding:       `${M_TOP}px ${M_RIGHT}px ${M_BOTTOM}px ${M_LEFT}px`,
                  boxSizing:     "border-box",
                }}
              >
                {/* Header */}
                <div style={{
                  height:        HEADER_ZONE,
                  display:       "flex",
                  alignItems:    "flex-end",
                  borderBottom:  hasH ? "0.5px solid #d0d0d0" : "none",
                  paddingBottom: 5,
                  flexShrink:    0,
                }}>
                  {hVals.map((t, i) => (
                    <span key={i} style={{ ...metaStyle, textAlign: i === 0 ? "left" : i === 1 ? "center" : "right" }}>
                      {interpolate(t, pageIdx + 1, total, filename)}
                    </span>
                  ))}
                </div>

                {/* Content */}
                <div
                  className="prose prose-light"
                  style={{ fontFamily, fontSize, lineHeight, maxWidth: "none", flex: 1 }}
                  dangerouslySetInnerHTML={{ __html: chunks.join("") }}
                />

                {/* Footer */}
                <div style={{
                  height:     FOOTER_ZONE,
                  display:    "flex",
                  alignItems: "flex-start",
                  borderTop:  hasF ? "0.5px solid #d0d0d0" : "none",
                  paddingTop: 5,
                  marginTop:  4,
                  flexShrink: 0,
                }}>
                  {fVals.map((t, i) => (
                    <span key={i} style={{ ...metaStyle, textAlign: i === 0 ? "left" : i === 1 ? "center" : "right" }}>
                      {interpolate(t, pageIdx + 1, total, filename)}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}

          {pages.length === 0 && html && (
            <p style={{ color: "#888", fontFamily }}>Подготовка страниц…</p>
          )}
        </div>
      </div>
    </>
  )
}
