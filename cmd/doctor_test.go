package cmd

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/nasimstg/xenvsync/internal/crypto"
	"github.com/nasimstg/xenvsync/internal/vault"
)

func TestDoctor_HealthySetup(t *testing.T) {
	dir := chdirTemp(t)
	resetAllFlags()

	// Create a healthy setup.
	keyHex, _ := crypto.GenerateKey()
	_ = os.WriteFile(filepath.Join(dir, ".xenvsync.key"), []byte(keyHex), 0600)

	key, _ := crypto.DecodeKey(keyHex)
	ct, _ := crypto.Encrypt(key, []byte("SECRET=value\n"))
	_ = os.WriteFile(filepath.Join(dir, ".env.vault"), vault.Encode(ct), 0644)
	_ = os.WriteFile(filepath.Join(dir, ".env"), []byte("SECRET=value\n"), 0644)
	_ = os.WriteFile(filepath.Join(dir, ".gitignore"), []byte(".xenvsync.key\n.env\n"), 0644)

	rootCmd.SetArgs([]string{"doctor"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("doctor should pass for healthy setup: %v", err)
	}
}

func TestDoctor_MissingKeyFile(t *testing.T) {
	_ = chdirTemp(t)
	resetAllFlags()

	// No key file — doctor should report failure.
	rootCmd.SetArgs([]string{"doctor"})
	err := rootCmd.Execute()
	if err == nil {
		t.Fatal("doctor should fail when key file is missing")
	}
}

func TestDoctor_MissingGitignoreEntry(t *testing.T) {
	dir := chdirTemp(t)
	resetAllFlags()

	// Key exists, .gitignore exists but doesn't include .xenvsync.key.
	keyHex, _ := crypto.GenerateKey()
	_ = os.WriteFile(filepath.Join(dir, ".xenvsync.key"), []byte(keyHex), 0600)
	_ = os.WriteFile(filepath.Join(dir, ".gitignore"), []byte("node_modules/\n"), 0644)

	rootCmd.SetArgs([]string{"doctor"})
	err := rootCmd.Execute()
	if err == nil {
		t.Fatal("doctor should fail when .gitignore is missing key entry")
	}
}

func TestDoctor_NamedEnv(t *testing.T) {
	dir := chdirTemp(t)
	resetAllFlags()

	keyHex, _ := crypto.GenerateKey()
	_ = os.WriteFile(filepath.Join(dir, ".xenvsync.key"), []byte(keyHex), 0600)
	_ = os.WriteFile(filepath.Join(dir, ".gitignore"), []byte(".xenvsync.key\n.env\n"), 0644)

	key, _ := crypto.DecodeKey(keyHex)
	ct, _ := crypto.Encrypt(key, []byte("DB=staging\n"))
	_ = os.WriteFile(filepath.Join(dir, ".env.staging.vault"), vault.Encode(ct), 0644)
	_ = os.WriteFile(filepath.Join(dir, ".env.staging"), []byte("DB=staging\n"), 0644)

	rootCmd.SetArgs([]string{"doctor", "--env", "staging"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("doctor --env staging: %v", err)
	}
}

func TestPassphraseProtectedKey(t *testing.T) {
	dir := chdirTemp(t)
	resetAllFlags()

	// Create a passphrase-protected key.
	t.Setenv("XENVSYNC_PASSPHRASE", "test-pass-123")

	initPassphrase = true
	forceInit = true
	rootCmd.SetArgs([]string{"init", "--force", "--passphrase"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("init --passphrase: %v", err)
	}

	// Verify key file has enc: prefix.
	keyData, _ := os.ReadFile(filepath.Join(dir, ".xenvsync.key"))
	if !crypto.IsPassphraseProtected(keyData) {
		t.Fatal("key file should have enc: prefix")
	}

	// Push should work with passphrase.
	_ = os.WriteFile(filepath.Join(dir, ".env"), []byte("SECRET=test\n"), 0644)
	resetAllFlags()
	pushNoFallback = true
	rootCmd.SetArgs([]string{"push", "--no-fallback"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("push with passphrase key: %v", err)
	}

	// Pull should work with passphrase.
	_ = os.Remove(filepath.Join(dir, ".env"))
	resetAllFlags()
	rootCmd.SetArgs([]string{"pull"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("pull with passphrase key: %v", err)
	}

	restored, _ := os.ReadFile(filepath.Join(dir, ".env"))
	if len(restored) == 0 {
		t.Fatal(".env not restored")
	}
}

func TestPassphraseProtectedKey_NoPassphrase(t *testing.T) {
	dir := chdirTemp(t)
	resetAllFlags()

	// Create a passphrase-protected key.
	t.Setenv("XENVSYNC_PASSPHRASE", "test-pass-123")
	initPassphrase = true
	forceInit = true
	rootCmd.SetArgs([]string{"init", "--force", "--passphrase"})
	_ = rootCmd.Execute()

	_ = os.WriteFile(filepath.Join(dir, ".env"), []byte("SECRET=test\n"), 0644)
	resetAllFlags()
	pushNoFallback = true
	rootCmd.SetArgs([]string{"push", "--no-fallback"})
	_ = rootCmd.Execute()

	// Unset passphrase — pull should fail.
	t.Setenv("XENVSYNC_PASSPHRASE", "")
	resetAllFlags()
	rootCmd.SetArgs([]string{"pull"})
	err := rootCmd.Execute()
	if err == nil {
		t.Fatal("pull should fail without passphrase for protected key")
	}
}
