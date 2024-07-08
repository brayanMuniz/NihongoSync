package security

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"io"
)

// Generate a new AES key from a passphrase
func generateKey(passphrase string) []byte {
	hash := sha256.Sum256([]byte(passphrase))
	return hash[:]
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
