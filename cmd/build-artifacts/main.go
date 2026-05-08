package main

import (
	"flag"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"time"

	"github.com/baditaflorin/cheminformatics-workbench/internal/artifacts"
	"github.com/baditaflorin/cheminformatics-workbench/internal/utils"
)

func main() {
	var outputs outputList
	schemaVersion := flag.String("schema_version", "v1", "schema version written into the static contract")
	sourceCommit := flag.String("source_commit", "local", "source commit for artifact metadata")
	start := flag.Int("start", 0, "first input row for resumable batch generation")
	end := flag.Int("end", 0, "last input row for resumable batch generation; 0 means all rows")
	concurrency := flag.Int("concurrency", 1, "worker count for larger input sets")
	saveEvery := flag.Int("save_every", 100, "checkpoint cadence for larger input sets")
	flag.Var(&outputs, "output", "artifact output directory; repeatable")
	flag.Parse()

	if len(outputs) == 0 {
		outputs = append(outputs, "public/data/v1")
	}

	slog.Info("building static artifacts", "outputs", strings.Join(outputs, ","), "start", *start, "end", *end, "concurrency", *concurrency, "save_every", *saveEvery)
	now := time.Now()
	bundle := artifacts.Generate(*schemaVersion, now)
	meta := artifacts.MetaFor(*schemaVersion, *sourceCommit, now)

	checksum, err := artifacts.ChecksumJSON(bundle.ChemblSubset)
	if err != nil {
		utils.HandleErrorOrLogWithMessages(err, "failed to checksum ChEMBL subset", "")
		os.Exit(1)
	}
	meta.InputChecksums["chembl-subset"] = checksum

	for _, output := range outputs {
		if err := artifacts.Write(output, bundle, meta); err != nil {
			utils.HandleErrorOrLogWithMessages(err, fmt.Sprintf("failed to write artifacts to %s", output), "")
			os.Exit(1)
		}
		utils.HandleErrorOrLogWithMessages(nil, "", fmt.Sprintf("wrote artifacts to %s", output))
	}
}

type outputList []string

func (o *outputList) String() string {
	return strings.Join(*o, ",")
}

func (o *outputList) Set(value string) error {
	*o = append(*o, value)
	return nil
}
