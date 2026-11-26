import { ImageResponse } from "next/og";

export const alt = "Be a Buddy — Meet People Worth Meeting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fffbf7 0%, #ffe9d6 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            width: 210,
            height: 190,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 120,
              height: 120,
              borderRadius: 999,
              background: "linear-gradient(135deg, #ff7d5e 0%, #e8604c 100%)",
              border: "5px solid #fffbf7",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 90,
              top: 0,
              width: 120,
              height: 120,
              borderRadius: 999,
              background: "linear-gradient(135deg, #ffc657 0%, #f4a826 100%)",
              border: "5px solid #fffbf7",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 45,
              top: 70,
              width: 120,
              height: 120,
              borderRadius: 999,
              background: "linear-gradient(135deg, #ff93b4 0%, #ef6a93 100%)",
              border: "5px solid #fffbf7",
            }}
          />
        </div>
        <div style={{ fontSize: 76, fontWeight: 800, color: "#2a2320" }}>Be a Buddy</div>
        <div style={{ fontSize: 40, color: "#776b62", marginTop: 8 }}>Meet People Worth Meeting</div>
      </div>
    ),
    size,
  );
}
