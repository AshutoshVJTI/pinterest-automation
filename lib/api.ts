import { getAuth } from 'firebase/auth';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Initialize Firebase Auth
  const auth = getAuth();
  const user = auth.currentUser;

  // Ensure user is authenticated before proceeding
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get a fresh token for the current user; forceRefresh is true
  const token = await user.getIdToken(true);

  // Merge headers ensuring that 'Authorization' and 'Content-Type' are included
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  // Make the fetch request with the provided options and custom headers
  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
