export const apiClient = {
	async get(url: string, headers: Record<string, string> = {}) {
		const res = await fetch(url, { headers });
		const data = await res.json().catch(() => ({}));
		if (!res.ok) throw new Error(data?.error || res.statusText);
		return { data, status: res.status };
	},
	async post(url: string, body: any, headers: Record<string, string> = {}) {
		const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
		const data = await res.json().catch(() => ({}));
		if (!res.ok) throw new Error(data?.error || res.statusText);
		return { data, status: res.status };
	},
};