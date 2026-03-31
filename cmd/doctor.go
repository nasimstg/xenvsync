package cmd

import (
	"encoding/hex"
	"fmt"
	"os"
	"runtime"
	"strings"

	"github.com/nasimstg/xenvsync/internal/vault"

	"github.com/spf13/cobra"
)

var doctorEnvName string

var doctorCmd = &cobra.Command{
	Use:   "doctor",
	Short: "Audit the local xenvsync setup for security issues",
	Long: `Checks key file permissions, .gitignore entries, key strength,
vault integrity, and identity configuration. Reports pass/fail/warning
for each check.`,
	RunE: runDoctor,
}

func init() {
	doctorCmd.Flags().StringVar(&doctorEnvName, "env", "", "environment name (e.g., staging, production)")
	rootCmd.AddCommand(doctorCmd)
}

type checkResult struct {
	Status  string // "pass", "fail", "warn", "skip"
	Message string
}

func runDoctor(cmd *cobra.Command, args []string) error {
	envName := resolveEnvName(doctorEnvName)

	eFile := defaultEnvFile
	vFile := defaultVaultFile
	if envName != "" {
		eFile = envFilePath(envName)
		vFile = vaultFilePath(envName)
	}

	var results []checkResult

	// 1. Key file exists.
	results = append(results, checkKeyExists())

	// 2. Key file permissions (Unix only).
	results = append(results, checkKeyPermissions())

	// 3. Key length / strength.
	results = append(results, checkKeyStrength())

	// 4. Key file in .gitignore.
	results = append(results, checkGitignoreEntry(keyFile))

	// 5. .env in .gitignore.
	results = append(results, checkGitignoreEntry(".env"))

	// 6. Vault structure.
	results = append(results, checkVaultStructure(vFile))

	// 7. Vault decryptable.
	results = append(results, checkVaultDecrypt(vFile))

	// 8. Stale vault check.
	results = append(results, checkStaleVault(eFile, vFile))

	// 9. Identity check.
	results = append(results, checkIdentity())

	// Print results.
	fmt.Println("xenvsync doctor")
	if envName != "" {
		fmt.Printf("  environment: %s\n", envName)
	}
	fmt.Println("───────────────────────────────────────")

	passed, warned, failed, skipped := 0, 0, 0, 0
	for _, r := range results {
		var symbol string
		switch r.Status {
		case "pass":
			symbol = "OK"
			passed++
		case "fail":
			symbol = "!!"
			failed++
		case "warn":
			symbol = "??"
			warned++
		case "skip":
			symbol = "--"
			skipped++
		}
		fmt.Printf("  %s  %s\n", symbol, r.Message)
	}

	fmt.Println("───────────────────────────────────────")
	fmt.Printf("  %d passed, %d warning(s), %d failed, %d skipped\n", passed, warned, failed, skipped)

	if failed > 0 {
		return fmt.Errorf("doctor found %d issue(s)", failed)
	}
	return nil
}

func checkKeyExists() checkResult {
	if _, err := os.Stat(keyFile); err != nil {
		return checkResult{"fail", fmt.Sprintf("Key file %s not found — run: xenvsync init", keyFile)}
	}
	return checkResult{"pass", fmt.Sprintf("Key file %s exists", keyFile)}
}

func checkKeyPermissions() checkResult {
	if runtime.GOOS == "windows" {
		return checkResult{"skip", "Key file permissions (not applicable on Windows)"}
	}

	info, err := os.Stat(keyFile)
	if err != nil {
		return checkResult{"skip", "Key file permissions (key file missing)"}
	}

	perm := info.Mode().Perm()
	if perm&0077 != 0 {
		return checkResult{"fail", fmt.Sprintf("Key file permissions: %04o — should be 0600. Run: chmod 600 %s", perm, keyFile)}
	}
	return checkResult{"pass", fmt.Sprintf("Key file permissions: %04o", perm)}
}

func checkKeyStrength() checkResult {
	raw, err := os.ReadFile(keyFile)
	if err != nil {
		return checkResult{"skip", "Key strength (key file missing)"}
	}

	keyHex := strings.TrimSpace(string(raw))
	keyBytes, err := hex.DecodeString(keyHex)
	if err != nil {
		return checkResult{"fail", "Key strength: invalid hex encoding"}
	}

	bits := len(keyBytes) * 8
	if bits < 256 {
		return checkResult{"fail", fmt.Sprintf("Key strength: %d bits — should be 256 bits", bits)}
	}

	// Check for weak patterns (all zeros, repeated bytes).
	allZero := true
	for _, b := range keyBytes {
		if b != 0 {
			allZero = false
			break
		}
	}
	if allZero {
		return checkResult{"fail", "Key strength: key is all zeros — regenerate with: xenvsync init --force"}
	}

	return checkResult{"pass", fmt.Sprintf("Key strength: %d bits", bits)}
}

func checkGitignoreEntry(entry string) checkResult {
	data, err := os.ReadFile(gitignoreFile)
	if err != nil {
		return checkResult{"warn", fmt.Sprintf("%s not found — %s may not be ignored by Git", gitignoreFile, entry)}
	}

	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		if strings.TrimSpace(line) == entry {
			return checkResult{"pass", fmt.Sprintf("%s in %s", entry, gitignoreFile)}
		}
	}
	return checkResult{"fail", fmt.Sprintf("%s not in %s — secrets may leak to Git", entry, gitignoreFile)}
}

func checkVaultStructure(vFile string) checkResult {
	data, err := os.ReadFile(vFile)
	if err != nil {
		return checkResult{"skip", fmt.Sprintf("Vault structure (%s not found)", vFile)}
	}

	if vault.IsV2(data) {
		if _, err := vault.DecodeV2(data); err != nil {
			return checkResult{"fail", fmt.Sprintf("Vault structure: invalid V2 — %v", err)}
		}
		return checkResult{"pass", "Vault structure: valid V2"}
	}

	if _, err := vault.Decode(data); err != nil {
		return checkResult{"fail", fmt.Sprintf("Vault structure: invalid V1 — %v", err)}
	}
	return checkResult{"pass", "Vault structure: valid V1"}
}

func checkVaultDecrypt(vFile string) checkResult {
	if _, err := os.Stat(vFile); err != nil {
		return checkResult{"skip", "Vault decrypt (vault not found)"}
	}

	plaintext, err := decryptVault(vFile)
	if err != nil {
		return checkResult{"fail", fmt.Sprintf("Vault decrypt: %v", err)}
	}
	return checkResult{"pass", fmt.Sprintf("Vault decrypt: OK (%d bytes)", len(plaintext))}
}

func checkStaleVault(eFile, vFile string) checkResult {
	envInfo, envErr := os.Stat(eFile)
	vaultInfo, vaultErr := os.Stat(vFile)

	if envErr != nil || vaultErr != nil {
		return checkResult{"skip", "Stale vault check (files missing)"}
	}

	if envInfo.ModTime().After(vaultInfo.ModTime()) {
		return checkResult{"warn", fmt.Sprintf("Stale vault: %s is newer than %s — run: xenvsync push", eFile, vFile)}
	}
	return checkResult{"pass", "Vault is up to date"}
}

func checkIdentity() checkResult {
	idPath, err := identityPath()
	if err != nil {
		return checkResult{"skip", "Identity check (cannot determine path)"}
	}

	if _, err := os.Stat(idPath); err != nil {
		return checkResult{"skip", "Identity: no keypair found (optional — run: xenvsync keygen)"}
	}

	if runtime.GOOS != "windows" {
		info, _ := os.Stat(idPath)
		if info != nil {
			perm := info.Mode().Perm()
			if perm&0077 != 0 {
				return checkResult{"warn", fmt.Sprintf("Identity permissions: %04o — should be 0600. Run: chmod 600 %s", perm, idPath)}
			}
		}
	}

	return checkResult{"pass", fmt.Sprintf("Identity: %s", idPath)}
}
