package cmd

import (
	"strings"
	"testing"

	"github.com/nasimstg/xenvsync/internal/env"
)

func TestComputeKeyChanges_Added(t *testing.T) {
	old := []env.Pair{{Key: "A", Value: "1"}}
	new_ := []env.Pair{{Key: "A", Value: "1"}, {Key: "B", Value: "2"}}

	changes := computeKeyChanges(old, new_)
	if len(changes) != 1 {
		t.Fatalf("expected 1 change, got %d", len(changes))
	}
	if changes[0].Type != "added" || changes[0].Key != "B" {
		t.Fatalf("expected added B, got %+v", changes[0])
	}
}

func TestComputeKeyChanges_Removed(t *testing.T) {
	old := []env.Pair{{Key: "A", Value: "1"}, {Key: "B", Value: "2"}}
	new_ := []env.Pair{{Key: "A", Value: "1"}}

	changes := computeKeyChanges(old, new_)
	if len(changes) != 1 {
		t.Fatalf("expected 1 change, got %d", len(changes))
	}
	if changes[0].Type != "removed" || changes[0].Key != "B" {
		t.Fatalf("expected removed B, got %+v", changes[0])
	}
}

func TestComputeKeyChanges_Modified(t *testing.T) {
	old := []env.Pair{{Key: "A", Value: "old"}}
	new_ := []env.Pair{{Key: "A", Value: "new"}}

	changes := computeKeyChanges(old, new_)
	if len(changes) != 1 {
		t.Fatalf("expected 1 change, got %d", len(changes))
	}
	if changes[0].Type != "modified" || changes[0].OldValue != "old" || changes[0].NewValue != "new" {
		t.Fatalf("expected modified A old→new, got %+v", changes[0])
	}
}

func TestComputeKeyChanges_Unchanged(t *testing.T) {
	old := []env.Pair{{Key: "A", Value: "1"}}
	new_ := []env.Pair{{Key: "A", Value: "1"}}

	changes := computeKeyChanges(old, new_)
	if len(changes) != 0 {
		t.Fatalf("expected 0 changes, got %d", len(changes))
	}
}

func TestComputeKeyChanges_Empty(t *testing.T) {
	changes := computeKeyChanges(nil, nil)
	if len(changes) != 0 {
		t.Fatalf("expected 0 changes for nil/nil, got %d", len(changes))
	}

	changes = computeKeyChanges(nil, []env.Pair{{Key: "A", Value: "1"}})
	if len(changes) != 1 || changes[0].Type != "added" {
		t.Fatalf("expected 1 added, got %+v", changes)
	}

	changes = computeKeyChanges([]env.Pair{{Key: "A", Value: "1"}}, nil)
	if len(changes) != 1 || changes[0].Type != "removed" {
		t.Fatalf("expected 1 removed, got %+v", changes)
	}
}

func TestComputeKeyChanges_SortedOutput(t *testing.T) {
	old := []env.Pair{}
	new_ := []env.Pair{{Key: "C", Value: "3"}, {Key: "A", Value: "1"}, {Key: "B", Value: "2"}}

	changes := computeKeyChanges(old, new_)
	if len(changes) != 3 {
		t.Fatalf("expected 3 changes, got %d", len(changes))
	}
	if changes[0].Key != "A" || changes[1].Key != "B" || changes[2].Key != "C" {
		t.Fatalf("changes not sorted: %s, %s, %s", changes[0].Key, changes[1].Key, changes[2].Key)
	}
}

func TestFormatKeyChanges_WithoutValues(t *testing.T) {
	changes := []KeyChange{
		{Key: "NEW", Type: "added", NewValue: "secret"},
		{Key: "GONE", Type: "removed", OldValue: "old-secret"},
		{Key: "MOD", Type: "modified", OldValue: "old", NewValue: "new"},
	}

	out := formatKeyChanges(changes, false, ".env", "vault")

	if strings.Contains(out, "secret") {
		t.Fatal("values should not appear without --show-values")
	}
	if !strings.Contains(out, "+ NEW") {
		t.Fatal("missing added key")
	}
	if !strings.Contains(out, "- GONE") {
		t.Fatal("missing removed key")
	}
	if !strings.Contains(out, "~ MOD") {
		t.Fatal("missing modified key")
	}
}

func TestFormatKeyChanges_WithValues(t *testing.T) {
	changes := []KeyChange{
		{Key: "NEW", Type: "added", NewValue: "secret"},
		{Key: "GONE", Type: "removed", OldValue: "old-secret"},
		{Key: "MOD", Type: "modified", OldValue: "old", NewValue: "new"},
	}

	out := formatKeyChanges(changes, true, ".env", "vault")

	if !strings.Contains(out, "NEW=secret") {
		t.Fatal("added value should appear with --show-values")
	}
	if !strings.Contains(out, "GONE=old-secret") {
		t.Fatal("removed value should appear with --show-values")
	}
	if !strings.Contains(out, ".env:   new") {
		t.Fatal("new value should appear for modified key")
	}
	if !strings.Contains(out, "vault:  old") {
		t.Fatal("old value should appear for modified key")
	}
}

func TestChangeSummary(t *testing.T) {
	changes := []KeyChange{
		{Type: "added"},
		{Type: "modified"},
		{Type: "modified"},
		{Type: "removed"},
	}

	summary := changeSummary(changes)
	if !strings.Contains(summary, "4 change(s)") {
		t.Fatalf("expected '4 change(s)', got %q", summary)
	}
	if !strings.Contains(summary, "1 added") {
		t.Fatalf("expected '1 added', got %q", summary)
	}
	if !strings.Contains(summary, "2 modified") {
		t.Fatalf("expected '2 modified', got %q", summary)
	}
	if !strings.Contains(summary, "1 removed") {
		t.Fatalf("expected '1 removed', got %q", summary)
	}
}
