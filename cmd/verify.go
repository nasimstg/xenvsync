package cmd

import (
	"encoding/base64"
	"fmt"
	"os"

	"github.com/nasimstg/xenvsync/internal/env"
	"github.com/nasimstg/xenvsync/internal/vault"

	"github.com/spf13/cobra"
)

var (
	verifyEnvName string
)

var verifyCmd = &cobra.Command{
	Use:   "verify",
	Short: "Verify vault integrity and .env consistency",
	Long: `Validates the vault file's structural integrity (format, base64, headers)
and optionally decrypts to verify the GCM authentication tag.

Also checks the .env file for duplicate keys.

Without a key or identity, only structural checks are performed.
With a key or identity available, a full decrypt + authenticate is done.`,
	RunE: runVerify,
}

func init() {
	verifyCmd.Flags().StringVar(&verifyEnvName, "env", "", "environment name (e.g., staging, production)")
	rootCmd.AddCommand(verifyCmd)
}

func runVerify(cmd *cobra.Command, args []string) error {
	envName := resolveEnvName(verifyEnvName)

	eFile := defaultEnvFile
	vFile := defaultVaultFile
	if envName != "" {
		eFile = envFilePath(envName)
		vFile = vaultFilePath(envName)
	}

	passed := 0
	warnings := 0
	failed := 0

	// 1. Structural vault check.
	vaultRaw, vaultErr := os.ReadFile(vFile)
	if vaultErr != nil {
		fmt.Printf("SKIP  vault structure — %s not found\n", vFile)
	} else {
		structOk, structMsg := verifyVaultStructure(vaultRaw)
		if structOk {
			fmt.Printf("PASS  vault structure — %s\n", structMsg)
			passed++
		} else {
			fmt.Printf("FAIL  vault structure — %s\n", structMsg)
			failed++
		}
	}

	// 2. Full decrypt + GCM auth check (if key/identity available).
	if vaultErr == nil {
		plaintext, err := decryptVaultBytes(vaultRaw)
		if err != nil {
			fmt.Printf("FAIL  vault decrypt — %v\n", err)
			failed++
		} else {
			pairs, err := env.Parse(plaintext)
			if err != nil {
				fmt.Printf("FAIL  vault payload — decrypted content is not valid .env format: %v\n", err)
				failed++
			} else {
				fmt.Printf("PASS  vault decrypt — GCM authenticated, %d variable(s)\n", len(pairs))
				passed++
			}
		}
	}

	// 3. Duplicate key check on .env file.
	envData, envErr := os.ReadFile(eFile)
	if envErr != nil {
		fmt.Printf("SKIP  duplicate keys — %s not found\n", eFile)
	} else {
		dupes := findDuplicateKeys(envData)
		if len(dupes) == 0 {
			fmt.Printf("PASS  duplicate keys — no duplicates in %s\n", eFile)
			passed++
		} else {
			for _, d := range dupes {
				fmt.Printf("WARN  duplicate key %q appears %d times in %s\n", d.Key, d.Count, eFile)
			}
			warnings += len(dupes)
		}
	}

	// 4. Stale vault check (env newer than vault).
	if vaultErr == nil && envErr == nil {
		envInfo, _ := os.Stat(eFile)
		vaultInfo, _ := os.Stat(vFile)
		if envInfo != nil && vaultInfo != nil {
			if envInfo.ModTime().After(vaultInfo.ModTime()) {
				fmt.Printf("WARN  stale vault — %s is newer than %s (consider running: xenvsync push)\n", eFile, vFile)
				warnings++
			} else {
				fmt.Printf("PASS  vault freshness — %s is up to date\n", vFile)
				passed++
			}
		}
	}

	// Summary.
	fmt.Println()
	fmt.Printf("Verification complete: %d passed", passed)
	if warnings > 0 {
		fmt.Printf(", %d warning(s)", warnings)
	}
	if failed > 0 {
		fmt.Printf(", %d failed", failed)
	}
	fmt.Println()

	if failed > 0 {
		return fmt.Errorf("verification failed with %d error(s)", failed)
	}
	return nil
}

// verifyVaultStructure checks if vault data has valid format without decrypting.
func verifyVaultStructure(data []byte) (bool, string) {
	if vault.IsV2(data) {
		v2, err := vault.DecodeV2(data)
		if err != nil {
			return false, fmt.Sprintf("invalid V2 structure: %v", err)
		}
		for _, slot := range v2.Slots {
			if _, err := base64.StdEncoding.DecodeString(slot.EphemeralPub); err != nil {
				return false, fmt.Sprintf("slot %q has invalid ephemeral_pub base64", slot.Name)
			}
			if _, err := base64.StdEncoding.DecodeString(slot.EncryptedKey); err != nil {
				return false, fmt.Sprintf("slot %q has invalid encrypted_key base64", slot.Name)
			}
		}
		return true, fmt.Sprintf("valid V2 vault with %d key slot(s)", len(v2.Slots))
	}

	// V1 check.
	_, err := vault.Decode(data)
	if err != nil {
		return false, fmt.Sprintf("invalid V1 structure: %v", err)
	}
	return true, "valid V1 vault"
}

type duplicateKey struct {
	Key   string
	Count int
}

// findDuplicateKeys scans env-formatted data for keys that appear more than once.
func findDuplicateKeys(data []byte) []duplicateKey {
	pairs, err := env.Parse(data)
	if err != nil {
		return nil
	}

	counts := make(map[string]int)
	for _, p := range pairs {
		counts[p.Key]++
	}

	var dupes []duplicateKey
	for k, c := range counts {
		if c > 1 {
			dupes = append(dupes, duplicateKey{Key: k, Count: c})
		}
	}
	return dupes
}
