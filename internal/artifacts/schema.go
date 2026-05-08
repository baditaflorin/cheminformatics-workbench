package artifacts

type ArtifactBundle struct {
	SchemaVersion string            `json:"schemaVersion"`
	GeneratedAt   string            `json:"generatedAt"`
	ChemblSubset  []ChemblRecord    `json:"chemblSubset"`
	Descriptors   []DescriptorSpec  `json:"descriptors"`
	Model         BioactivityModel  `json:"model"`
	Receptors     []DockingReceptor `json:"receptors"`
	Samples       []SampleMolecule  `json:"samples"`
}

type ChemblRecord struct {
	CompoundID string             `json:"compoundId"`
	Name       string             `json:"name"`
	SMILES     string             `json:"smiles"`
	Target     string             `json:"target"`
	Activity   float64            `json:"activity"`
	Units      string             `json:"units"`
	PChEMBL    float64            `json:"pchembl"`
	AssayType  string             `json:"assayType"`
	Tags       []string           `json:"tags"`
	Properties map[string]float64 `json:"properties"`
}

type DescriptorSpec struct {
	Key         string  `json:"key"`
	Label       string  `json:"label"`
	Units       string  `json:"units"`
	Description string  `json:"description"`
	Minimum     float64 `json:"minimum"`
	Maximum     float64 `json:"maximum"`
}

type BioactivityModel struct {
	ID            string             `json:"id"`
	Version       string             `json:"version"`
	Target        string             `json:"target"`
	Runtime       string             `json:"runtime"`
	Threshold     float64            `json:"threshold"`
	Intercept     float64            `json:"intercept"`
	Coefficients  map[string]float64 `json:"coefficients"`
	FeatureMeans  map[string]float64 `json:"featureMeans"`
	FeatureScales map[string]float64 `json:"featureScales"`
	Metrics       map[string]float64 `json:"metrics"`
}

type DockingReceptor struct {
	ID          string             `json:"id"`
	Name        string             `json:"name"`
	Target      string             `json:"target"`
	Description string             `json:"description"`
	GridCenter  [3]float64         `json:"gridCenter"`
	GridSize    [3]float64         `json:"gridSize"`
	Weights     map[string]float64 `json:"weights"`
}

type SampleMolecule struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	SMILES   string `json:"smiles"`
	Target   string `json:"target"`
	MolBlock string `json:"molBlock"`
}

type Meta struct {
	GeneratedAt     string            `json:"generatedAt"`
	SourceCommit    string            `json:"sourceCommit"`
	InputChecksums  map[string]string `json:"inputChecksums"`
	SchemaVersion   string            `json:"schemaVersion"`
	ArtifactVersion string            `json:"artifactVersion"`
}
