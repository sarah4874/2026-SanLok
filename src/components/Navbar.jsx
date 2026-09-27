import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  // 1. 현재 사용자 수준 상태 (로컬 스토리지 연동)
  const [level, setLevel] = useState("초급");
  // 2. 수준 변경 메뉴가 열려 있는지 여부
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 페이지가 바뀔 때마다(또는 처음 로드될 때) 저장된 수준 불러오기
  useEffect(() => {
    const savedLevel = localStorage.getItem("userLevel");
    if (savedLevel) {
      setLevel(savedLevel);
    }
  }, [location]);

  // 새로운 수준으로 변경할 때 실행
  const changeLevel = (newLevel) => {
    localStorage.setItem("userLevel", newLevel);
    setLevel(newLevel);
    setIsMenuOpen(false); // 선택 후 메뉴 닫기
  };

  // 등산 수준별 뱃지 아이콘/텍스트 매핑
  const levelLabels = {
    초급: "등린이 (초급)",
    중급: "취미 등산러 (중급)",
    고급: "산악인 (고급)",
  };

  // 첫 온보딩 화면('/')에서는 상단바를 숨기고 싶다면 이 주석을 풀어주세요.
  // if (location.pathname === "/") return null;

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 24px",
        backgroundColor: "#2e4f3b",
        color: "#fff",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
        <Link to="/home" style={{ color: "#fff", textDecoration: "none" }}>
          산록(山麓)
        </Link>
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* 네비게이션 메뉴들 */}
        <Link to="/home" style={{ color: "#fff", textDecoration: "none" }}>
          홈
        </Link>
        <Link to="/mountains" style={{ color: "#fff", textDecoration: "none" }}>
          명산 찾기
        </Link>
        <Link to="/planner" style={{ color: "#fff", textDecoration: "none" }}>
          산행 플래너
        </Link>
        <Link to="/mypage" style={{ color: "#fff", textDecoration: "none" }}>
          마이페이지
        </Link>

        {/* 🌟 사용자 등산 수준 표시 및 변경 버튼 영역 */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              backgroundColor: "#fff",
              color: "#2e4f3b",
              border: "none",
              borderRadius: "20px",
              padding: "6px 14px",
              fontWeight: "bold",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            {levelLabels[level] || "초급"} ▾
          </button>

          {/* 클릭 시 뜨는 드롭다운 메뉴 */}
          {isMenuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "40px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                display: "flex",
                flexDirection: "column",
                width: "160px",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              {Object.keys(levelLabels).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => changeLevel(lvl)}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    backgroundColor: level === lvl ? "#f0fdf4" : "transparent",
                    color: level === lvl ? "#166534" : "#333",
                    fontWeight: level === lvl ? "bold" : "normal",
                    border: "none",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {levelLabels[lvl]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}