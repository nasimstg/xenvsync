package cmd

import (
	"fmt"
	"os"

	"github.com/nasimstg/xenvsync/internal/env"

	"github.com/spf13/cobra"
)

var (
	diffEnvFile    string
	diffVaultFile  string
	diffEnvName    string
	diffShowValues bool
)

var diffCmd = &cobra.Command{
	Use:   "diff",
	Short: "Show differences between .env and .env.vault",
	Long: `Decrypts the vault and compares its contents to the current .env file.
Displays added, removed, and changed variables so you can preview
what a push or pull would do.

By default, only key names are shown (values are hidden). Use
--show-values to display actual values.

Use --env to target a named environment:
  xenvsync diff --env staging`,
	RunE: runDiff,
}

func init() {
	diffCmd.Flags().StringVarP(&diffEnvFile, "file", "e", defaultEnvFile, "path to the .env file")
	diffCmd.Flags().StringVarP(&diffVaultFile, "vault", "v", defaultVaultFile, "path to the vault file")
	diffCmd.Flags().StringVar(&diffEnvName, "env", "", "environment name (e.g., staging, production)")
	diffCmd.Flags().BoolVar(&diffShowValues, "show-values", false, "display actual values in output (sensitive)")
	rootCmd.AddCommand(diffCmd)
}

func runDiff(cmd *cobra.Command, args []string) error {
	envName, err := resolveEnvName(diffEnvName)
	if err != nil {
		return err
	}

	eFile := diffEnvFile
	vFile := diffVaultFile
	if envName != "" {
		if eFile == defaultEnvFile {
			eFile = envFilePath(envName)
		}
		if vFile == defaultVaultFile {
			vFile = vaultFilePath(envName)
		}
	}

	// Parse current .env (may not exist).
	envPairs, envErr := env.ParseFile(eFile)

	// Decrypt vault (may not exist).
	vaultPairs, vaultErr := decryptVaultPairs(vFile)

	if envErr != nil && vaultErr != nil && os.IsNotExist(envErr) && os.IsNotExist(vaultErr) {
		return fmt.Errorf("neither %s nor %s found", eFile, vFile)
	}

	if envErr != nil && !os.IsNotExist(envErr) {
		return fmt.Errorf("failed to parse %s: %w", eFile, envErr)
	}
	if vaultErr != nil && !os.IsNotExist(vaultErr) {
		return fmt.Errorf("failed to read/decrypt %s: %w", vFile, vaultErr)
	}

	if envErr != nil && os.IsNotExist(envErr) {
		envPairs = nil
	}
	if vaultErr != nil && os.IsNotExist(vaultErr) {
		vaultPairs = nil
	}

	changes := computeKeyChanges(vaultPairs, envPairs)

	if len(changes) == 0 {
		fmt.Println("No differences — .env and vault are in sync.")
		return nil
	}

	fmt.Print(formatKeyChanges(changes, diffShowValues, ".env", "vault"))
	fmt.Println(changeSummary(changes))
	return nil
}
