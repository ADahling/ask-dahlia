/**
 * Parse a Server-Sent Events (SSE) message
 * @param message Raw SSE message
 * @returns Parsed message object
 */
export function parseSSE(message: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = message.trim().split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const field = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (field && value) {
      result[field] = value;
    }
  }

  return result;
}

/**
 * Create a Server-Sent Events (SSE) message
 * @param event Event name (optional)
 * @param data Data to send
 * @returns Formatted SSE message
 */
export function createSSE(event: string | null, data: any): string {
  let message = '';

  if (event) {
    message += `event: ${event}\n`;
  }

  message += `data: ${typeof data === 'string' ? data : JSON.stringify(data)}\n\n`;

  return message;
}

/**
 * Format a number of bytes to a human-readable string
 * @param bytes Number of bytes
 * @param decimals Number of decimal places
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Check if a quota has been exceeded
 * @param used Amount used
 * @param limit Quota limit
 * @returns Boolean indicating if quota is exceeded
 */
export function isQuotaExceeded(used: number, limit: number): boolean {
  return used >= limit;
}

/**
 * Create a timestamp in ISO format
 * @returns ISO timestamp
 */
export function timestamp(): string {
  return new Date().toISOString();
}

/**
 * Create a unique ID
 * @returns Unique ID
 */
export function uniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
