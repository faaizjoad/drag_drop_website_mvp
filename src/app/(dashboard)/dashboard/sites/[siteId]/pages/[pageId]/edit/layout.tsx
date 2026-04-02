/**
 * The Puck editor needs full-viewport height and must not be
 * constrained by the dashboard sidebar layout's overflow-y-auto.
 * This layout replaces the inner scroll container for editor routes only.
 */
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
