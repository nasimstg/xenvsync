package cmd

import (
	"os"
	"strings"

	"github.com/nasimstg/xenvsync/internal/env"
)

// envFilePath returns the .env file path for a given environment name.
// If name is empty, returns defaultEnvFile (".env").
// Otherwise returns ".env.<name>" (e.g., ".env.staging").
func envFilePath(name string) string {
	if name == "" {
		return defaultEnvFile
	}
	return ".env." + name
}

// vaultFilePath returns the vault file path for a given environment name.
// If name is empty, returns defaultVaultFile (".env.vault").
// Otherwise returns ".env.<name>.vault" (e.g., ".env.staging.vault").
func vaultFilePath(name string) string {
	if name == "" {
		return defaultVaultFile
	}
	return ".env." + name + ".vault"
}

// resolveEnvName returns the effective environment name by checking
// the --env flag value first, then the XENVSYNC_ENV environment variable.
func resolveEnvName(flagValue string) string {
	if flagValue != "" {
		return flagValue
	}
	return os.Getenv("XENVSYNC_ENV")
}

// discoverEnvironments scans the current directory for .env.* and .env.*.vault
// files and returns a list of discovered environment info.
func discoverEnvironments() []EnvInfo {
	seen := make(map[string]*EnvInfo)

	entries, err := os.ReadDir(".")
	if err != nil {
		return nil
	}

	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name()

		// Match .env.<name>.vault (but not the default .env.vault)
		if strings.HasPrefix(name, ".env.") && strings.HasSuffix(name, ".vault") && name != ".env.vault" {
			envName := strings.TrimSuffix(strings.TrimPrefix(name, ".env."), ".vault")
			info := getOrCreate(seen, envName)
			info.HasVault = true
			if fi, err := e.Info(); err == nil {
				info.VaultMod = fi.ModTime().Format("2006-01-02 15:04:05")
			}
			continue
		}

		// Match .env.<name> (but not .env.vault which is the default vault)
		if strings.HasPrefix(name, ".env.") && name != ".env.vault" {
			envName := strings.TrimPrefix(name, ".env.")
			// Skip if this looks like a vault file (already handled above)
			if strings.HasSuffix(envName, ".vault") {
				continue
			}
			info := getOrCreate(seen, envName)
			info.HasEnv = true
			if fi, err := e.Info(); err == nil {
				info.EnvMod = fi.ModTime().Format("2006-01-02 15:04:05")
			}
		}
	}

	// Also check default environment
	defaultInfo := &EnvInfo{Name: "(default)"}
	if fi, err := os.Stat(defaultEnvFile); err == nil {
		defaultInfo.HasEnv = true
		defaultInfo.EnvMod = fi.ModTime().Format("2006-01-02 15:04:05")
	}
	if fi, err := os.Stat(defaultVaultFile); err == nil {
		defaultInfo.HasVault = true
		defaultInfo.VaultMod = fi.ModTime().Format("2006-01-02 15:04:05")
	}

	result := []EnvInfo{*defaultInfo}
	// Sort environment names
	names := make([]string, 0, len(seen))
	for k := range seen {
		names = append(names, k)
	}
	sortStrings(names)
	for _, n := range names {
		result = append(result, *seen[n])
	}
	return result
}

// EnvInfo holds discovery information about a named environment.
type EnvInfo struct {
	Name     string
	HasEnv   bool
	HasVault bool
	EnvMod   string
	VaultMod string
}

// SyncStatus returns a human-readable sync status.
func (e EnvInfo) SyncStatus() string {
	switch {
	case e.HasEnv && e.HasVault:
		return "synced"
	case e.HasEnv && !e.HasVault:
		return "not pushed"
	case !e.HasEnv && e.HasVault:
		return "not pulled"
	default:
		return "empty"
	}
}

func getOrCreate(m map[string]*EnvInfo, name string) *EnvInfo {
	if info, ok := m[name]; ok {
		return info
	}
	info := &EnvInfo{Name: name}
	m[name] = info
	return info
}

const (
	sharedEnvFile = ".env.shared"
	localEnvFile  = ".env.local"
)

// loadMergedPairs loads and merges environment variables with fallback precedence:
// .env.shared < .env.<name> < .env.local
// If noFallback is true, only .env.<name> (or the primary file) is loaded.
func loadMergedPairs(primaryFile string, noFallback bool) ([]env.Pair, error) {
	if noFallback {
		pairs, err := env.ParseFile(primaryFile)
		if err != nil {
			return nil, err
		}
		return pairs, nil
	}

	merged := make(map[string]string)
	var orderedKeys []string

	// Layer 1: .env.shared (lowest priority)
	if sharedPairs, err := env.ParseFile(sharedEnvFile); err == nil {
		for _, p := range sharedPairs {
			merged[p.Key] = p.Value
			orderedKeys = append(orderedKeys, p.Key)
		}
	}

	// Layer 2: primary file (.env or .env.<name>)
	primaryPairs, err := env.ParseFile(primaryFile)
	if err != nil {
		return nil, err
	}
	for _, p := range primaryPairs {
		if _, exists := merged[p.Key]; !exists {
			orderedKeys = append(orderedKeys, p.Key)
		}
		merged[p.Key] = p.Value
	}

	// Layer 3: .env.local (highest priority)
	if localPairs, err := env.ParseFile(localEnvFile); err == nil {
		for _, p := range localPairs {
			if _, exists := merged[p.Key]; !exists {
				orderedKeys = append(orderedKeys, p.Key)
			}
			merged[p.Key] = p.Value
		}
	}

	// Build result preserving key order
	result := make([]env.Pair, 0, len(merged))
	for _, k := range orderedKeys {
		if v, ok := merged[k]; ok {
			result = append(result, env.Pair{Key: k, Value: v})
			delete(merged, k) // prevent duplicates from orderedKeys
		}
	}
	return result, nil
}

func sortStrings(s []string) {
	for i := 1; i < len(s); i++ {
		for j := i; j > 0 && s[j] < s[j-1]; j-- {
			s[j], s[j-1] = s[j-1], s[j]
		}
	}
}

