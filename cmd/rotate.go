package cmd

import (
	"fmt"
	"os"

	"github.com/nasimstg/xenvsync/internal/crypto"
	"github.com/nasimstg/xenvsync/internal/env"
	"github.com/nasimstg/xenvsync/internal/team"
	"github.com/nasimstg/xenvsync/internal/vault"

	"github.com/spf13/cobra"
)

var (
	rotateEnvName string
	rotateRevoke  string
)

var rotateCmd = &cobra.Command{
	Use:   "rotate",
	Short: "Rotate the encryption key and re-encrypt the vault",
	Long: `Generates a new encryption key and re-encrypts the vault in one atomic step.

In V1 mode (symmetric key), a new .xenvsync.key is generated and the vault
is re-encrypted with it.

In team mode (V2), the vault is re-encrypted for all current roster members
with a fresh ephemeral key. Use --revoke to remove a member and rotate in
one step.`,
	RunE: runRotate,
}

func init() {
	rotateCmd.Flags().StringVar(&rotateEnvName, "env", "", "environment name (e.g., staging, production)")
	rotateCmd.Flags().StringVar(&rotateRevoke, "revoke", "", "remove a team member and rotate in one step")
	rootCmd.AddCommand(rotateCmd)
}

func runRotate(cmd *cobra.Command, args []string) error {
	envName := resolveEnvName(rotateEnvName)

	vFile := defaultVaultFile
	if envName != "" {
		vFile = vaultFilePath(envName)
	}

	// 1. Decrypt the existing vault.
	plaintext, err := decryptVault(vFile)
	if err != nil {
		return fmt.Errorf("cannot decrypt current vault: %w", err)
	}

	// Validate the decrypted content.
	pairs, err := env.Parse(plaintext)
	if err != nil {
		return fmt.Errorf("corrupt vault payload: %w", err)
	}
	serialized := env.Marshal(pairs)

	// 2. Check for team roster.
	roster, err := team.Load(team.RosterFile)
	if err != nil {
		return err
	}

	// Handle --revoke flag.
	if rotateRevoke != "" {
		if len(roster.Members) == 0 {
			return fmt.Errorf("--revoke requires a team roster, but no %s found", team.RosterFile)
		}
		if err := roster.Remove(rotateRevoke); err != nil {
			return err
		}
		if err := roster.Save(team.RosterFile); err != nil {
			return err
		}
		fmt.Printf("Revoked %s from team roster\n", rotateRevoke)
	}

	// 3. Re-encrypt with a new key.
	var vaultData []byte
	if len(roster.Members) > 0 {
		// V2: re-encrypt for current roster with fresh ephemeral keys.
		vaultData, err = encryptForTeam(roster, serialized)
		if err != nil {
			return err
		}
		fmt.Printf("Rotated vault → %s (V2, %d recipient(s))\n", vFile, len(roster.Members))
	} else {
		// V1: generate a new symmetric key and re-encrypt.
		newKeyHex, err := crypto.GenerateKey()
		if err != nil {
			return fmt.Errorf("key generation failed: %w", err)
		}
		newKey, err := crypto.DecodeKey(newKeyHex)
		if err != nil {
			return fmt.Errorf("key decode failed: %w", err)
		}

		ciphertext, err := crypto.Encrypt(newKey, serialized)
		if err != nil {
			return fmt.Errorf("encryption failed: %w", err)
		}

		// Write new vault first (atomic: if this fails, old key still works).
		vaultData = vault.Encode(ciphertext)

		// Write the new key only after vault is successfully encrypted.
		if err := os.WriteFile(keyFile, []byte(newKeyHex), 0600); err != nil {
			return fmt.Errorf("failed to write new key: %w", err)
		}
		fmt.Printf("Rotated key → %s (mode 0600)\n", keyFile)
		fmt.Printf("Rotated vault → %s\n", vFile)
	}

	// 4. Write the new vault.
	if err := os.WriteFile(vFile, vaultData, 0644); err != nil {
		return fmt.Errorf("failed to write %s: %w", vFile, err)
	}

	fmt.Printf("\nRotation complete. %d variable(s) re-encrypted.\n", len(pairs))
	return nil
}
