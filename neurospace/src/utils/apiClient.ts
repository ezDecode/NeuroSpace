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
		const data = (await res.json().catch(() => ({}))) as T;
		if (!res.ok) throw new Error(extractError(data, res.statusText));
		return { data, status: res.status };
	},
	async post<T extends Json = Json>(url: string, body: unknown, headers: Record<string, string> = {}) {
		const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
		const data = (await res.json().catch(() => ({}))) as T;
		if (!res.ok) throw new Error(extractError(data, res.statusText));
		return { data, status: res.status };
	},
};