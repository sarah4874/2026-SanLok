import { useNavigate } from "react-router-dom";

export default function OnboardingPage() {
  const navigate = useNavigate();

  // 버튼을 눌렀을 때 실행되는 함수
  const handleSelectLevel = (level) => {
    // 1. 브라우저 로컬 스토리지에 사용자가 고른 난이도('초급', '중급', '고급')를 저장
    localStorage.setItem("userLevel", level);

    // 2. 홈 화면(/home)으로 페이지 이동
    navigate("/home");
  };

  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <h1>🏔️ 산록(山麓)에 오신 것을 환영합니다!</h1>
      <p style={{ color: "#666", marginBottom: "40px" }}>
        회원님의 등산 수준을 선택해주세요. 맞춤 산을 추천해 드릴게요.
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
        <button
          onClick={() => handleSelectLevel("초급")}
          style={{ padding: "14px 24px", fontSize: "16px", cursor: "pointer", borderRadius: "8px" }}
        >
          🌱 등린이 (초급)
        </button>

        <button
          onClick={() => handleSelectLevel("중급")}
          style={{ padding: "14px 24px", fontSize: "16px", cursor: "pointer", borderRadius: "8px" }}
        >
          🌿 취미 등산러 (중급)
        </button>

        <button
          onClick={() => handleSelectLevel("고급")}
          style={{ padding: "14px 24px", fontSize: "16px", cursor: "pointer", borderRadius: "8px" }}
        >
          🌲 산악인 (고급)
        </button>
      </div>
    </div>
  );
}