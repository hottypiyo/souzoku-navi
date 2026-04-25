import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "相続手続きナビ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f8fafc",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        {/* カード */}
        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "64px 80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            width: "100%",
          }}
        >
          {/* アイコン */}
          <div
            style={{
              background: "#2563eb",
              borderRadius: "20px",
              width: "80px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "32px",
              fontSize: "40px",
            }}
          >
            📋
          </div>

          {/* タイトル */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              color: "#0f172a",
              marginBottom: "20px",
              letterSpacing: "-1px",
            }}
          >
            相続手続きナビ
          </div>

          {/* サブタイトル */}
          <div
            style={{
              fontSize: "26px",
              color: "#64748b",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            親が亡くなった後の手続きを
            <br />
            あなたの状況に合わせてナビゲート
          </div>

          {/* タグ */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "40px",
            }}
          >
            {["期限管理", "AI相談", "LINE通知"].map((tag) => (
              <div
                key={tag}
                style={{
                  background: "#eff6ff",
                  color: "#2563eb",
                  borderRadius: "100px",
                  padding: "8px 20px",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            marginTop: "32px",
            fontSize: "20px",
            color: "#94a3b8",
          }}
        >
          souzoku-navi.app
        </div>
      </div>
    ),
    { ...size },
  );
}
