export default function Header({ environment }) {
  const envColor = {
    production: "#22c55e",
    staging:    "#f59e0b",
    development:"#3b82f6",
  }[environment] || "#6b7280";

  return (
    <header className="header">
      <div className="header-inner">
        <h1 className="logo">🚀 DevOps App</h1>
        <span className="env-badge" style={{ background: envColor }}>
          {environment.toUpperCase()}
        </span>
      </div>
    </header>
  );
}