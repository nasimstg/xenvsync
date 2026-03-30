package cmd

import (
	"fmt"
	"os"

	"github.com/nasimstg/xenvsync/internal/crypto"
	"github.com/nasimstg/xenvsync/internal/env"
	"github.com/nasimstg/xenvsync/internal/vault"

	"github.com/spf13/cobra"
)

const (
	defaultEnvFile   = ".env"
	defaultVaultFile = ".env.vault"
)

var (
	pushEnvFile    string
	pushVaultFile  string
	pushEnvName    string
	pushNoFallback bool
)

var pushCmd = &cobra.Command{
	Use:     "push",
	Aliases: []string{"encrypt"},
	Short:   "Encrypt .env into .env.vault",
	Long: `Reads the plaintext .env file, encrypts every key-value pair using
AES-256-GCM with the local .xenvsync.key, and writes the ciphertext
to .env.vault. The vault file is safe to commit to version control.

Use --env to target a named environment:
  xenvsync push --env staging    # .env.staging → .env.staging.vault

When .env.shared or .env.local files exist, variables are merged with
precedence: .env.shared < .env.<name> < .env.local. Use --no-fallback
to disable merging and encrypt only the primary file.`,
	RunE: runPush,
}

func init() {
	pushCmd.Flags().StringVarP(&pushEnvFile, "file", "e", defaultEnvFile, "path to the .env file")
	pushCmd.Flags().StringVarP(&pushVaultFile, "out", "o", defaultVaultFile, "path to the output vault file")
	pushCmd.Flags().StringVar(&pushEnvName, "env", "", "environment name (e.g., staging, production)")
	pushCmd.Flags().BoolVar(&pushNoFallback, "no-fallback", false, "disable .env.shared and .env.local merging")
	rootCmd.AddCommand(pushCmd)
}

func runPush(cmd *cobra.Command, args []string) error {
	envName := resolveEnvName(pushEnvName)

	srcFile := pushEnvFile
	dstFile := pushVaultFile
	if envName != "" {
		if srcFile == defaultEnvFile {
			srcFile = envFilePath(envName)
		}
		if dstFile == defaultVaultFile {
			dstFile = vaultFilePath(envName)
		}
	}

	// 1. Load the encryption key (validates permissions).
	key, err := loadKey()
	if err != nil {
		return err
	}

	// 2. Parse the .env file(s) with fallback merging.
	pairs, err := loadMergedPairs(srcFile, pushNoFallback)
	if err != nil {
		return fmt.Errorf("failed to parse %s: %w", srcFile, err)
	}
	if len(pairs) == 0 {
		return fmt.Errorf("%s is empty or contains no variables", srcFile)
	}

	// 3. Serialize pairs, then encrypt.
	plaintext := env.Marshal(pairs)
	ciphertext, err := crypto.Encrypt(key, plaintext)
	if err != nil {
		return fmt.Errorf("encryption failed: %w", err)
	}

	// 4. Write the vault file.
	vaultData := vault.Encode(ciphertext)
	if err := os.WriteFile(dstFile, vaultData, 0644); err != nil {
		return fmt.Errorf("failed to write %s: %w", dstFile, err)
	}

	fmt.Printf("Encrypted %d variable(s) → %s\n", len(pairs), dstFile)
	return nil
}
