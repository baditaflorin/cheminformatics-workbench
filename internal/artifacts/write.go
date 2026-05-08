package artifacts

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"os"
	"path/filepath"
)

func Write(outputDir string, bundle ArtifactBundle, meta Meta) error {
	if err := os.MkdirAll(outputDir, 0o755); err != nil {
		return err
	}

	files := map[string]any{
		"bundle.json":      bundle,
		"chembl.json":      bundle.ChemblSubset,
		"descriptors.json": bundle.Descriptors,
		"model.json":       bundle.Model,
		"receptors.json":   bundle.Receptors,
		"samples.json":     bundle.Samples,
		"bundle.meta.json": meta,
	}

	for name, value := range files {
		if err := writeJSON(filepath.Join(outputDir, name), value); err != nil {
			return err
		}
	}

	return nil
}

func writeJSON(path string, value any) error {
	data, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	return os.WriteFile(path, data, 0o644)
}

func ChecksumJSON(value any) (string, error) {
	data, err := json.Marshal(value)
	if err != nil {
		return "", err
	}
	sum := sha256.Sum256(data)
	return "sha256:" + hex.EncodeToString(sum[:]), nil
}
