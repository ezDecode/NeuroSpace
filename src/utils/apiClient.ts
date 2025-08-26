type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

function extractError(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'error' in data) {
    const err = (data as { error?: unknown }).error;
    if (typeof err === 'string') return err;
  }
  return fallback;
}

export const apiClient = {
  async get<T extends Json = Json>(url: string, headers: Record<string, string> = {}) {
    const res = await fetch(url, { headers });
    
    let data: T;
    try {
      data = (await res.json()) as T;
    } catch (jsonError) {
      console.error('Failed to parse response JSON:', jsonError);
      if (!res.ok) {
        // If we can't parse JSON and the response is not ok, try to get text
        try {
          const text = await res.text();
          throw new Error(text || `HTTP error ${res.status}: ${res.statusText}`);
        } catch (textError) {
          throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
        }
      }
      throw new Error('Server returned invalid JSON response');
    }
    
    if (!res.ok) throw new Error(extractError(data, res.statusText));
    return { data, status: res.status };
  },
  
  async post<T extends Json = Json>(
    url: string,
    body: unknown,
    headers: Record<string, string> = {},
  ) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    
    let data: T;
    try {
      data = (await res.json()) as T;
    } catch (jsonError) {
      console.error('Failed to parse response JSON:', jsonError);
      if (!res.ok) {
        // If we can't parse JSON and the response is not ok, try to get text
        try {
          const text = await res.text();
          throw new Error(text || `HTTP error ${res.status}: ${res.statusText}`);
        } catch (textError) {
          throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
        }
      }
      throw new Error('Server returned invalid JSON response');
    }
    
    if (!res.ok) throw new Error(extractError(data, res.statusText));
    return { data, status: res.status };
  },
};
