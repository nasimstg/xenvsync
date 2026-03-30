package cmd

import (
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"github.com/nasimstg/xenvsync/internal/crypto"
)

func setTempHome(t *testing.T) string {
	t.Helper()
	tmpHome := t.TempDir()
	t.Setenv("HOME", tmpHome)
	t.Setenv("USERPROFILE", tmpHome) // Windows
	return tmpHome
}

func TestKeygen_CreatesIdentity(t *testing.T) {
	tmpHome := setTempHome(t)
	keygenForce = false

	rootCmd.SetArgs([]string{"keygen"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("keygen failed: %v", err)
	}

	idPath := filepath.Join(tmpHome, ".xenvsync", "identity")
	info, err := os.Stat(idPath)
	if err != nil {
		t.Fatalf("identity file not created: %v", err)
	}

	if runtime.GOOS != "windows" {
		if perm := info.Mode().Perm(); perm != 0600 {
			t.Fatalf("identity perm = %o, want 0600", perm)
		}
	}

	// Should be a valid private key.
	raw, _ := os.ReadFile(idPath)
	_, err = crypto.DecodePrivateKey(strings.TrimSpace(string(raw)))
	if err != nil {
		t.Fatalf("identity is not a valid key: %v", err)
	}
}

func TestKeygen_RefusesOverwrite(t *testing.T) {
	tmpHome := setTempHome(t)
	keygenForce = false

	idDir := filepath.Join(tmpHome, ".xenvsync")
	if err := os.MkdirAll(idDir, 0700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(idDir, "identity"), []byte("existing"), 0600); err != nil {
		t.Fatal(err)
	}

	rootCmd.SetArgs([]string{"keygen"})
	err := rootCmd.Execute()
	if err == nil {
		t.Fatal("expected error when identity exists")
	}
}

func TestKeygen_ForceOverwrite(t *testing.T) {
	tmpHome := setTempHome(t)
	keygenForce = false

	idDir := filepath.Join(tmpHome, ".xenvsync")
	if err := os.MkdirAll(idDir, 0700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(idDir, "identity"), []byte("old-key"), 0600); err != nil {
		t.Fatal(err)
	}

	rootCmd.SetArgs([]string{"keygen", "--force"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("keygen --force failed: %v", err)
	}

	raw, _ := os.ReadFile(filepath.Join(idDir, "identity"))
	if string(raw) == "old-key" {
		t.Fatal("key was not regenerated")
	}
}

func TestWhoami_ShowsPublicKey(t *testing.T) {
	_ = setTempHome(t)
	keygenForce = false

	// Generate first.
	rootCmd.SetArgs([]string{"keygen"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatal(err)
	}

	// Whoami should succeed.
	rootCmd.SetArgs([]string{"whoami"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("whoami failed: %v", err)
	}
}

func TestWhoami_NoIdentity(t *testing.T) {
	_ = setTempHome(t)

	rootCmd.SetArgs([]string{"whoami"})
	err := rootCmd.Execute()
	if err == nil {
		t.Fatal("expected error when no identity exists")
	}
}
