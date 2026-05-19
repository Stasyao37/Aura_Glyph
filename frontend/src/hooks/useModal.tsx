import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { createPortal } from "react-dom"
import Modal from "../components/Modal"

export type ModalField = {
  id: string
  label: string
  placeholder?: string
  defaultValue?: string
}

export type ModalEntry =
  | {
      kind: "confirm"
      title?: string
      message: string
      confirmLabel?: string
      cancelLabel?: string
      destructive?: boolean
      resolve: (v: boolean) => void
    }
  | {
      kind: "prompt"
      title?: string
      message?: string
      fields: ModalField[]
      resolve: (v: Record<string, string> | null) => void
    }
  | {
      kind: "info"
      title?: string
      message: string
      label?: string
      resolve: () => void
    }

type ModalAPI = {
  confirm(opts: {
    title?: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    destructive?: boolean
  }): Promise<boolean>
  prompt(opts: {
    title?: string
    message?: string
    fields: ModalField[]
  }): Promise<Record<string, string> | null>
  info(opts: { title?: string; message: string; label?: string }): Promise<void>
}

const ModalCtx = createContext<ModalAPI | null>(null)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<ModalEntry | null>(null)
  const clear = () => setEntry(null)

  const confirm = useCallback(
    (opts: { title?: string; message: string; confirmLabel?: string; cancelLabel?: string; destructive?: boolean }) =>
      new Promise<boolean>(resolve => setEntry({ kind: "confirm", ...opts, resolve })),
    []
  )

  const prompt = useCallback(
    (opts: { title?: string; message?: string; fields: ModalField[] }) =>
      new Promise<Record<string, string> | null>(resolve =>
        setEntry({ kind: "prompt", ...opts, resolve })
      ),
    []
  )

  const info = useCallback(
    (opts: { title?: string; message: string; label?: string }) =>
      new Promise<void>(resolve => setEntry({ kind: "info", ...opts, resolve })),
    []
  )

  return (
    <ModalCtx.Provider value={{ confirm, prompt, info }}>
      {children}
      {entry !== null &&
        createPortal(<Modal entry={entry} onDismiss={clear} />, document.body)}
    </ModalCtx.Provider>
  )
}

export function useModal(): ModalAPI {
  const ctx = useContext(ModalCtx)
  if (!ctx) throw new Error("useModal must be used inside ModalProvider")
  return ctx
}
