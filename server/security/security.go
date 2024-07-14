package security

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// Secrets holds the encryption key
type Secrets struct {
	EncryptionKey string `json:"passphrase"`
}

// Generate a new AES key from a passphrase
func generateKey(passphrase string) []byte {
	hash := sha256.Sum256([]byte(passphrase))
	return hash[:]
}

// loads the secrets from a JSON file
func LoadSecrets(basePath, relativePath string) (*Secrets, error) {
	fullPath := filepath.Join(basePath, relativePath)
	data, err := os.ReadFile(fullPath)
	if err != nil {
		return nil, fmt.Errorf("could not read secrets file: %v", err)
	}

	var secrets Secrets
	if err := json.Unmarshal(data, &secrets); err != nil {
		return nil, fmt.Errorf("could not unmarshal secrets: %v", err)
	}

	return &secrets, nil
}

// Encrypt encrypts the given plaintext using the specified passphrase.
func Encrypt(plainText, passphrase string) (string, error) {
	block, err := aes.NewCipher(generateKey(passphrase))
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	cipherText := gcm.Seal(nonce, nonce, []byte(plainText), nil)
	return base64.StdEncoding.EncodeToString(cipherText), nil
}

// Decrypt decrypts the given ciphertext using the specified passphrase.
func Decrypt(cipherText, passphrase string) (string, error) {
	block, err := aes.NewCipher(generateKey(passphrase))
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	data, err := base64.StdEncoding.DecodeString(cipherText)
	if err != nil {
		return "", err
	}

	if len(data) < gcm.NonceSize() {
		return "", errors.New("malformed ciphertext")
	}

	nonce, cipherTextBytes := data[:gcm.NonceSize()], data[gcm.NonceSize():]
	plainText, err := gcm.Open(nil, nonce, cipherTextBytes, nil)
	if err != nil {
		return "", err
	}

	return string(plainText), nil
}
