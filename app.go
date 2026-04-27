package main

import (
	"context"
	"os"
	"path/filepath"

	"aura_glyph/backend/parser"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// FileResult возвращается при открытии файла через диалог.
type FileResult struct {
	Path    string `json:"path"`
	Content string `json:"content"`
}

// OpenFileWithDialog показывает диалог выбора файла и возвращает путь + содержимое.
// Возвращает nil если пользователь отменил.
func (a *App) OpenFileWithDialog() (*FileResult, error) {
	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Открыть файл",
		Filters: []runtime.FileFilter{
			{DisplayName: "Markdown (*.md)", Pattern: "*.md"},
			{DisplayName: "Все файлы", Pattern: "*"},
		},
	})
	if err != nil || path == "" {
		return nil, err
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return &FileResult{Path: path, Content: string(data)}, nil
}

// SaveFile сохраняет контент в уже известный путь.
func (a *App) SaveFile(path string, content string) error {
	return os.WriteFile(path, []byte(content), 0644)
}

// SaveFileWithDialog показывает диалог «Сохранить как» и записывает файл.
// Возвращает итоговый путь (пустую строку если отменено).
func (a *App) SaveFileWithDialog(content string, currentPath string) (string, error) {
	defaultName := "untitled.md"
	if currentPath != "" {
		defaultName = filepath.Base(currentPath)
	}
	path, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Сохранить файл",
		DefaultFilename: defaultName,
		Filters: []runtime.FileFilter{
			{DisplayName: "Markdown (*.md)", Pattern: "*.md"},
			{DisplayName: "Все файлы", Pattern: "*"},
		},
	})
	if err != nil || path == "" {
		return "", err
	}
	return path, os.WriteFile(path, []byte(content), 0644)
}

func (a *App) RenderMarkdown(source string) (string, error) {
	return parser.RenderMarkdown(source)
}
