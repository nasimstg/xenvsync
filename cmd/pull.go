package cmd

import (
	"fmt"
	"os"

	"github.com/nasimstg/xenvsync/internal/env"

	"github.com/spf13/cobra"
)

var (
	pullVaultFile string
	pullEnvFile   string
	pullEnvName   string
)

var pullCmd = &cobra.Command{
	Use:     "pull",
	Aliases: []string{"decrypt"},
	Short:   "Decrypt .env.vault into .env",
	Long: `Reads the encrypted .env.vault, decrypts it using the local
.xenvsync.key, and writes the plaintext variables to .env.
The resulting .env file is automatically excluded from Git.

Use --env to target a named environment:
  xenvsync pull --env staging    # .env.staging.vault → .env.staging`,
	RunE: runPull,
}

func init() {
	pullCmd.Flags().StringVarP(&pullVaultFile, "vault", "v", defaultVaultFile, "path to the vault file")
	pullCmd.Flags().StringVarP(&pullEnvFile, "out", "o", defaultEnvFile, "path to the output .env file")
	pullCmd.Flags().StringVar(&pullEnvName, "env", "", "environment name (e.g., staging, production)")
	rootCmd.AddCommand(pullCmd)
}

func runPull(cmd *cobra.Command, args []string) error {
	envName, err := resolveEnvName(pullEnvName)
	if err != nil {
		return err
	}

	srcFile := pullVaultFile
	dstFile := pullEnvFile
	if envName != "" {
		if srcFile == defaultVaultFile {
			srcFile = vaultFilePath(envName)
		}
		if dstFile == defaultEnvFile {
			dstFile = envFilePath(envName)
		}
	}

	// 1. Decrypt the vault (handles V1 and V2 automatically).
	plaintext, err := decryptVault(srcFile)
	if err != nil {
		return err
	}

	// 2. Parse to validate, then write the .env file.
	pairs, err := env.Parse(plaintext)
	if err != nil {
		return fmt.Errorf("corrupt decrypted payload: %w", err)
	}

	output := env.Marshal(pairs)
	if err := os.WriteFile(dstFile, output, 0644); err != nil {
		return fmt.Errorf("failed to write %s: %w", dstFile, err)
	}

	fmt.Printf("Decrypted %d variable(s) → %s\n", len(pairs), dstFile)
	return nil
}
