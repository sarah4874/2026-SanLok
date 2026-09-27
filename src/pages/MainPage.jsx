import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mountainList } from "../data/mountains";

export default function MainPage() {
  const navigate = useNavigate();
  const [userLevel, setUserLevel] = useState("초급");

  // 로컬 스토리지에 저장된 사용자 수준 불러오기
  useEffect(() => {
    const savedLevel = localStorage.getItem("userLevel");
    if (savedLevel) {
      setUserLevel(savedLevel);
    }
  }, []);

  // 현재 사용자 수준에 맞는 산 3개 필터링
  const recommendedMountains = mountainList.filter(
    (item) => item.level === userLevel
  );

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      {/* 1. 산록 서비스 소개 & 산행 시작하기 */}
      <section style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1 style={{ fontSize: "2rem", color: "#1a1a1a", marginBottom: "12px" }}>
          자연 속으로 떠나는 발걸음, 산록(山麓)
        </h1>
        <p style={{ color: "#666", lineHeight: "1.6", marginBottom: "24px" }}>
          나에게 꼭 맞는 명산을 찾고, 날씨와 코스 타임라인을 확인하며 안전한 산행을 기록하세요.
        </p>
        <button
          onClick={() => navigate("/planner")}
          style={{
            backgroundColor: "#2e4f3b",
            color: "#fff",
            padding: "12px 28px",
            fontSize: "1rem",
            fontWeight: "600",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          산행 시작하기 →
        </button>
      </section>

      {/* 2. 사용자 맞춤 추천 산 3개 */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", margin: 0, color: "#222" }}>
              회원님을 위한 맞춤 추천 명산
            </h2>
            <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.9rem" }}>
              현재 설정된 등산 수준: <strong>{userLevel}</strong>
            </p>
          </div>
          <button
            onClick={() => navigate("/mountains")}
            style={{
              background: "none",
              border: "none",
              color: "#2e4f3b",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            전체 산 보기 →
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {recommendedMountains.map((mountain) => (
            <div
              key={mountain.id}
              style={{
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "20px",
                backgroundColor: "#fafafa"
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  backgroundColor: "#e8f3ed",
                  color: "#2e4f3b",
                  marginBottom: "10px"
                }}
              >
                {mountain.highlight}
              </span>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "1.15rem" }}>{mountain.name}</h3>
              <p style={{ margin: "0 0 4px 0", color: "#777", fontSize: "0.85rem" }}>
                위치: {mountain.location}
              </p>
              <p style={{ margin: "0 0 10px 0", color: "#777", fontSize: "0.85rem" }}>
                해발: {mountain.elevation}
              </p>
              <p style={{ margin: 0, color: "#444", fontSize: "0.85rem", lineHeight: "1.4" }}>
                {mountain.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}