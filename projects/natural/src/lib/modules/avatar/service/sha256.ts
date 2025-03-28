/**
 * Thin wrapper around browsers' native SubtleCrypto for convenience of use
 */
export async function sha256(message: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // hash the message
    const hashArray = new Uint8Array(hashBuffer); // convert buffer to byte array
    const hashHex = hashArray.reduce((result, byte) => result + byte.toString(16).padStart(2, '0'), ''); // convert bytes to hex string

    return hashHex;
}
