package crypto

// ZeroBytes overwrites a byte slice with zeros.
// Used to clear sensitive key material from memory after use.
func ZeroBytes(b []byte) {
	for i := range b {
		b[i] = 0
	}
}
