import { ImageResponse } from "next/og";

// Matches the 3-circle logo exactly, at favicon-friendly square dimensions.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Bottom (rose) circle */}
        <div
          style={{
            position: "absolute",
            left: 7,
            top: 14,
            width: 18,
            height: 18,
            borderRadius: 999,
            background: "linear-gradient(135deg, #ff93b4 0%, #ef6a93 100%)",
            border: "2px solid #fffbf7",
          }}
        />
        {/* Top-left (coral) circle */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 2,
            width: 18,
            height: 18,
            borderRadius: 999,
            background: "linear-gradient(135deg, #ff7d5e 0%, #e8604c 100%)",
            border: "2px solid #fffbf7",
          }}
        />
        {/* Top-right (amber) circle */}
        <div
          style={{
            position: "absolute",
            left: 14,
            top: 2,
            width: 18,
            height: 18,
            borderRadius: 999,
            background: "linear-gradient(135deg, #ffc657 0%, #f4a826 100%)",
            border: "2px solid #fffbf7",
          }}
        />
      </div>
    ),
    size,
  );
}
