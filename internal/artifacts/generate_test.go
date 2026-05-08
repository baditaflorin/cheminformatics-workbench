package artifacts

import (
	"testing"
	"time"
)

func TestGenerateIncludesCoreArtifacts(t *testing.T) {
	bundle := Generate("v1", time.Unix(0, 0))

	if bundle.SchemaVersion != "v1" {
		t.Fatalf("schema version = %s", bundle.SchemaVersion)
	}
	if len(bundle.ChemblSubset) == 0 {
		t.Fatal("expected ChEMBL subset records")
	}
	if len(bundle.Receptors) == 0 {
		t.Fatal("expected receptor records")
	}
	if bundle.Model.ID == "" {
		t.Fatal("expected model metadata")
	}
}
