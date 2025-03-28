function bufferToHexa(hashBuffer: ArrayBuffer): string {
    const hashArray = new Uint8Array(hashBuffer); // convert buffer to byte array
    return hashArray.reduce((result, byte) => result + byte.toString(16).padStart(2, '0'), ''); // convert bytes to hex string
}

/**
 * Thin wrapper around browsers' native SubtleCrypto for convenience of use
 */
export async function sha256(message: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message

    return bufferToHexa(hashBuffer);
}

/**
 * Thin wrapper around browsers' native SubtleCrypto for convenience of use
 */
export async function hmacSha256(secret: string, payload: string): Promise<string> {
    const encoder = new TextEncoder();
    const algorithm: HmacKeyGenParams = {name: 'HMAC', hash: 'SHA-256'};

    const key = await crypto.subtle.importKey('raw', encoder.encode(secret), algorithm, false, ['sign']);
    const signature = await crypto.subtle.sign(algorithm.name, key, encoder.encode(payload));

    return bufferToHexa(signature);
}
