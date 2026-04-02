package cmd

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/nasimstg/xenvsync/internal/crypto"
	"github.com/nasimstg/xenvsync/internal/vault"
)

func TestVerify_ValidV1Vault(t *testing.T) {
	dir := chdirTemp(t)
	resetAllFlags()

	// Create a valid V1 vault.
	keyHex, _ := crypto.GenerateKey()
	_ = os.WriteFile(filepath.Join(dir, ".xenvsync.key"), []byte(keyHex), 0600)

	key, _ := crypto.DecodeKey(keyHex)
	ct, _ := crypto.Encrypt(key, []byte("SECRET=value\n"))
	_ = os.WriteFile(filepath.Join(dir, ".env.vault"), vault.Encode(ct), 0644)
	_ = os.WriteFile(filepath.Join(dir, ".env"), []byte("SECRET=value\n"), 0644)

	rootCmd.SetArgs([]string{"verify"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("verify should pass for valid vault: %v", err)
	}
}

func TestVerify_TamperedVault(t *testing.T) {
	dir := chdirTemp(t)
	resetAllFlags()

	// Create a valid V1 vault, then tamper with it.
	keyHex, _ := crypto.GenerateKey()
	_ = os.WriteFile(filepath.Join(dir, ".xenvsync.key"), []byte(keyHex), 0600)

	key, _ := crypto.DecodeKey(keyHex)
	ct, _ := crypto.Encrypt(key, []byte("SECRET=value\n"))
	vaultData := vault.Encode(ct)

	// Flip some bytes in the base64 payload.
	tampered := strings.Replace(string(vaultData), string(vaultData[30:35]), "XXXXX", 1)
	_ = os.WriteFile(filepath.Join(dir, ".env.vault"), []byte(tampered), 0644)

	rootCmd.SetArgs([]string{"verify"})
	err := rootCmd.Execute()
	if err == nil {
		t.Fatal("verify should fail for tampered vault")
	}
}

func TestVerify_MissingVault(t *testing.T) {
	_ = chdirTemp(t)
	resetAllFlags()

	// No vault file at all — should not error (just skip).
	_ = os.WriteFile(".env", []byte("KEY=value\n"), 0644)

	rootCmd.SetArgs([]string{"verify"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("verify should not error when vault is missing: %v", err)
	}
}

func TestVerify_DuplicateKeys(t *testing.T) {
	_ = chdirTemp(t)
	resetAllFlags()

	// Create .env with duplicate keys.
	_ = os.WriteFile(".env", []byte("KEY=first\nKEY=second\nOTHER=value\n"), 0644)

	rootCmd.SetArgs([]string{"verify"})
	// Should not error (duplicates are warnings, not failures).
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("verify should not fail for duplicate keys: %v", err)
	}
}

func TestFindDuplicateKeys(t *testing.T) {
	data := []byte("A=1\nB=2\nA=3\nC=4\nB=5\nB=6\n")
	dupes, err := findDuplicateKeys(data)
	if err != nil {
		t.Fatalf("unexpected parse error: %v", err)
	}

	if len(dupes) != 2 {
		t.Fatalf("expected 2 duplicate keys, got %d", len(dupes))
	}

	dupeMap := make(map[string]int)
	for _, d := range dupes {
		dupeMap[d.Key] = d.Count
	}

	if dupeMap["A"] != 2 {
		t.Errorf("A should appear 2 times, got %d", dupeMap["A"])
	}
	if dupeMap["B"] != 3 {
		t.Errorf("B should appear 3 times, got %d", dupeMap["B"])
	}
}

func TestFindDuplicateKeys_NoDupes(t *testing.T) {
	data := []byte("A=1\nB=2\nC=3\n")
	dupes, err := findDuplicateKeys(data)
	if err != nil {
		t.Fatalf("unexpected parse error: %v", err)
	}
	if len(dupes) != 0 {
		t.Fatalf("expected 0 duplicates, got %d", len(dupes))
	}
}

func TestFindDuplicateKeys_InvalidEnv(t *testing.T) {
	data := []byte("INVALID_LINE\n")
	_, err := findDuplicateKeys(data)
	if err == nil {
		t.Fatal("expected parse error for malformed .env input")
	}
}

func TestVerifyVaultStructure_V1(t *testing.T) {
	keyHex, _ := crypto.GenerateKey()
	key, _ := crypto.DecodeKey(keyHex)
	ct, _ := crypto.Encrypt(key, []byte("test"))
	vaultData := vault.Encode(ct)

	ok, msg := verifyVaultStructure(vaultData)
	if !ok {
		t.Fatalf("expected valid V1: %s", msg)
	}
	if !strings.Contains(msg, "V1") {
		t.Fatalf("expected V1 mention: %s", msg)
	}
}

func TestVerifyVaultStructure_Invalid(t *testing.T) {
	ok, _ := verifyVaultStructure([]byte("not a vault"))
	if ok {
		t.Fatal("expected invalid for garbage data")
	}
}

func TestVerify_NamedEnv(t *testing.T) {
	dir := chdirTemp(t)
	resetAllFlags()

	keyHex, _ := crypto.GenerateKey()
	_ = os.WriteFile(filepath.Join(dir, ".xenvsync.key"), []byte(keyHex), 0600)

	key, _ := crypto.DecodeKey(keyHex)
	ct, _ := crypto.Encrypt(key, []byte("DB=staging\n"))
	_ = os.WriteFile(filepath.Join(dir, ".env.staging.vault"), vault.Encode(ct), 0644)
	_ = os.WriteFile(filepath.Join(dir, ".env.staging"), []byte("DB=staging\n"), 0644)

	rootCmd.SetArgs([]string{"verify", "--env", "staging"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("verify --env staging should pass: %v", err)
	}
}
