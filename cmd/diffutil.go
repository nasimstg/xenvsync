package cmd

import (
	"fmt"
	"sort"
	"strings"

	"github.com/nasimstg/xenvsync/internal/env"
)

// KeyChange represents a change to a single environment variable key.
type KeyChange struct {
	Key      string
	Type     string // "added", "modified", "removed"
	OldValue string // value in vault (or previous state)
	NewValue string // value in .env (or current state)
}

// computeKeyChanges compares two sets of env pairs and returns sorted key-level changes.
// oldPairs is the reference (e.g., vault), newPairs is the current state (e.g., .env).
func computeKeyChanges(oldPairs, newPairs []env.Pair) []KeyChange {
	oldMap := pairsToMap(oldPairs)
	newMap := pairsToMap(newPairs)

	allKeys := make(map[string]bool)
	for k := range oldMap {
		allKeys[k] = true
	}
	for k := range newMap {
		allKeys[k] = true
	}

	sorted := make([]string, 0, len(allKeys))
	for k := range allKeys {
		sorted = append(sorted, k)
	}
	sort.Strings(sorted)

	var changes []KeyChange
	for _, k := range sorted {
		oldVal, inOld := oldMap[k]
		newVal, inNew := newMap[k]

		switch {
		case inNew && !inOld:
			changes = append(changes, KeyChange{Key: k, Type: "added", NewValue: newVal})
		case !inNew && inOld:
			changes = append(changes, KeyChange{Key: k, Type: "removed", OldValue: oldVal})
		case oldVal != newVal:
			changes = append(changes, KeyChange{Key: k, Type: "modified", OldValue: oldVal, NewValue: newVal})
		}
	}
	return changes
}

// formatKeyChanges formats a list of changes for display.
// When showValues is false, only key names and change types are shown.
func formatKeyChanges(changes []KeyChange, showValues bool, envLabel, vaultLabel string) string {
	if len(changes) == 0 {
		return ""
	}

	var b strings.Builder
	for _, c := range changes {
		switch c.Type {
		case "added":
			if showValues {
				fmt.Fprintf(&b, "+ %s=%s  (in %s only, not yet pushed)\n", c.Key, c.NewValue, envLabel)
			} else {
				fmt.Fprintf(&b, "+ %s  (in %s only, not yet pushed)\n", c.Key, envLabel)
			}
		case "removed":
			if showValues {
				fmt.Fprintf(&b, "- %s=%s  (in %s only, not yet pulled)\n", c.Key, c.OldValue, vaultLabel)
			} else {
				fmt.Fprintf(&b, "- %s  (in %s only, not yet pulled)\n", c.Key, vaultLabel)
			}
		case "modified":
			fmt.Fprintf(&b, "~ %s  (changed)\n", c.Key)
			if showValues {
				fmt.Fprintf(&b, "    %s:   %s\n", envLabel, c.NewValue)
				fmt.Fprintf(&b, "    %s:  %s\n", vaultLabel, c.OldValue)
			}
		}
	}
	return b.String()
}

func pairsToMap(pairs []env.Pair) map[string]string {
	m := make(map[string]string, len(pairs))
	for _, p := range pairs {
		m[p.Key] = p.Value
	}
	return m
}

// changeSummary returns a summary line like "3 change(s): 1 added, 1 modified, 1 removed."
func changeSummary(changes []KeyChange) string {
	var added, modified, removed int
	for _, c := range changes {
		switch c.Type {
		case "added":
			added++
		case "modified":
			modified++
		case "removed":
			removed++
		}
	}

	parts := make([]string, 0, 3)
	if added > 0 {
		parts = append(parts, fmt.Sprintf("%d added", added))
	}
	if modified > 0 {
		parts = append(parts, fmt.Sprintf("%d modified", modified))
	}
	if removed > 0 {
		parts = append(parts, fmt.Sprintf("%d removed", removed))
	}
	return fmt.Sprintf("%d change(s): %s.", len(changes), strings.Join(parts, ", "))
}
