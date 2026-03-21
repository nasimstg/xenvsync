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
	pushEnvFile   string
	pushVaultFile string
)

var pushCmd = &cobra.Command{
	Use:     "push",
	Aliases: []string{"encrypt"},
	Short:   "Encrypt .env into .env.vault",
	Long: `Reads the plaintext .env file, encrypts every key-value pair using
AES-256-GCM with the local .xenvsync.key, and writes the ciphertext
to .env.vault. The vault file is safe to commit to version control.`,
	RunE: runPush,
}

func init() {
	pushCmd.Flags().StringVarP(&pushEnvFile, "env", "e", defaultEnvFile, "path to the .env file")
	pushCmd.Flags().StringVarP(&pushVaultFile, "out", "o", defaultVaultFile, "path to the output vault file")
	rootCmd.AddCommand(pushCmd)
}

func runPush(cmd *cobra.Command, args []string) error {
	// 1. Load the encryption key (validates permissions).
	key, err := loadKey()
	if err != nil {
		return err
	}

	// 2. Parse the .env file into ordered key-value pairs.
	pairs, err := env.ParseFile(pushEnvFile)
	if err != nil {
		return fmt.Errorf("failed to parse %s: %w", pushEnvFile, err)
	}
	if len(pairs) == 0 {
		return fmt.Errorf("%s is empty or contains no variables", pushEnvFile)
	}

	// 3. Serialize pairs, then encrypt.
	plaintext := env.Marshal(pairs)
	ciphertext, err := crypto.Encrypt(key, plaintext)
	if err != nil {
		return fmt.Errorf("encryption failed: %w", err)
	}

	// 4. Write the vault file.
	vaultData := vault.Encode(ciphertext)
	if err := os.WriteFile(pushVaultFile, vaultData, 0644); err != nil {
		return fmt.Errorf("failed to write %s: %w", pushVaultFile, err)
	}

	fmt.Printf("Encrypted %d variable(s) → %s\n", len(pairs), pushVaultFile)
	return nil
}
