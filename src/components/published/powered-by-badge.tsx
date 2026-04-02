export function PoweredByBadge() {
  return (
    <a
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        zIndex: 9999,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        background: "rgba(17,24,39,0.85)",
        color: "#f9fafb",
        borderRadius: "8px",
        fontSize: "11px",
        fontFamily: "system-ui, sans-serif",
        fontWeight: 500,
        textDecoration: "none",
        backdropFilter: "blur(6px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        letterSpacing: "0.01em",
        lineHeight: 1,
      }}
    >
      <span style={{ opacity: 0.6 }}>Built with</span>
      <span style={{ color: "#60a5fa", fontWeight: 700 }}>WebBuilder</span>
    </a>
  );
}
