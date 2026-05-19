# Aura Glyph — Project Context for Claude Code

> Этот файл — основной источник правды для Claude Code. Если что-то расходится с `GEMINI.md`, верь этому файлу: `GEMINI.md` исторически устарел (упоминал Vue 3, тогда как проект уже давно на React).

---

## О проекте

**Aura Glyph** — десктопный Markdown-редактор нового поколения, первая программа офисного пакета **Aura Suite** (далее планируются Grid — таблицы, Pulse — презентации).

Философия: **антипод "комбайнов"** вроде MS Office. Ставка на:
- Идеальную, предсказуемую вёрстку через систему JSON-пресетов.
- Полную локальность данных (`.md` файлы на диске, никаких облаков и БД).
- Минималистичный, эстетичный UI без нагромождения кнопок.

**Целевая аудитория:** студенты, разработчики, Linux/Hyprland-пользователи.

**Текущий статус:** alpha 0.2.0 «Safekeeper».

---

## Стек

| Слой | Технология |
|---|---|
| Backend / runtime | Go 1.23 (стандартная библиотека где возможно) |
| Bridge | Wails v2.12 |
| Frontend | React 18 + TypeScript 5.6 |
| Стили | Tailwind CSS v4 (через `@theme` в `global.css`) |
| Редактор | CodeMirror 6 (Markdown lang) |
| Markdown → HTML | Goldmark (Go) |
| Анимации | Framer Motion |
| Иконки | Lucide React |
| Сборка фронта | Vite 5 |

LaTeX через KaTeX — в плане, в текущей сборке не подключён.

---

## Структура

```
aura_glyph/
├── app.go                  # Wails app definition
├── bridge.go               # Go ↔ JS bridge
├── main.go                 # entrypoint
├── backend/
│   ├── parser/             # Markdown → HTML (Goldmark)
│   ├── presets/            # загрузка пресетов из JSON
│   └── export/             # экспорт (заглушка до Go 1.26)
└── frontend/src/
    ├── App.tsx             # корневой компонент, layout, состояние
    ├── presets.ts          # типы пресетов
    ├── hooks/              # кастомные React-хуки
    ├── styles/global.css   # Tailwind v4 + Aura design tokens
    └── components/
        ├── TitleBar.tsx       # frameless titlebar с drag-регионом
        ├── Toolbar.tsx        # верхняя панель действий
        ├── FileMenu.tsx       # меню Open/Save/Save As
        ├── Editor.tsx         # CodeMirror 6
        ├── Preview.tsx        # рендер HTML
        ├── PagePreview.tsx    # WYSIWYG-лист A4 с пресетом
        ├── PresetPicker.tsx   # выбор пресета
        ├── DocSettingsPanel.tsx
        └── SettingsPanel.tsx
```

---

## Дизайн-система (Aura Design)

Внешний вид — ключевое УТП. При генерации UI строго следовать философии:

- **Frameless** окно, кастомный TitleBar с drag-регионом.
- **Фон:** глубокий матовый монохром, базовый `#101012` (токен `--color-bg-deep`).
- **Frosted Glass:** мы НЕ используем прозрачность ОС. Панели интерфейса (titlebar, toolbar, меню) — `backdrop-blur-xl` поверх контента приложения. Контент скроллится *под* панелями.
  - Утилиты: `.frosted-glass` / `.frosted-glass-sm` в `global.css`.
  - Стекло: `--glass-bg: rgba(16,16,18,0.72)`, `--glass-border: rgba(255,255,255,0.06)`.
- **Glow:** активные элементы выделяются неоновым свечением через `box-shadow` (`--glow-accent`, `--glow-aura`, `--glow-close`).
- **Акцент Glyph** (default): `#1E40AF` (deep blue), `--color-accent`.
- **Aura Glow** (фирменный градиент темы): `#3B82F6` (обычный синий, `--color-aura-blue`) → `#5EEAD4` (светлый бирюзовый, `--color-aura-teal-light`). Промежуточный mid-tone `#2DD4BF` живёт как `--color-aura-teal` (логотип, inline `code` в prose). Фиолетовый `#7C3AED` отменён и не используется.

Темы (переключаются через `html.{light,dark,aura-glow}` в `global.css`):
- `dark` — дефолт, монохром.
- `light` — светлая.
- `aura-glow` — с фирменным радиальным свечением снизу.

### Правила стилизации
- Не добавлять границ, теней, цветов "по умолчанию", ломающих тёмную монохромную стилистику.
- Все цвета — через CSS-переменные (`var(--color-…)`), не хардкодить hex в компонентах.
- Tailwind v4: новые токены добавлять в `@theme {}` блок `global.css`, не в `tailwind.config`.

---

## Ключевые механики

1. **Local-first:** документы — обычные `.md` файлы (опционально с YAML frontmatter). Никаких БД, никакой обязательной синхронизации.
2. **Система пресетов (Live Layouts):** пользователь не настраивает отступы вручную. JSON-пресеты в `~/.config/aura/presets/` (или эквивалент через `os.UserConfigDir()`) задают `line_spacing`, `font_size`, `margins`. При выборе пресета фронт меняет CSS-переменные `:root`, превью перестраивается мгновенно.
3. **WYSIWYG-предпросмотр:** Split / Source / Preview. `PagePreview` имитирует реальный лист A4 с миллиметровой точностью из пресета.
4. **Hotkeys:** `Ctrl+O` open · `Ctrl+S` save · `Ctrl+Shift+S` save as.

---

## Правила для Claude (AI Directives)

- **Не усложняй.** Решается встроенными средствами React/Go — не предлагай новых npm-/Go-зависимостей. Прежде чем тянуть пакет, спроси.
- **Держи UI чистым.** Никаких "дефолтных" границ/теней, ломающих frosted-glass.
- **Cross-platform:** код должен собираться и корректно работать на Linux (приоритет — Hyprland, тайлинг) и Windows. Никакого хардкода путей — `os.UserConfigDir()`, `filepath.Join`.
- **Wails:** разделяй файловую логику (Go) и отображение (React). Связь — только через Wails Bindings (`bridge.go`).
- **Tailwind v4:** новые design tokens — в `@theme` секции `frontend/src/styles/global.css`.
- **Темы:** новые цвета добавлять во ВСЕ три темы (`dark` / `light` / `aura-glow`), а не только в дефолтную.

---

## Известные особенности окружения

- **Linux + Wails v2 + WebKit2GTK:** для корректной работы `backdrop-filter` и компонент-эффектов **обязателен** `linux.Options{WebviewGpuPolicy: linux.WebviewGpuPolicyAlways}` (или эквивалент с GPU-ускорением). Без этого WebKit2GTK игнорирует blur.
- **Fedora 43:** `webkit2gtk-4.0` — отсутствует, решено симлинком на `4.1`.
- **Go 1.26 экспорт:** функционал экспорта в backend/export — заглушка, ждёт релиза Go 1.26.

---

## Что сделать перед PR

1. `wails dev` — поднять и в браузере/окне проверить **золотой путь + хотя бы одну тёмную/светлую тему**.
2. Проверить, что titlebar / toolbar / меню не "прыгают" при переключении тем.
3. Если затронут CSS — посмотреть и `dark`, и `light`, и `aura-glow`.

---

## Версионирование

- **Единый источник:** `frontend/package.json` — поля `version` и `codename`.
- **Фронт** читает их через `frontend/src/version.ts` (`VERSION_LABEL`). Хардкодить строку версии в компонентах **запрещено**.
- **README badge:** строка `[![Version](...)](frontend/package.json)` в шапке — синхронизировать вручную при каждом релизе.
- **Правило:** при любом значимом изменении (новая фича, фикс UX, изменение дизайн-системы) — бампить `version` в `package.json` и обновлять badge + `CLAUDE.md:Текущий статус`.

---

## Roadmap (общая канва)

1. Aura Glyph — текстовый редактор `.md`/`.latex` (текущая фаза).
2. Aura Grid — таблицы.
3. Aura Pulse — презентации.

При архитектурных решениях держать в уме переиспользуемость дизайн-системы и компонентов между будущими программами Suite.
