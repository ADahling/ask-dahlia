import crypto from 'crypto';

/**
 * Create HMAC signature for payload
 * @param payload Request body as string
 * @param secret HMAC secret key
 * @returns HMAC signature
 */
export function createHmacSignature(payload: string, secret: string): string {
  // This function runs on the server side (in API routes)
  // Use Node.js crypto for HMAC signature generation
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Make a request to the worker API via the proxy
 * @param endpoint Worker API endpoint (e.g., 'chat/stream', 'ingest/process')
 * @param body Request body
 * @returns Response data
 */
export async function callWorker<T = any>(endpoint: string, body: any = {}): Promise<T> {
  try {
    const response = await fetch(`/api/worker-proxy/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Worker API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Worker API call error:', error);
    throw error;
  }
}

/**
 * Create a streaming connection to the worker API
 * @param endpoint Worker API endpoint (e.g., 'chat/stream')
 * @param body Request body
 * @param onMessage Callback for each message chunk
 * @param onError Error callback
 * @param onEnd End callback
 * @returns Function to abort the connection
 */
export async function createWorkerStream(
  endpoint: string,
  body: any,
  onMessage: (data: any) => void,
  onError?: (error: Error) => void,
  onEnd?: () => void
): Promise<() => void> {
  const abortController = new AbortController();

  try {
    const response = await fetch(`/api/worker-proxy/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: abortController.signal
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Worker API request failed');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    // Read the stream
    const readStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            onEnd?.();
            break;
          }

          // Convert Uint8Array to string
          const text = new TextDecoder().decode(value);

          // Parse SSE format
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                onMessage(data);
              } catch (error) {
                // Skip invalid JSON
              }
            } else if (line.startsWith('event: end')) {
              onEnd?.();
              return;
            } else if (line.startsWith('event: error')) {
              // Next line should contain the error data
              continue;
            }
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          onError?.(error);
        }
      }
    };

    // Start reading
    readStream();

  } catch (error: any) {
    if (error.name !== 'AbortError') {
      onError?.(error);
    }
  }

  // Return abort function
  return () => abortController.abort();
}
