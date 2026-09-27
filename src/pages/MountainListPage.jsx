import { mountainList } from "../data/mountains";

export default function MountainListPage() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>명산 찾기</h1>
      <p style={{ color: "#666", marginBottom: "32px" }}>
        전국의 대표 명산 목록을 탐색해 보세요.
      </p>

      {/* 전체 산 카드 리스트 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {mountainList.map((mountain) => (
          <div
            key={mountain.id}
            style={{
              border: "1px solid #eaeaea",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  backgroundColor:
                    mountain.level === "초급"
                      ? "#eef8f2"
                      : mountain.level === "중급"
                      ? "#fef7ee"
                      : "#fdf0f0",
                  color:
                    mountain.level === "초급"
                      ? "#227042"
                      : mountain.level === "중급"
                      ? "#9a5b13"
                      : "#b02a2a",
                  fontWeight: "bold",
                }}
              >
                {mountain.level}
              </span>
              <span style={{ fontSize: "0.8rem", color: "#888" }}>
                {mountain.elevation}
              </span>
            </div>

            <h3 style={{ margin: "0 0 6px 0", fontSize: "1.2rem" }}>
              {mountain.name}
            </h3>
            <p style={{ margin: "0 0 10px 0", color: "#666", fontSize: "0.85rem" }}>
              {mountain.location}
            </p>
            <p
              style={{
                margin: 0,
                color: "#444",
                fontSize: "0.88rem",
                lineHeight: "1.5",
              }}
            >
              {mountain.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}