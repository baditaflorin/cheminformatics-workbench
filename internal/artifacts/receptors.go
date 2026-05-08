package artifacts

func receptors() []DockingReceptor {
	return []DockingReceptor{
		{
			ID:          "egfr-hinge-v1",
			Name:        "EGFR kinase hinge",
			Target:      "EGFR",
			Description: "Academic-scale example pocket for kinase-like ligands.",
			GridCenter:  [3]float64{24.2, 3.1, 58.9},
			GridSize:    [3]float64{22, 20, 18},
			Weights:     map[string]float64{"logP": -0.52, "hBondAcceptors": -0.22, "rotatableBonds": 0.18, "tpsa": 0.018, "molecularWeight": -0.004},
		},
		{
			ID:          "cox2-channel-v1",
			Name:        "COX-2 channel",
			Target:      "PTGS2",
			Description: "Hydrophobic channel proxy for anti-inflammatory examples.",
			GridCenter:  [3]float64{31.4, -12.7, 22.1},
			GridSize:    [3]float64{18, 24, 18},
			Weights:     map[string]float64{"logP": -0.38, "hBondDonors": -0.16, "rotatableBonds": 0.16, "tpsa": 0.012, "molecularWeight": -0.003},
		},
		{
			ID:          "adora2a-orthosteric-v1",
			Name:        "A2A orthosteric site",
			Target:      "ADORA2A",
			Description: "GPCR-like orthosteric pocket proxy for xanthine ligands.",
			GridCenter:  [3]float64{-4.1, 18.3, 42.6},
			GridSize:    [3]float64{20, 20, 22},
			Weights:     map[string]float64{"logP": -0.25, "hBondAcceptors": -0.3, "ringCount": -0.2, "rotatableBonds": 0.22, "molecularWeight": -0.002},
		},
	}
}
