package cmd

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/nasimstg/xenvsync/internal/crypto"
	"github.com/nasimstg/xenvsync/internal/team"
	"github.com/nasimstg/xenvsync/internal/vault"
)

func TestRotate_V1(t *testing.T) {
	dir := chdirTemp(t)
	resetAllFlags()
	rotateRevoke = ""

	// Create a V1 vault.
	keyHex, _ := crypto.GenerateKey()
	_ = os.WriteFile(filepath.Join(dir, ".xenvsync.key"), []byte(keyHex), 0600)

	key, _ := crypto.DecodeKey(keyHex)
	plaintext := []byte("SECRET=original\n")
	ct, _ := crypto.Encrypt(key, plaintext)
	_ = os.WriteFile(filepath.Join(dir, ".env.vault"), vault.Encode(ct), 0644)

	// Rotate.
	rootCmd.SetArgs([]string{"rotate"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("rotate failed: %v", err)
	}

	// Key should have changed.
	newKeyHex, _ := os.ReadFile(filepath.Join(dir, ".xenvsync.key"))
	if string(newKeyHex) == keyHex {
		t.Fatal("key was not rotated")
	}

	// Vault should still be decryptable with new key.
	resetAllFlags()
	rootCmd.SetArgs([]string{"pull"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("pull after rotate failed: %v", err)
	}

	restored, _ := os.ReadFile(filepath.Join(dir, ".env"))
	if !strings.Contains(string(restored), "SECRET=original") {
		t.Fatal("data lost after rotation")
	}
}

func TestRotate_V2(t *testing.T) {
	dir := chdirTemp(t)
	tmpHome := setTempHome(t)
	resetAllFlags()
	rotateRevoke = ""
	keygenForce = false

	// Generate identity.
	rootCmd.SetArgs([]string{"keygen"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatal(err)
	}

	idPath := filepath.Join(tmpHome, ".xenvsync", "identity")
	raw, _ := os.ReadFile(idPath)
	kp, _ := crypto.DecodePrivateKey(strings.TrimSpace(string(raw)))

	// Create roster.
	roster := &team.Roster{}
	_ = roster.Add("me", kp.EncodePublicKey())
	_ = roster.Save(filepath.Join(dir, team.RosterFile))

	// Create V2 vault.
	_ = os.WriteFile(filepath.Join(dir, ".env"), []byte("DB=localhost\n"), 0644)
	resetAllFlags()
	pushNoFallback = true
	rootCmd.SetArgs([]string{"push"})
	_ = rootCmd.Execute()

	// Read original vault.
	origVault, _ := os.ReadFile(filepath.Join(dir, ".env.vault"))

	// Rotate.
	resetAllFlags()
	rotateRevoke = ""
	rootCmd.SetArgs([]string{"rotate"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("rotate failed: %v", err)
	}

	// Vault should have changed (new ephemeral keys).
	newVault, _ := os.ReadFile(filepath.Join(dir, ".env.vault"))
	if string(origVault) == string(newVault) {
		t.Fatal("vault was not re-encrypted")
	}

	// Should still be decryptable.
	_ = os.Remove(filepath.Join(dir, ".env"))
	resetAllFlags()
	rootCmd.SetArgs([]string{"pull"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("pull after V2 rotate failed: %v", err)
	}

	restored, _ := os.ReadFile(filepath.Join(dir, ".env"))
	if !strings.Contains(string(restored), "DB=localhost") {
		t.Fatal("data lost after V2 rotation")
	}
}

func TestRotate_Revoke(t *testing.T) {
	dir := chdirTemp(t)
	tmpHome := setTempHome(t)
	resetAllFlags()
	rotateRevoke = ""
	keygenForce = false

	// Generate identity.
	rootCmd.SetArgs([]string{"keygen"})
	_ = rootCmd.Execute()

	idPath := filepath.Join(tmpHome, ".xenvsync", "identity")
	raw, _ := os.ReadFile(idPath)
	kp, _ := crypto.DecodePrivateKey(strings.TrimSpace(string(raw)))

	// Create roster with two members.
	otherKp, _ := crypto.GenerateKeypair()
	roster := &team.Roster{}
	_ = roster.Add("me", kp.EncodePublicKey())
	_ = roster.Add("exmember", otherKp.EncodePublicKey())
	_ = roster.Save(filepath.Join(dir, team.RosterFile))

	// Create V2 vault.
	_ = os.WriteFile(filepath.Join(dir, ".env"), []byte("KEY=value\n"), 0644)
	resetAllFlags()
	pushNoFallback = true
	rootCmd.SetArgs([]string{"push"})
	_ = rootCmd.Execute()

	// Rotate with --revoke.
	resetAllFlags()
	rotateRevoke = "exmember"
	rootCmd.SetArgs([]string{"rotate", "--revoke", "exmember"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("rotate --revoke failed: %v", err)
	}

	// Roster should have 1 member.
	updatedRoster, _ := team.Load(filepath.Join(dir, team.RosterFile))
	if len(updatedRoster.Members) != 1 {
		t.Fatalf("expected 1 member after revoke, got %d", len(updatedRoster.Members))
	}
	if updatedRoster.Find("exmember") != nil {
		t.Fatal("exmember still in roster after revoke")
	}

	// Vault should have only 1 key slot.
	vaultData, _ := os.ReadFile(filepath.Join(dir, ".env.vault"))
	v2, _ := vault.DecodeV2(vaultData)
	if len(v2.Slots) != 1 {
		t.Fatalf("expected 1 slot after revoke, got %d", len(v2.Slots))
	}

	// Current user should still be able to decrypt.
	_ = os.Remove(filepath.Join(dir, ".env"))
	resetAllFlags()
	rootCmd.SetArgs([]string{"pull"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("pull after revoke failed: %v", err)
	}
}
