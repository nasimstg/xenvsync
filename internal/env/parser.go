// Package env handles parsing and serializing .env files.
//
// Supported syntax:
//   - KEY=VALUE
//   - KEY="quoted value"       (double quotes stripped)
//   - KEY='quoted value'       (single quotes stripped)
//   - KEY="line1\nline2\n..."  (multiline: spans until closing quote)
//   - Blank lines and lines starting with # are ignored.
//   - Inline comments after unquoted values are stripped.
//   - export KEY=VALUE prefix is accepted and stripped.
package env

import (
	"bufio"
	"bytes"
	"fmt"
	"os"
	"strings"
)

// Pair represents a single environment variable.
type Pair struct {
	Key   string
	Value string
}

// ParseFile reads and parses a .env file from disk.
func ParseFile(path string) ([]Pair, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return Parse(data)
}

// Parse parses .env-formatted bytes into ordered key-value pairs.
// Supports multiline values enclosed in double or single quotes.
func Parse(data []byte) ([]Pair, error) {
	var pairs []Pair
	scanner := bufio.NewScanner(bytes.NewReader(data))

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		// Skip blanks and comments.
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// Strip optional "export " prefix.
		line = strings.TrimPrefix(line, "export ")

		// Split on the first '='.
		idx := strings.IndexByte(line, '=')
		if idx < 0 {
			return nil, fmt.Errorf("invalid line (no '='): %q", line)
		}

		key := strings.TrimSpace(line[:idx])
		val := strings.TrimSpace(line[idx+1:])

		// Handle multiline quoted values: if value starts with a quote
		// but doesn't end with the matching quote, keep reading lines.
		if len(val) >= 1 && (val[0] == '"' || val[0] == '\'') {
			quote := val[0]
			if len(val) >= 2 && val[len(val)-1] == quote {
				// Single-line quoted value — strip quotes.
				val = val[1 : len(val)-1]
			} else {
				// Multiline: accumulate lines until we find the closing quote.
				var builder strings.Builder
				builder.WriteString(val[1:]) // strip opening quote
				for scanner.Scan() {
					next := scanner.Text()
					trimmed := strings.TrimRight(next, " \t")
					if len(trimmed) > 0 && trimmed[len(trimmed)-1] == quote {
						builder.WriteByte('\n')
						builder.WriteString(trimmed[:len(trimmed)-1])
						break
					}
					builder.WriteByte('\n')
					builder.WriteString(next)
				}
				val = builder.String()
			}
		}

		pairs = append(pairs, Pair{Key: key, Value: val})
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("reading env data: %w", err)
	}
	return pairs, nil
}

// Marshal serializes pairs back to .env format (KEY=VALUE\n).
func Marshal(pairs []Pair) []byte {
	var buf bytes.Buffer
	for _, p := range pairs {
		// Quote values that contain spaces, #, or newlines.
		val := p.Value
		if strings.ContainsAny(val, " \t#\n\"") {
			val = `"` + val + `"`
		}
		fmt.Fprintf(&buf, "%s=%s\n", p.Key, val)
	}
	return buf.Bytes()
}
