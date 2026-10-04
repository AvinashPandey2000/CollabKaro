import { ImageResponse } from "next/og";
export const alt = "CollabKaro. Creators aur brands, ek jagah.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#FBFAF7",
        width: "100%",
        height: "100%",
        padding: 90,
        color: "#0E0B1F",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 46, fontWeight: 800 }}>
        collab<span style={{ color: "#6C3BFF" }}>karo.</span>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 86,
          fontWeight: 800,
          marginTop: 60,
        }}
      >
        Your creativity.
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 86,
          fontWeight: 800,
          color: "#6C3BFF",
        }}
      >
        Your next big collab.
      </div>
      <div style={{ display: "flex", fontSize: 28, marginTop: 35 }}>
        Where India’s creators and brands collab.
      </div>
    </div>,
    size,
  );
}
