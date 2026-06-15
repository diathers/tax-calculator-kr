"use client"

export function ScreenIdBadge({ id }: { id: string }) {
  if (process.env.NODE_ENV !== "development") return null
  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        right: 8,
        background: "rgba(0,0,0,0.38)",
        color: "#fff",
        fontSize: 10,
        fontFamily: "monospace",
        padding: "2px 7px",
        borderRadius: 4,
        pointerEvents: "none",
        zIndex: 9999,
        userSelect: "none",
        letterSpacing: "0.05em",
      }}
    >
      {id}
    </div>
  )
}
