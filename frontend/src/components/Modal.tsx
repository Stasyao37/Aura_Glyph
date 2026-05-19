import { useEffect, useRef, useState } from "react"
import type { ModalEntry } from "../hooks/useModal"

export default function Modal({
  entry,
  onDismiss,
}: {
  entry: ModalEntry
  onDismiss: () => void
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return
      if (entry.kind === "confirm") { entry.resolve(false); onDismiss() }
      else if (entry.kind === "prompt") { entry.resolve(null); onDismiss() }
      else { entry.resolve(); onDismiss() }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [entry, onDismiss])

  function onBackdrop() {
    if (entry.kind === "confirm") { entry.resolve(false); onDismiss() }
    else if (entry.kind === "prompt") { entry.resolve(null); onDismiss() }
    else { entry.resolve(); onDismiss() }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onBackdrop}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-2xl frosted-glass border p-6
                   shadow-[0_24px_64px_rgba(0,0,0,0.7)]"
        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
        onClick={e => e.stopPropagation()}
      >
        {entry.kind === "confirm" && <ConfirmView entry={entry} onDismiss={onDismiss} />}
        {entry.kind === "prompt"  && <PromptView  entry={entry} onDismiss={onDismiss} />}
        {entry.kind === "info"    && <InfoView    entry={entry} onDismiss={onDismiss} />}
      </div>
    </div>
  )
}

function ConfirmView({
  entry,
  onDismiss,
}: {
  entry: Extract<ModalEntry, { kind: "confirm" }>
  onDismiss: () => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)

  // Arrow key navigation between Cancel and Confirm buttons
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
      e.preventDefault()
      const btns = rowRef.current?.querySelectorAll<HTMLButtonElement>("button")
      if (!btns || btns.length < 2) return
      if (document.activeElement === btns[0]) btns[1].focus()
      else btns[0].focus()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      {entry.title && (
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          {entry.title}
        </h3>
      )}
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        {entry.message}
      </p>
      <div ref={rowRef} className="flex gap-2 mt-5 justify-end">
        <Btn variant="ghost" onClick={() => { entry.resolve(false); onDismiss() }}>
          {entry.cancelLabel ?? "Отмена"}
        </Btn>
        <Btn
          variant={entry.destructive ? "destructive" : "accent"}
          onClick={() => { entry.resolve(true); onDismiss() }}
          autoFocus
        >
          {entry.confirmLabel ?? "Да"}
        </Btn>
      </div>
    </>
  )
}

function PromptView({
  entry,
  onDismiss,
}: {
  entry: Extract<ModalEntry, { kind: "prompt" }>
  onDismiss: () => void
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(entry.fields.map(f => [f.id, f.defaultValue ?? ""]))
  )

  function submit(e: React.FormEvent) {
    e.preventDefault()
    entry.resolve(values)
    onDismiss()
  }

  return (
    <form onSubmit={submit}>
      {entry.title && (
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          {entry.title}
        </h3>
      )}
      {entry.message && (
        <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
          {entry.message}
        </p>
      )}
      <div className="flex flex-col gap-3">
        {entry.fields.map((f, i) => (
          <div key={f.id}>
            <label className="block text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>
              {f.label}
            </label>
            <input
              type="text"
              value={values[f.id] ?? ""}
              placeholder={f.placeholder}
              autoFocus={i === 0}
              onChange={e => setValues(v => ({ ...v, [f.id]: e.target.value }))}
              className="w-full rounded-lg px-3 py-1.5 text-sm outline-none border transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "var(--glass-border)",
                color: "var(--color-text-primary)",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--glass-border)")}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-5 justify-end">
        <Btn type="button" variant="ghost" onClick={() => { entry.resolve(null); onDismiss() }}>
          Отмена
        </Btn>
        <Btn type="submit" variant="accent">
          Вставить
        </Btn>
      </div>
    </form>
  )
}

function InfoView({
  entry,
  onDismiss,
}: {
  entry: Extract<ModalEntry, { kind: "info" }>
  onDismiss: () => void
}) {
  return (
    <>
      {entry.title && (
        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          {entry.title}
        </h3>
      )}
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        {entry.message}
      </p>
      <div className="flex justify-end mt-5">
        <Btn variant="accent" onClick={() => { entry.resolve(); onDismiss() }} autoFocus>
          {entry.label ?? "Понятно"}
        </Btn>
      </div>
    </>
  )
}

function Btn({
  children,
  onClick,
  variant,
  autoFocus,
  type = "button",
}: {
  children: React.ReactNode
  onClick?: () => void
  variant: "ghost" | "accent" | "destructive"
  autoFocus?: boolean
  type?: "button" | "submit"
}) {
  const isGhost       = variant === "ghost"
  const isDestructive = variant === "destructive"

  return (
    <button
      type={type}
      onClick={onClick}
      autoFocus={autoFocus}
      className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                 border focus:outline-none
                 hover:bg-[rgba(30,64,175,0.15)] hover:shadow-[0_0_14px_rgba(30,64,175,0.45)]
                 focus:bg-[rgba(30,64,175,0.15)] focus:shadow-[0_0_14px_rgba(30,64,175,0.45)]"
      style={{
        borderColor: isGhost
          ? "transparent"
          : isDestructive
          ? "rgba(239,68,68,0.25)"
          : "rgba(30,64,175,0.35)",
        color: isGhost
          ? "var(--color-text-subtle)"
          : isDestructive
          ? "rgb(248,113,113)"
          : "var(--color-accent-light)",
        background: isGhost || isDestructive ? "transparent" : "rgba(30,64,175,0.15)",
      }}
    >
      {children}
    </button>
  )
}
