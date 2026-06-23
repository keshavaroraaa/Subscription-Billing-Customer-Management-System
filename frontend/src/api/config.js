const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(apiUrl(path), { ...options, headers });
  return response;
}
