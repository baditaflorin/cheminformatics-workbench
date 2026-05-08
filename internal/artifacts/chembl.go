package artifacts

func chemblSubset() []ChemblRecord {
	return []ChemblRecord{
		record("CHEMBL25", "Aspirin", "CC(=O)Oc1ccccc1C(=O)O", "PTGS2", 4.6, "IC50", 5.34, []string{"anti-inflammatory", "COX"}),
		record("CHEMBL113", "Caffeine", "Cn1cnc2n(C)c(=O)n(C)c(=O)c12", "ADORA2A", 12.0, "Ki", 4.92, []string{"adenosine", "CNS"}),
		record("CHEMBL941", "Imatinib", "CC1=C(C=C(C=C1)NC(=O)C2=CC=CN=C2)NC3=NC=CC(=N3)C4=CN=CC=C4", "ABL1", 0.038, "IC50", 10.42, []string{"kinase", "oncology"}),
		record("CHEMBL553", "Erlotinib", "COCCOC1=C(C=C2C(=C1)N=CN=C2NC3=CC=CC(=C3)C#C)OCCOC", "EGFR", 0.002, "IC50", 11.70, []string{"kinase", "EGFR"}),
		record("CHEMBL112", "Paracetamol", "CC(=O)NC1=CC=C(C=C1)O", "PTGS2", 55.0, "IC50", 4.26, []string{"analgesic", "phenol"}),
		record("CHEMBL1464", "Warfarin", "CC(=O)CC(C1=CC=CC=C1)C2=C(O)OC3=CC=CC=C3C2=O", "VKORC1", 1.1, "IC50", 5.96, []string{"anticoagulant", "coumarin"}),
		record("CHEMBL54", "Nicotine", "CN1CCCC1C2=CN=CC=C2", "CHRNA4", 0.24, "Ki", 6.62, []string{"nicotinic", "alkaloid"}),
		record("CHEMBL1201585", "Gefitinib", "COC1=C(C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)F)Cl)OCCCN4CCOCC4", "EGFR", 0.033, "IC50", 10.48, []string{"kinase", "EGFR"}),
	}
}

func record(id string, name string, smiles string, target string, activity float64, units string, pchembl float64, tags []string) ChemblRecord {
	return ChemblRecord{
		CompoundID: id,
		Name:       name,
		SMILES:     smiles,
		Target:     target,
		Activity:   activity,
		Units:      units,
		PChEMBL:    pchembl,
		AssayType:  "B",
		Tags:       tags,
		Properties: map[string]float64{
			"pchembl": pchembl,
		},
	}
}
