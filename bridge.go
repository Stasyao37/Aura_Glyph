package main

import (
	"aura_glyph/backend/export"
	"aura_glyph/backend/presets"
)

type Bridge struct{}

func NewBridge() *Bridge {
	return &Bridge{}
}

func (b *Bridge) ListPresets() ([]string, error) {
	return presets.List()
}

func (b *Bridge) LoadPreset(name string) (*presets.Preset, error) {
	return presets.Load(name)
}

func (b *Bridge) SavePreset(p *presets.Preset) error {
	return presets.Save(p)
}

func (b *Bridge) ExportToPDF(html string, destPath string) error {
	return export.ToPDF(html, destPath)
}
