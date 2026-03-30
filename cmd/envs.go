package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var envsCmd = &cobra.Command{
	Use:   "envs",
	Short: "List discovered environments",
	Long: `Scans the current directory for .env.* and .env.*.vault files and
displays all discovered environments with their sync status.

Example output:
  (default)    .env + .env.vault           synced
  staging      .env.staging + .env.staging.vault  synced
  production   .env.production.vault       not pulled`,
	RunE: runEnvs,
}

func init() {
	rootCmd.AddCommand(envsCmd)
}

func runEnvs(cmd *cobra.Command, args []string) error {
	envs := discoverEnvironments()

	if len(envs) == 0 {
		fmt.Println("No environments found.")
		fmt.Println("Run `xenvsync init` to get started.")
		return nil
	}

	fmt.Println("Discovered environments:")
	fmt.Println("───────────────────────────────────────")

	for _, e := range envs {
		files := ""
		switch {
		case e.HasEnv && e.HasVault:
			files = envLabel(e.Name) + " + " + vaultLabel(e.Name)
		case e.HasEnv:
			files = envLabel(e.Name)
		case e.HasVault:
			files = vaultLabel(e.Name)
		}

		fmt.Printf("  %-14s %-36s %s\n", e.Name, files, e.SyncStatus())
	}

	return nil
}

func envLabel(name string) string {
	if name == "(default)" {
		return ".env"
	}
	return ".env." + name
}

func vaultLabel(name string) string {
	if name == "(default)" {
		return ".env.vault"
	}
	return ".env." + name + ".vault"
}
