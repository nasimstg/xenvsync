import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "xenvsync - Encrypt .env, commit with confidence";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "radial-gradient(circle at 20% 10%, rgba(34,211,238,0.32), transparent 38%), radial-gradient(circle at 85% 20%, rgba(167,139,250,0.28), transparent 36%), #06060b",
          color: "#e8e8f0",
          fontFamily: "Segoe UI, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 30,
            opacity: 0.95,
          }}
        >
          <span
            style={{
              display: "flex",
              width: 42,
              height: 42,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #06b6d4, #a78bfa)",
              color: "#06060b",
              fontWeight: 700,
            }}
          >
            &gt;_
          </span>
          xenvsync
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: -2,
            }}
          >
            Encrypt .env
            <br />
            Commit with confidence
          </div>
          <div style={{ fontSize: 34, color: "#a0a0bc" }}>
            AES-256-GCM + X25519 team sharing + in-memory injection
          </div>
        </div>

        <div style={{ fontSize: 26, color: "#22d3ee" }}>xenvsync.softexforge.io</div>
      </div>
    ),
    {
      ...size,
    }
  );
}
