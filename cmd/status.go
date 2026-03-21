package cmd

import (
	"fmt"
	"os"
	"time"

	"github.com/spf13/cobra"
)

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show the sync state of xenvsync files",
	Long: `Reports the presence and last-modified time of .xenvsync.key, .env,
and .env.vault so you can quickly see whether files exist and which
is newer.`,
	RunE: runStatus,
}

func init() {
	rootCmd.AddCommand(statusCmd)
}

func runStatus(cmd *cobra.Command, args []string) error {
	files := []struct {
		label string
		path  string
	}{
		{"Key file", keyFile},
		{"Env file", defaultEnvFile},
		{"Vault   ", defaultVaultFile},
	}

	fmt.Println("xenvsync status")
	fmt.Println("───────────────────────────────────────")

	var envMod, vaultMod time.Time

	for _, f := range files {
		info, err := os.Stat(f.path)
		if err != nil {
			fmt.Printf("  %s  %-16s  missing\n", f.label, f.path)
			continue
		}
		mod := info.ModTime()
		perm := info.Mode().Perm()
		fmt.Printf("  %s  %-16s  %s  (%04o)\n", f.label, f.path, mod.Format("2006-01-02 15:04:05"), perm)

		if f.path == defaultEnvFile {
			envMod = mod
		}
		if f.path == defaultVaultFile {
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
			fmt.Println("  .env is newer than vault → consider running: xenvsync push")
		} else if vaultMod.After(envMod) {
			fmt.Println("  vault is newer than .env → consider running: xenvsync pull")
		} else {
			fmt.Println("  .env and vault have the same timestamp.")
		}
	}

	return nil
}
