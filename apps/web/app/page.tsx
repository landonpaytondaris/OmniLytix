export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 32, marginBottom: 6 }}>OmniLytix</h1>
      <p style={{ opacity: 0.8, marginBottom: 18 }}>
        Calm by default. Powerful by design.
      </p>

      <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        <button style={btnStyle}>Receive a Lot</button>
        <button style={btnStyle}>Start a Batch</button>
        <button style={btnStyle}>Trace a Code</button>
      </div>

      <div style={{ marginTop: 22, opacity: 0.7 }}>
        Seed build v0.1 — Daris Payton
      </div>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.04)",
  fontSize: 16,
  textAlign: "left",
  cursor: "pointer",
};
