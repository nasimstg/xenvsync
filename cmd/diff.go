package cmd

import (
	"fmt"
	"os"
	"sort"

	"github.com/nasimstg/xenvsync/internal/crypto"
	"github.com/nasimstg/xenvsync/internal/env"
	"github.com/nasimstg/xenvsync/internal/vault"

	"github.com/spf13/cobra"
)

var (
	diffEnvFile   string
	diffVaultFile string
)

var diffCmd = &cobra.Command{
	Use:   "diff",
	Short: "Show differences between .env and .env.vault",
	Long: `Decrypts the vault and compares its contents to the current .env file.
Displays added, removed, and changed variables so you can preview
what a push or pull would do.`,
	RunE: runDiff,
}

func init() {
	diffCmd.Flags().StringVarP(&diffEnvFile, "env", "e", defaultEnvFile, "path to the .env file")
	diffCmd.Flags().StringVarP(&diffVaultFile, "vault", "v", defaultVaultFile, "path to the vault file")
	rootCmd.AddCommand(diffCmd)
}

func runDiff(cmd *cobra.Command, args []string) error {
	// Load key (validates permissions).
	key, err := loadKey()
	if err != nil {
		return err
	}

	// Parse current .env (may not exist).
	envPairs, envErr := env.ParseFile(diffEnvFile)
	envMap := pairsToMap(envPairs)

	// Decrypt vault (may not exist).
	var vaultMap map[string]string
	vaultRaw, vaultReadErr := os.ReadFile(diffVaultFile)
	if vaultReadErr == nil {
		ciphertext, err := vault.Decode(vaultRaw)
		if err != nil {
			return fmt.Errorf("invalid vault format: %w", err)
		}
		plaintext, err := crypto.Decrypt(key, ciphertext)
		if err != nil {
			return fmt.Errorf("decryption failed: %w", err)
		}
		vaultPairs, err := env.Parse(plaintext)
		if err != nil {
			return fmt.Errorf("corrupt vault payload: %w", err)
		}
		vaultMap = pairsToMap(vaultPairs)
	}

	if envErr != nil && vaultReadErr != nil {
		return fmt.Errorf("neither %s nor %s found", diffEnvFile, diffVaultFile)
	}

	// Collect all keys.
	allKeys := make(map[string]bool)
	for k := range envMap {
		allKeys[k] = true
	}
	for k := range vaultMap {
		allKeys[k] = true
	}

	sorted := make([]string, 0, len(allKeys))
	for k := range allKeys {
		sorted = append(sorted, k)
	}
	sort.Strings(sorted)

	changes := 0
	for _, k := range sorted {
		envVal, inEnv := envMap[k]
		vaultVal, inVault := vaultMap[k]

		switch {
		case inEnv && !inVault:
			fmt.Printf("+ %s=%s  (in .env only, not yet pushed)\n", k, envVal)
			changes++
		case !inEnv && inVault:
			fmt.Printf("- %s=%s  (in vault only, not yet pulled)\n", k, vaultVal)
			changes++
		case envVal != vaultVal:
			fmt.Printf("~ %s  (changed)\n", k)
			fmt.Printf("    .env:   %s\n", envVal)
			fmt.Printf("    vault:  %s\n", vaultVal)
			changes++
		}
	}

	if changes == 0 {
		fmt.Println("No differences — .env and vault are in sync.")
	}
	return nil
}

func pairsToMap(pairs []env.Pair) map[string]string {
	m := make(map[string]string, len(pairs))
	for _, p := range pairs {
		m[p.Key] = p.Value
	}
	return m
}
