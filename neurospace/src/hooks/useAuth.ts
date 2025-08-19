import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';

export function useAuth() {
	const { isSignedIn, user } = useUser();
	const { getToken, signOut } = useClerkAuth();

	async function getAuthHeader() {
		const token = await getToken({ template: 'default' });
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	return { isSignedIn, user, getAuthHeader, signOut };
}