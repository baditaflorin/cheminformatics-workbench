package artifacts

func model() BioactivityModel {
	return BioactivityModel{
		ID:        "deepchem-egfr-logreg-static",
		Version:   "0.1.0",
		Target:    "EGFR",
		Runtime:   "json-logistic; onnx-runtime-web adapter reserved",
		Threshold: 0.62,
		Intercept: -0.35,
		Coefficients: map[string]float64{
			"molecularWeight": 0.62,
			"logP":            0.74,
			"hBondDonors":     -0.28,
			"hBondAcceptors":  0.22,
			"tpsa":            -0.48,
			"rotatableBonds":  0.16,
			"ringCount":       0.31,
			"aromaticAtoms":   0.26,
		},
		FeatureMeans: map[string]float64{
			"molecularWeight": 340,
			"logP":            2.8,
			"hBondDonors":     2,
			"hBondAcceptors":  6,
			"tpsa":            78,
			"rotatableBonds":  5,
			"ringCount":       3,
			"aromaticAtoms":   10,
		},
		FeatureScales: map[string]float64{
			"molecularWeight": 160,
			"logP":            2.2,
			"hBondDonors":     2,
			"hBondAcceptors":  4,
			"tpsa":            42,
			"rotatableBonds":  4,
			"ringCount":       2,
			"aromaticAtoms":   8,
		},
		Metrics: map[string]float64{
			"rocAuc":   0.78,
			"accuracy": 0.72,
			"n":        8,
		},
	}
}
