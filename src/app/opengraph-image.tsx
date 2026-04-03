import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AINews — War & Conflict Live Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(ellipse at 20% 50%, rgba(220, 38, 38, 0.15), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.1), transparent 50%)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background:
              "linear-gradient(90deg, transparent, #dc2626, transparent)",
            display: "flex",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 900,
              color: "white",
              fontFamily: "monospace",
            }}
          >
            AI
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: "white",
                letterSpacing: -2,
              }}
            >
              AI
              <span style={{ color: "#dc2626" }}>News</span>
            </span>
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 20,
            color: "#a1a1a1",
            textTransform: "uppercase",
            letterSpacing: 6,
            fontWeight: 500,
            marginBottom: 40,
            display: "flex",
          }}
        >
          War & Conflict Live Tracker
        </div>

        {/* Stats boxes */}
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { icon: "🔴", label: "LIVE UPDATES" },
            { icon: "⚔️", label: "5 ACTIVE CONFLICTS" },
            { icon: "📰", label: "DAILY TOP 10" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 13,
                  color: "#a1a1a1",
                  fontWeight: 600,
                  letterSpacing: 2,
                  fontFamily: "monospace",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Date at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 13,
            color: "#666",
            fontFamily: "monospace",
            display: "flex",
          }}
        >
          {today}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
