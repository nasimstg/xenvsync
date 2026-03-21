package main

import (
	"os"

	"github.com/nasimstg/xenvsync/cmd"
)

// Set via ldflags at build time (see .goreleaser.yml / Makefile).
var (
	version = "dev"
	commit  = "none"
	date    = "unknown"
)

func main() {
	cmd.SetVersion(version, commit, date)
	if err := cmd.Execute(); err != nil {
		os.Exit(1)
	}
}
