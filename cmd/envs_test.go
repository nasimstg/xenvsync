package cmd

import (
	"os"
	"strings"
	"testing"
)

func TestEnvs_ListsDefaultWhenNoFiles(t *testing.T) {
	testInDir(t, func(_ string) {
		resetAllFlags()
		rootCmd.SetArgs([]string{"envs"})

		output := captureStdout(t, func() {
			if err := rootCmd.Execute(); err != nil {
				t.Fatalf("envs failed: %v", err)
			}
		})

		if !strings.Contains(output, "Discovered environments:") {
			t.Fatalf("missing envs header, got: %q", output)
		}
		if !strings.Contains(output, "(default)") {
			t.Fatalf("default environment should be listed, got: %q", output)
		}
		if !strings.Contains(output, "empty") {
			t.Fatalf("default empty state should be shown, got: %q", output)
		}
	})
}

func TestEnvs_NamedEnvironmentsAreSorted(t *testing.T) {
	testInDir(t, func(_ string) {
		files := map[string]string{
			".env.staging":          "A=1\n",
			".env.alpha.vault":      "vault",
			".env.production.vault": "vault",
		}
		for path, data := range files {
			if err := os.WriteFile(path, []byte(data), 0644); err != nil {
				t.Fatal(err)
			}
		}

		resetAllFlags()
		rootCmd.SetArgs([]string{"envs"})
		output := captureStdout(t, func() {
			if err := rootCmd.Execute(); err != nil {
				t.Fatalf("envs failed: %v", err)
			}
		})

		alpha := strings.Index(output, "alpha")
		production := strings.Index(output, "production")
		staging := strings.Index(output, "staging")
		if alpha == -1 || production == -1 || staging == -1 {
			t.Fatalf("expected all named envs in output, got: %q", output)
		}
		if !(alpha < production && production < staging) {
			t.Fatalf("named environments are not sorted alphabetically, got: %q", output)
		}
	})
}
