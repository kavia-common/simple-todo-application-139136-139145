import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { listTodos, createTodo, updateTodo, deleteTodo, getSupabaseConfig } from './supabaseClient';

// PUBLIC_INTERFACE
function App() {
  /** Todo App using Supabase REST for CRUD on 'todos' table. */
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  const configMissing = useMemo(() => {
    const { url, key } = getSupabaseConfig();
    return !url || !key;
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setErrMsg('');
      try {
        const data = await listTodos();
        if (!ignore) setTodos(data || []);
      } catch (e) {
        console.error(e);
        if (!ignore) setErrMsg(e.message || 'Failed to load todos.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (!configMissing) {
      load();
    } else {
      setLoading(false);
      setErrMsg('Supabase environment variables are missing. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.');
    }
    return () => { ignore = true; };
  }, [configMissing]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await createTodo({ title: newTitle.trim() });
      setTodos(prev => [...prev, created]);
      setNewTitle('');
    } catch (e) {
      console.error(e);
      setErrMsg(e.message || 'Failed to add todo.');
    }
  }

  // PUBLIC_INTERFACE
  async function handleEdit(id, title) {
    /** Update the title of a todo. */
    try {
      const updated = await updateTodo(id, { title });
      setTodos(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch (e) {
      console.error(e);
      setErrMsg(e.message || 'Failed to edit todo.');
    }
  }

  // PUBLIC_INTERFACE
  async function handleDelete(id) {
    /** Delete a todo by id. */
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
      setErrMsg(e.message || 'Failed to delete todo.');
    }
  }

  return (
    <div className="App">
      <div className="card" role="region" aria-label="Todo Application">
        <div className="header">
          <div className="badge" aria-hidden>Ocean • Professional</div>
          <h1 className="title">My Todos</h1>
          <p className="subtitle">Manage your tasks with a clean, modern interface.</p>
        </div>

        <div className="content">
          <form className="add-row" onSubmit={handleAdd}>
            <input
              className="input"
              type="text"
              placeholder="Add a new task..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              aria-label="New task title"
            />
            <button className="btn btn-primary" type="submit">Add Task</button>
          </form>

          {errMsg ? <div className="helper" style={{ color: 'var(--error)' }}>{errMsg}</div> : null}
          {loading ? <div className="helper">Loading tasks...</div> : null}

          <div className="list" aria-live="polite">
            {todos.map((t) => (
              <TodoItem
                key={t.id}
                todo={t}
                onEdit={(title) => handleEdit(t.id, title)}
                onDelete={() => handleDelete(t.id)}
              />
            ))}
            {!loading && todos.length === 0 && (
              <div className="helper">No tasks yet. Add your first task above.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TodoItem({ todo, onEdit, onDelete }) {
  const [title, setTitle] = useState(todo.title || '');
  const [editing, setEditing] = useState(false);

  function commitEdit() {
    const trimmed = title.trim();
    if (trimmed && trimmed !== todo.title) {
      onEdit(trimmed);
    } else {
      setTitle(todo.title || '');
    }
    setEditing(false);
  }

  return (
    <div className="item">
      <input
        type="text"
        value={title}
        onChange={(e) => { setTitle(e.target.value); setEditing(true); }}
        onBlur={commitEdit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitEdit();
          } else if (e.key === 'Escape') {
            setTitle(todo.title || '');
            setEditing(false);
          }
        }}
        aria-label={`Edit task ${todo.title}`}
      />
      <div className="actions">
        {editing ? (
          <button className="btn btn-primary" onClick={commitEdit} type="button">Save</button>
        ) : null}
        <button className="btn btn-danger" onClick={onDelete} type="button">Delete</button>
      </div>
    </div>
  );
}

export default App;
