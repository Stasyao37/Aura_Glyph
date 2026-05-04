package presets

import (
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"testing"
)

// setupTestDir creates a temporary directory for tests and overrides PresetsDirFunc.
// It returns the temporary directory path and a cleanup function.
func setupTestDir(t *testing.T) string {
	t.Helper()

	tempDir := t.TempDir()

	originalPresetsDirFunc := PresetsDirFunc
	PresetsDirFunc = func() (string, error) {
		return tempDir, nil
	}

	t.Cleanup(func() {
		PresetsDirFunc = originalPresetsDirFunc
	})

	return tempDir
}

func TestSaveLoadPreset(t *testing.T) {
	setupTestDir(t)

	preset := &Preset{
		Name:       "Test",
		FontFamily: "Arial",
		FontSize:   12,
		LineHeight: 1.5,
		Theme:      "dark",
	}

	if err := Save(preset); err != nil {
		t.Fatalf("Save() error = %v", err)
	}

	loaded, err := Load("Test")
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}

	if !reflect.DeepEqual(preset, loaded) {
		t.Errorf("Load() got = %v, want %v", loaded, preset)
	}
}

func TestListPresets(t *testing.T) {
	setupTestDir(t)

	presets := []*Preset{
		{Name: "PresetA"},
		{Name: "PresetB"},
		{Name: "PresetC"},
	}

	for _, p := range presets {
		if err := Save(p); err != nil {
			t.Fatalf("Save() error = %v", err)
		}
	}
	// Create a non-json file to ensure it's ignored
	if err := os.WriteFile(filepath.Join(t.TempDir(), "ignore.txt"), []byte("test"), 0644); err != nil {
		t.Fatalf("Failed to write dummy file: %v", err)
	}


	names, err := List()
	if err != nil {
		t.Fatalf("List() error = %v", err)
	}

	expected := []string{"PresetA", "PresetB", "PresetC"}

	sort.Strings(names)
	sort.Strings(expected)

	if !reflect.DeepEqual(names, expected) {
		t.Errorf("List() got = %v, want %v", names, expected)
	}
}

func TestLoadNonExistent(t *testing.T) {
	setupTestDir(t)

	_, err := Load("NonExistent")
	if err == nil {
		t.Error("Load() with non-existent preset should have returned an error, but got nil")
	}
}
