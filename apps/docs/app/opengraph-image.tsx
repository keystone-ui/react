import { ImageResponse } from "next/og";

export const alt = "Keystone UI: accessible React components";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Static social card, rendered once at build. Keeps to system fonts and
 * flat colours so it needs no font files or network access during
 * prerendering.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "flex-start",
        background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
        color: "#fafafa",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: 72,
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          fontSize: 28,
          gap: 16,
          letterSpacing: -0.5,
          opacity: 0.8,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #00E1FF, #0072F5, #9750DD)",
            borderRadius: 12,
            height: 40,
            width: 40,
          }}
        />
        keystoneui.io
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>
          Keystone UI
        </div>
        <div style={{ fontSize: 34, maxWidth: 900, opacity: 0.75 }}>
          Beautiful, accessible React components built with Tailwind CSS v4 and
          Base UI.
        </div>
      </div>
    </div>,
    size
  );
}
