package cmd

import (
	"fmt"
	"os"

	"github.com/nasimstg/xenvsync/internal/crypto"
	"github.com/nasimstg/xenvsync/internal/env"
	"github.com/nasimstg/xenvsync/internal/vault"

	"github.com/spf13/cobra"
)

var (
	pullVaultFile string
	pullEnvFile   string
)

var pullCmd = &cobra.Command{
	Use:     "pull",
	Aliases: []string{"decrypt"},
	Short:   "Decrypt .env.vault into .env",
	Long: `Reads the encrypted .env.vault, decrypts it using the local
.xenvsync.key, and writes the plaintext variables to .env.
The resulting .env file is automatically excluded from Git.`,
	RunE: runPull,
}

func init() {
	pullCmd.Flags().StringVarP(&pullVaultFile, "vault", "v", defaultVaultFile, "path to the vault file")
	pullCmd.Flags().StringVarP(&pullEnvFile, "out", "o", defaultEnvFile, "path to the output .env file")
	rootCmd.AddCommand(pullCmd)
}

func runPull(cmd *cobra.Command, args []string) error {
	// 1. Load the encryption key (validates permissions).
	key, err := loadKey()
	if err != nil {
		return err
	}

	// 2. Read and decode the vault file.
	vaultRaw, err := os.ReadFile(pullVaultFile)
	if err != nil {
		return fmt.Errorf("cannot read %s: %w", pullVaultFile, err)
	}
	ciphertext, err := vault.Decode(vaultRaw)
	if err != nil {
		return fmt.Errorf("invalid vault format in %s: %w", pullVaultFile, err)
	}

	// 3. Decrypt.
	plaintext, err := crypto.Decrypt(key, ciphertext)
	if err != nil {
		return fmt.Errorf("decryption failed (wrong key?): %w", err)
	}

	// 4. Parse to validate, then write the .env file.
	pairs, err := env.Parse(plaintext)
	if err != nil {
		return fmt.Errorf("corrupt decrypted payload: %w", err)
	}

	output := env.Marshal(pairs)
	if err := os.WriteFile(pullEnvFile, output, 0644); err != nil {
		return fmt.Errorf("failed to write %s: %w", pullEnvFile, err)
	}

	fmt.Printf("Decrypted %d variable(s) → %s\n", len(pairs), pullEnvFile)
	return nil
}
