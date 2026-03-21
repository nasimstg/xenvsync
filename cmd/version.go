package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var (
	buildVersion = "dev"
	buildCommit  = "none"
	buildDate    = "unknown"
)

// SetVersion is called from main.go to inject build-time variables.
func SetVersion(version, commit, date string) {
	buildVersion = version
	buildCommit = commit
	buildDate = date
	rootCmd.Version = version
}

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version and build information",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("xenvsync %s\n", buildVersion)
		fmt.Printf("  commit: %s\n", buildCommit)
		fmt.Printf("  built:  %s\n", buildDate)
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}
