package cmd

import (
	"fmt"
	"os"
	"time"

	"github.com/spf13/cobra"
)

var statusEnvName string

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show the sync state of xenvsync files",
	Long: `Reports the presence and last-modified time of .xenvsync.key, .env,
and .env.vault so you can quickly see whether files exist and which
is newer.

Use --env to check a named environment:
  xenvsync status --env staging`,
	RunE: runStatus,
}

func init() {
	statusCmd.Flags().StringVar(&statusEnvName, "env", "", "environment name (e.g., staging, production)")
	rootCmd.AddCommand(statusCmd)
}

func runStatus(cmd *cobra.Command, args []string) error {
	envName := resolveEnvName(statusEnvName)

	eFile := defaultEnvFile
	vFile := defaultVaultFile
	if envName != "" {
		eFile = envFilePath(envName)
		vFile = vaultFilePath(envName)
	}

	files := []struct {
		label string
		path  string
	}{
		{"Key file", keyFile},
		{"Env file", eFile},
		{"Vault   ", vFile},
	}

	fmt.Println("xenvsync status")
	if envName != "" {
		fmt.Printf("  environment: %s\n", envName)
	}
	fmt.Println("───────────────────────────────────────")

	var envMod, vaultMod time.Time

	for _, f := range files {
		info, err := os.Stat(f.path)
		if err != nil {
			fmt.Printf("  %s  %-24s  missing\n", f.label, f.path)
			continue
		}
		mod := info.ModTime()
		perm := info.Mode().Perm()
		fmt.Printf("  %s  %-24s  %s  (%04o)\n", f.label, f.path, mod.Format("2006-01-02 15:04:05"), perm)

		if f.path == eFile {
			envMod = mod
		}
		if f.path == vFile {
			vaultMod = mod
		}
	}

	fmt.Println("───────────────────────────────────────")

	// Warn about key file permissions.
	if info, err := os.Stat(keyFile); err == nil {
		if perm := info.Mode().Perm(); perm&0077 != 0 {
			fmt.Printf("  WARNING: %s is readable by others (mode %04o) — run: chmod 600 %s\n", keyFile, perm, keyFile)
		}
	}

	// Hint about sync direction.
	if !envMod.IsZero() && !vaultMod.IsZero() {
		if envMod.After(vaultMod) {
			fmt.Printf("  %s is newer than vault → consider running: xenvsync push", eFile)
			if envName != "" {
				fmt.Printf(" --env %s", envName)
			}
			fmt.Println()
		} else if vaultMod.After(envMod) {
			fmt.Printf("  vault is newer than %s → consider running: xenvsync pull", eFile)
			if envName != "" {
				fmt.Printf(" --env %s", envName)
			}
			fmt.Println()
		} else {
			fmt.Printf("  %s and vault have the same timestamp.\n", eFile)
		}
	}

	return nil
}
