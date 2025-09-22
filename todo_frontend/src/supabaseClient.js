//
// Supabase REST client (no SDK) for simple CRUD on "todos" table
// Uses REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY from environment.
// All functions throw on HTTP errors.
//

// PUBLIC_INTERFACE
export function getSupabaseConfig() {
  /** Returns validated Supabase config from environment variables. */
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_KEY;

  if (!url || !key) {
    // Helpful runtime message if env vars are not supplied.
    console.warn(
      "Supabase configuration is missing. Ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY are set in the environment."
    );
  }
  return { url, key };
}

function getHeaders() {
  const { key } = getSupabaseConfig();
  return {
    apikey: key || "",
    Authorization: `Bearer ${key || ""}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

function baseUrl(table) {
  const { url } = getSupabaseConfig();
  return `${url}/rest/v1/${table}`;
}

// PUBLIC_INTERFACE
export async function listTodos() {
  /**
   * List todos ordered by created_at ascending.
   * Returns an array of rows. Table: "todos"
   */
  const res = await fetch(`${baseUrl("todos")}?select=*&order=created_at.asc`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch todos: ${res.status} ${text}`);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function createTodo({ title }) {
  /**
   * Create a new todo with title and default completed=false.
   * Returns the created row.
   */
  const body = [{ title, completed: false }];
  const res = await fetch(baseUrl("todos"), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create todo: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data?.[0];
}

// PUBLIC_INTERFACE
export async function updateTodo(id, patch) {
  /**
   * Update fields for a todo row.
   * id: primary key (uuid/int) depending on Supabase table schema
   * patch: object with fields to update e.g., { title: "New title" }
   * Returns the updated row.
   */
  const query = new URLSearchParams({ id: `eq.${id}` }).toString();
  const res = await fetch(`${baseUrl("todos")}?${query}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update todo: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data?.[0];
}

// PUBLIC_INTERFACE
export async function deleteTodo(id) {
  /**
   * Delete a todo by id.
   * Returns true on success.
   */
  const query = new URLSearchParams({ id: `eq.${id}` }).toString();
  const res = await fetch(`${baseUrl("todos")}?${query}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete todo: ${res.status} ${text}`);
  }
  return true;
}
