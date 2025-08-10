import crypto from 'crypto';

/**
 * Create HMAC signature for payload
 * @param payload Request body as string
 * @param secret HMAC secret key
 * @returns HMAC signature
 */
export function createHmacSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Verify HMAC signature for payload
 * @param payload Request body as string
 * @param signature Provided HMAC signature
 * @param secret HMAC secret key
 * @returns Boolean indicating if signature is valid
 */
export function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmacSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
