package artifacts

func descriptorSpecs() []DescriptorSpec {
	return []DescriptorSpec{
		spec("molecularWeight", "Molecular weight", "Da", "Estimated exact molecular mass from parsed atoms.", 0, 900),
		spec("logP", "cLogP estimate", "", "Fragment-style hydrophobicity estimate for rapid triage.", -4, 8),
		spec("hBondDonors", "H-bond donors", "count", "Approximate donor count from N/O/S atoms.", 0, 12),
		spec("hBondAcceptors", "H-bond acceptors", "count", "Approximate acceptor count from N/O/S/F atoms.", 0, 18),
		spec("tpsa", "TPSA estimate", "A^2", "Fast polar surface proxy used by the bundled model.", 0, 220),
		spec("rotatableBonds", "Rotatable bonds", "count", "Single-bond proxy for ligand flexibility.", 0, 20),
		spec("ringCount", "Ring count", "count", "Ring closure digit count in SMILES.", 0, 8),
		spec("aromaticAtoms", "Aromatic atoms", "count", "Lowercase aromatic atom tokens in SMILES.", 0, 40),
	}
}

func spec(key string, label string, units string, description string, minValue float64, maxValue float64) DescriptorSpec {
	return DescriptorSpec{
		Key:         key,
		Label:       label,
		Units:       units,
		Description: description,
		Minimum:     minValue,
		Maximum:     maxValue,
	}
}
