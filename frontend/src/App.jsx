import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import "./App.css";

function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((r) => r.json())
      .then((data) => { setHealth(data); setLoading(false); })
      .catch(() => { setHealth({ status: "unreachable" }); setLoading(false); });
  }, [API_URL]);

  return (
    <div className="app">
      <Header environment={import.meta.env.VITE_ENV || "development"} />
      <main className="main">
        {loading ? (
          <p className="loading">Connecting to backend…</p>
        ) : (
          <Dashboard health={health} apiUrl={API_URL} />
        )}
      </main>
    </div>
  );
}

export default App;