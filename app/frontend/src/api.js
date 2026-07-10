const BASE = '/api/tasks';

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok && res.status !== 204) throw new Error(`request failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export const listTasks = () => request('');
export const createTask = (title) => request('', { method: 'POST', body: JSON.stringify({ title }) });
export const updateTask = (id, patch) => request(`/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
export const deleteTask = (id) => request(`/${id}`, { method: 'DELETE' });
