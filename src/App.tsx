
import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    // Subscribe to real-time updates
    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
      error: (err) => console.error("observeQuery error:", err),
    });

    // Cleanup on unmount
    return () => sub.unsubscribe();
  }, []);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (!content) return; // ignore empty/cancel
    client.models.Todo.create({ content }).catch((err) => {
      console.error("Failed to create todo:", err);
      alert("Could not create the to-do. Please try again.");
    });
  }

  function deleteTodo(id: string) {
    // Simple delete on click; you can add a confirm() if you want
    client.models.Todo.delete({ id }).catch((err) => {
      console.error("Failed to delete todo:", err);
      alert("Could not delete the to-do. Please try again.");
    });
  }

  return (
    <main style={{ maxWidth: 640, margin: "24px auto", padding: "0 16px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0 }}>
          {user?.signInDetails?.loginId
            ? `${user.signInDetails.loginId}'s todos`
            : "My todos"}
        </h1>
        <div style={{ marginLeft: "auto" }}>
          <button onClick={signOut}>Sign out</button>
        </div>
      </header>

      <section style={{ marginTop: 16 }}>
        <button onClick={createTodo}>+ new</button>
      </section>

      <ul style={{ marginTop: 16 }}>
        {todos.map((todo) => (
          <li
            onClick={() => deleteTodo(todo.id)}
            key={todo.id}
            style={{ cursor: "pointer", padding: "6px 0" }}
            title="Click to delete"
          >
            {todo.content}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 24, color: "#555" }}>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/">
          Review next step of this tutorial.
        </a>
      </div>
    </main>
  );
}

export default App;
