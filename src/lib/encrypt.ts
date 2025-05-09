export async function encryptPassword(password: string): Promise<string> {
    // This key should match what you use in your C code
    const key = new Uint8Array([
        0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
        0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10
    ]);

    // For simplicity, we'll use AES-CBC
    const iv = window.crypto.getRandomValues(new Uint8Array(16));

    // Import the key
    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-CBC' },
        false,
        ['encrypt']
    );

    // Convert password to bytes
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    // Encrypt the data - Web Crypto will handle PKCS#7 padding automatically
    const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-CBC', iv },
        cryptoKey,
        data
    );

    // Combine IV and encrypted data
    const result = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encryptedBuffer), iv.length);

    // Convert to hex string
    return Array.from(result)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}