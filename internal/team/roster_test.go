package team

import (
	"os"
	"path/filepath"
	"testing"
)

func TestRoster_AddAndFind(t *testing.T) {
	r := &Roster{}

	if err := r.Add("alice", "a2V5LWFsaWNl"); err != nil {
		t.Fatal(err)
	}
	if err := r.Add("bob", "a2V5LWJvYg=="); err != nil {
		t.Fatal(err)
	}

	if len(r.Members) != 2 {
		t.Fatalf("expected 2 members, got %d", len(r.Members))
	}

	m := r.Find("alice")
	if m == nil {
		t.Fatal("alice not found")
	}
	if m.PublicKey != "a2V5LWFsaWNl" {
		t.Fatalf("alice key = %q, want %q", m.PublicKey, "a2V5LWFsaWNl")
	}
}

func TestRoster_AddDuplicateName(t *testing.T) {
	r := &Roster{}
	_ = r.Add("alice", "a2V5LWFsaWNl")

	if err := r.Add("alice", "ZGlmZmVyZW50"); err == nil {
		t.Fatal("expected error for duplicate name")
	}
}

func TestRoster_AddDuplicateKey(t *testing.T) {
	r := &Roster{}
	_ = r.Add("alice", "a2V5LWFsaWNl")

	if err := r.Add("bob", "a2V5LWFsaWNl"); err == nil {
		t.Fatal("expected error for duplicate public key")
	}
}

func TestRoster_Remove(t *testing.T) {
	r := &Roster{}
	_ = r.Add("alice", "a2V5LWFsaWNl")
	_ = r.Add("bob", "a2V5LWJvYg==")

	if err := r.Remove("alice"); err != nil {
		t.Fatal(err)
	}
	if len(r.Members) != 1 {
		t.Fatalf("expected 1 member after remove, got %d", len(r.Members))
	}
	if r.Find("alice") != nil {
		t.Fatal("alice still found after remove")
	}
}

func TestRoster_RemoveNotFound(t *testing.T) {
	r := &Roster{}
	if err := r.Remove("ghost"); err == nil {
		t.Fatal("expected error for non-existent member")
	}
}

func TestRoster_SortedByName(t *testing.T) {
	r := &Roster{}
	_ = r.Add("charlie", "Y2hhcmxpZQ==")
	_ = r.Add("alice", "YWxpY2U=")
	_ = r.Add("bob", "Ym9i")

	if r.Members[0].Name != "alice" || r.Members[1].Name != "bob" || r.Members[2].Name != "charlie" {
		t.Fatalf("members not sorted: %v", r.Members)
	}
}

func TestRoster_SaveLoad(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "team.json")

	original := &Roster{}
	_ = original.Add("alice", "a2V5LWFsaWNl")
	_ = original.Add("bob", "a2V5LWJvYg==")

	if err := original.Save(path); err != nil {
		t.Fatal(err)
	}

	loaded, err := Load(path)
	if err != nil {
		t.Fatal(err)
	}

	if len(loaded.Members) != 2 {
		t.Fatalf("loaded %d members, want 2", len(loaded.Members))
	}
	if loaded.Members[0].Name != "alice" || loaded.Members[1].Name != "bob" {
		t.Fatal("loaded members don't match")
	}
}

func TestLoad_MissingFile(t *testing.T) {
	r, err := Load("/nonexistent/path.json")
	if err != nil {
		t.Fatal(err)
	}
	if len(r.Members) != 0 {
		t.Fatal("expected empty roster for missing file")
	}
}

func TestLoad_InvalidJSON(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "bad.json")
	_ = os.WriteFile(path, []byte("{invalid"), 0644)

	_, err := Load(path)
	if err == nil {
		t.Fatal("expected error for invalid JSON")
	}
}
