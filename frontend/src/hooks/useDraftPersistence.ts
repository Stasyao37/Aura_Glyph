import { useEffect, useRef, useCallback } from "react"
import { useModal } from "./useModal"

export const DRAFT_KEY = "aura-glyph:draft"

type DraftData = { content: string; filePath: string | null; savedAt: number }

export function useDraftPersistence({
  content,
  filePath,
  isDirty,
  onRestore,
}: {
  content: string
  filePath: string | null
  isDirty: boolean
  onRestore: (content: string, filePath: string | null) => void
}) {
  const modal = useModal()
  const checkedRef = useRef(false)

  // Check for draft once on mount
  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true

    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return

    let draft: DraftData
    try {
      draft = JSON.parse(raw)
    } catch {
      localStorage.removeItem(DRAFT_KEY)
      return
    }

    if (!draft.content) return

    const fileName = draft.filePath
      ? draft.filePath.replace(/\\/g, "/").split("/").pop()
      : null
    const message = fileName
      ? `Найден несохранённый черновик файла «${fileName}».`
      : "Найден несохранённый черновик. Восстановить?"

    modal
      .confirm({ title: "Восстановить черновик?", message, confirmLabel: "Восстановить" })
      .then(ok => {
        if (ok) onRestore(draft.content, draft.filePath)
        else localStorage.removeItem(DRAFT_KEY)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced save — only while there are unsaved changes
  useEffect(() => {
    if (!isDirty) return
    const t = setTimeout(() => {
      const data: DraftData = { content, filePath, savedAt: Date.now() }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
    }, 500)
    return () => clearTimeout(t)
  }, [content, filePath, isDirty])

  const clearDraft = useCallback(() => localStorage.removeItem(DRAFT_KEY), [])

  return { clearDraft }
}
