package presets

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Preset struct {
	Name       string  `json:"name"`
	FontFamily string  `json:"fontFamily"`
	FontSize   int     `json:"fontSize"`
	LineHeight float64 `json:"lineHeight"`
	Theme      string  `json:"theme"`
}

func presetsDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	dir := filepath.Join(home, ".config", "aura-glyph", "presets")
	return dir, os.MkdirAll(dir, 0755)
}

func Load(name string) (*Preset, error) {
	dir, err := presetsDir()
	if err != nil {
		return nil, err
	}
	data, err := os.ReadFile(filepath.Join(dir, name+".json"))
	if err != nil {
		return nil, err
	}
	var p Preset
	return &p, json.Unmarshal(data, &p)
}

func Save(p *Preset) error {
	dir, err := presetsDir()
	if err != nil {
		return err
	}
	data, err := json.MarshalIndent(p, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(dir, p.Name+".json"), data, 0644)
}

func List() ([]string, error) {
	dir, err := presetsDir()
	if err != nil {
		return nil, err
	}
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	names := make([]string, 0, len(entries))
	for _, e := range entries {
		if !e.IsDir() && filepath.Ext(e.Name()) == ".json" {
			names = append(names, e.Name()[:len(e.Name())-5])
		}
	}
	return names, nil
}
