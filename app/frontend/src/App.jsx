import { useEffect, useState } from 'react';
import { listTasks, createTask, updateTask, deleteTask } from './api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState(null);

  const refresh = () => listTasks().then(setTasks).catch((e) => setError(e.message));

  useEffect(() => { refresh(); }, []);

  const onAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask(title.trim());
    setTitle('');
    refresh();
  };

  const onToggle = async (task) => {
    await updateTask(task._id, { done: !task.done });
    refresh();
  };

  const onDelete = async (id) => {
    await deleteTask(id);
    refresh();
  };

  return (
    <main style={{ maxWidth: 480, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>TaskForge 1.0.0</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onAdd} style={{ display: 'flex', gap: 8 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task"
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map((t) => (
          <li key={t._id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
            <input type="checkbox" checked={t.done} onChange={() => onToggle(t)} />
            <span style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</span>
            <button onClick={() => onDelete(t._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
