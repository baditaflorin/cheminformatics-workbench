package artifacts

import "time"

const ArtifactVersion = "0.1.0"

func Generate(schemaVersion string, now time.Time) ArtifactBundle {
	return ArtifactBundle{
		SchemaVersion: schemaVersion,
		GeneratedAt:   now.UTC().Format(time.RFC3339),
		ChemblSubset:  chemblSubset(),
		Descriptors:   descriptorSpecs(),
		Model:         model(),
		Receptors:     receptors(),
		Samples:       sampleMolecules(),
	}
}

func MetaFor(schemaVersion string, sourceCommit string, now time.Time) Meta {
	return Meta{
		GeneratedAt:     now.UTC().Format(time.RFC3339),
		SourceCommit:    sourceCommit,
		InputChecksums:  map[string]string{"embedded-curated-subset": "sha256:static-v1"},
		SchemaVersion:   schemaVersion,
		ArtifactVersion: ArtifactVersion,
	}
}
