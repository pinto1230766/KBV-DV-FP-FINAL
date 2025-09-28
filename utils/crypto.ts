// utils/crypto.ts

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 100000;

// Helper to convert strings to ArrayBuffer and back
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Derives a key from a password and salt using PBKDF2
async function getKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: KEY_ALGORITHM, length: KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
    );
}

// Encrypts a JSON object
export async function encrypt(data: object, password: string): Promise<string> {
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await getKey(password, salt);

    const plaintext = JSON.stringify(data);
    const encodedPlaintext = encoder.encode(plaintext);

    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: KEY_ALGORITHM,
            iv: iv,
        },
        key,
        encodedPlaintext
    );

    // Combine salt, iv, and ciphertext into a single base64 string
    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

    return bufferToBase64(combined.buffer);
}

// Decrypts data from the combined base64 string
export async function decrypt<T>(encryptedData: string, password: string): Promise<T> {
    try {
        const combined = base64ToBuffer(encryptedData);

        const salt = new Uint8Array(combined, 0, SALT_LENGTH);
        const iv = new Uint8Array(combined, SALT_LENGTH, IV_LENGTH);
        const ciphertext = new Uint8Array(combined, SALT_LENGTH + IV_LENGTH);

        const key = await getKey(password, salt);

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: KEY_ALGORITHM,
                iv: iv,
            },
            key,
            ciphertext
        );

        const decryptedString = decoder.decode(decrypted);
        return JSON.parse(decryptedString) as T;

    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Invalid password or corrupted data.");
    }
}
