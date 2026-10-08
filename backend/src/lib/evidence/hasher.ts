import crypto from 'crypto';

/**
 * Computes a standard SHA-256 cryptographic hash hex string from a Buffer, ArrayBuffer, or string.
 * Used for tamper-proof evidence verification.
 */
export function computeSha256(data: Buffer | ArrayBuffer | string): string {
  const hash = crypto.createHash('sha256');
  if (typeof data === 'string') {
    hash.update(data, 'utf-8');
  } else if (data instanceof ArrayBuffer) {
    hash.update(Buffer.from(data));
  } else {
    hash.update(data);
  }
  return hash.digest('hex');
}

/**
 * Compares an expected SHA-256 hash against computed data in constant time to prevent timing attacks.
 */
export function verifySha256(data: Buffer | ArrayBuffer | string, expectedHash: string): boolean {
  const computed = computeSha256(data);
  if (computed.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(expectedHash, 'hex'));
}

/**
 * Metadata record for tamper-proof evidence storage
 */
export interface EvidenceIntegrityMetadata {
  sha256: string;
  byteSize: number;
  fileName: string;
  mimeType: string;
  timestamp: string;
  fingerprint: string;
}

/**
 * Generates structured integrity metadata for a given evidence file buffer.
 */
export function generateEvidenceIntegrityMetadata(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): EvidenceIntegrityMetadata {
  const sha256 = computeSha256(buffer);
  const byteSize = buffer.byteLength;
  const timestamp = new Date().toISOString();
  const fingerprint = `SHA256:${sha256.substring(0, 16)}...${sha256.substring(sha256.length - 8)}`;

  return {
    sha256,
    byteSize,
    fileName,
    mimeType,
    timestamp,
    fingerprint,
  };
}
