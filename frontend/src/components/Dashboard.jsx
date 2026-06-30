import { useState, useEffect } from "react";

export default function Dashboard({ health, apiUrl }) {
  const [items,   setItems]   = useState([]);
  const [newItem, setNewItem] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [error,   setError]   = useState(null);

  useEffect(() => { fetchItems(); fetchMetrics(); }, []);

  async function fetchItems() {
    try {
      const res  = await fetch(`${apiUrl}/api/items`);
      const data = await res.json();
      setItems(data.items || []);
    } catch { setError("Failed to load items"); }
  }

  async function fetchMetrics() {
    try {
      const res  = await fetch(`${apiUrl}/api/metrics`);
      const data = await res.json();
      setMetrics(data);
    } catch {}
  }

  async function addItem() {
    if (!newItem.trim()) return;
    try {
      await fetch(`${apiUrl}/api/items`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: newItem }),
      });
      setNewItem("");
      fetchItems();
    } catch { setError("Failed to add item"); }
  }

  async function deleteItem(id) {
    try {
      await fetch(`${apiUrl}/api/items/${id}`, { method: "DELETE" });
      fetchItems();
    } catch { setError("Failed to delete item"); }
  }

  return (
    <div className="dashboard">

      {/* Health */}
      <div className="card">
        <h2>Backend health</h2>
        <div className={`health-badge ${health?.status === "ok" ? "ok" : "error"}`}>
          {health?.status === "ok" ? "✅ Healthy" : "❌ " + (health?.status || "Unknown")}
        </div>
        {health?.version && (
          <p className="meta">Version: {health.version} | Uptime: {Math.floor(health.uptime)}s</p>
        )}
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="card">
          <h2>Metrics</h2>
          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-value">{metrics.totalRequests}</span>
              <span className="metric-label">Requests</span>
            </div>
            <div className="metric">
              <span className="metric-value">{metrics.itemCount}</span>
              <span className="metric-label">Items</span>
            </div>
            <div className="metric">
              <span className="metric-value">{metrics.memoryMB} MB</span>
              <span className="metric-label">Memory</span>
            </div>
          </div>
        </div>
      )}

      {/* CRUD */}
      <div className="card">
        <h2>Items (CRUD demo)</h2>
        {error && <p className="error">{error}</p>}
        <div className="input-row">
          <input
            className="text-input"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Add new item…"
          />
          <button className="btn btn-primary" onClick={addItem}>Add</button>
        </div>
        <ul className="item-list">
          {items.length === 0 && <li className="empty">No items yet.</li>}
          {items.map((item) => (
            <li key={item.id} className="item">
              <span>{item.name}</span>
              <span className="item-meta">{new Date(item.createdAt).toLocaleTimeString()}</span>
              <button className="btn btn-danger" onClick={() => deleteItem(item.id)}>✕</button>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}