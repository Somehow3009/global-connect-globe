import { GlobeScene } from "@/components/Globe/GlobeScene";

export function App() {
  return (
    <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
      <div
        style={{
          width: "min(960px, 92vw)",
          aspectRatio: "16 / 9",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px -24px rgba(0,0,0,0.6)",
          background: "#050510",
        }}
      >
        <GlobeScene />
      </div>
    </div>
  );
}
