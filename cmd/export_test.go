package cmd

import (
	"encoding/json"
	"os"
	"strings"
	"testing"
)

func setupVault(t *testing.T, envContent string) {
	t.Helper()
	rootCmd.SetArgs([]string{"init"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("init: %v", err)
	}
	if err := os.WriteFile(".env", []byte(envContent), 0644); err != nil {
		t.Fatal(err)
	}
	rootCmd.SetArgs([]string{"push", "-e", ".env", "-o", ".env.vault"})
	if err := rootCmd.Execute(); err != nil {
		t.Fatalf("push: %v", err)
	}
}

func TestExport_AllFormats(t *testing.T) {
	testInDir(t, func(dir string) {
		setupVault(t, "DB_HOST=localhost\nAPI_KEY=secret123\n")
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("init: %v", err)
		}
		if err := os.WriteFile(".env", []byte("DB_HOST=localhost\nAPI_KEY=secret123\n"), 0644); err != nil {
			t.Fatal(err)
		}
		rootCmd.SetArgs([]string{"push"})
		if err := rootCmd.Execute(); err != nil {
			t.Fatalf("push: %v", err)
		}

		formats := []struct {
			name    string
			check   func(t *testing.T, output string)
		}{
			{
				name: "dotenv",
				check: func(t *testing.T, out string) {
					if !strings.Contains(out, "DB_HOST=localhost") {
						t.Fatal("dotenv missing DB_HOST")
					}
					if !strings.Contains(out, "API_KEY=secret123") {
						t.Fatal("dotenv missing API_KEY")
					}
				},
			},
			{
				name: "json",
				check: func(t *testing.T, out string) {
					var m map[string]string
					if err := json.Unmarshal([]byte(out), &m); err != nil {
						t.Fatalf("json parse error: %v", err)
					}
					if m["DB_HOST"] != "localhost" {
						t.Fatalf("json DB_HOST = %q, want localhost", m["DB_HOST"])
					}
					if m["API_KEY"] != "secret123" {
						t.Fatalf("json API_KEY = %q, want secret123", m["API_KEY"])
					}
				},
			},
			{
				name: "yaml",
				check: func(t *testing.T, out string) {
					if !strings.Contains(out, "DB_HOST: localhost") {
						t.Fatal("yaml missing DB_HOST")
					}
					if !strings.Contains(out, "API_KEY: secret123") {
						t.Fatal("yaml missing API_KEY")
					}
				},
			},
			{
				name: "shell",
				check: func(t *testing.T, out string) {
					if !strings.Contains(out, `export DB_HOST="localhost"`) {
						t.Fatal("shell missing DB_HOST")
					}
					if !strings.Contains(out, `export API_KEY="secret123"`) {
						t.Fatal("shell missing API_KEY")
					}
				},
			},
			{
				name: "tfvars",
				check: func(t *testing.T, out string) {
					if !strings.Contains(out, `DB_HOST = "localhost"`) {
						t.Fatal("tfvars missing DB_HOST")
					}
					if !strings.Contains(out, `API_KEY = "secret123"`) {
						t.Fatal("tfvars missing API_KEY")
					}
				},
			},
		}

		for _, tc := range formats {
			t.Run(tc.name, func(t *testing.T) {
				// Capture stdout
				old := os.Stdout
				r, w, _ := os.Pipe()
				os.Stdout = w

				rootCmd.SetArgs([]string{"export", "--format", tc.name})
				err := rootCmd.Execute()

				if err := w.Close(); err != nil {
					t.Fatal(err)
				}
				os.Stdout = old

				if err != nil {
					t.Fatalf("export -f %s: %v", tc.name, err)
				}

				buf := make([]byte, 4096)
				n, _ := r.Read(buf)
				output := string(buf[:n])

				tc.check(t, output)
			})
		}
	})
}

func TestExport_InvalidFormat(t *testing.T) {
	testInDir(t, func(dir string) {
		setupVault(t, "K=V\n")

		rootCmd.SetArgs([]string{"export", "--format", "xml"})
		err := rootCmd.Execute()
		if err == nil {
			t.Fatal("expected error for unsupported format")
		}
		if !strings.Contains(err.Error(), "unknown format") {
			t.Fatalf("unexpected error: %v", err)
		}
	})
}
