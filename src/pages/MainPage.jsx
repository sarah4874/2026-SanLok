import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { LEVELS, mountainList } from "../data/mountains";
import MountainCard from "../components/MountainCard";

export default function MainPage() {
  const { level, user, completions } = useApp();
  const recommended = level ? mountainList.filter((m) => m.level === level && m.featured) : [];

  return (
    <main className="page">
      {/* 1. 산록 소개 + 산행 시작하기 */}
      <section className="intro-box">
        <p className="intro-eyebrow">자연 속으로 떠나는 발걸음</p>
        <h1 className="intro-title">
          산록<span>山麓</span>
        </h1>
        <div className="intro-bottom">
          <p className="intro-text">
            내 등산 수준에 맞는 명산을 고르고, 정상 날씨와 시간대별 일정을 미리 짜 보세요.
            <br />
            다녀온 산은 완등 기록으로 차곡차곡 남겨 둘 수 있어요.
          </p>
          <Link to="/planner" className="btn btn-light">
            산행 시작하기 →
          </Link>
        </div>
      </section>

      {/* 2. 회원 맞춤 추천 명산 */}
      <section className="section">
        <div className="section-head">
          <div>
            <h2>{user ? `${user.nickname}님을 위한 맞춤 추천 명산` : "회원님을 위한 맞춤 추천 명산"}</h2>
            <p className="muted">
              {user ? `${user.nickname}님의` : "회원님의"} 등산 수준:{" "}
              <strong className="level-text">
                {level ? `${LEVELS[level].emoji} ${LEVELS[level].full}` : "아직 선택 안 함"}
              </strong>
            </p>
          </div>
          {level && (
            <Link to="/mountains" className="text-link">
              전체 산 보기 →
            </Link>
          )}
        </div>

        {level ? (
          <div className="card-grid three">
            {recommended.map((m) => (
              <MountainCard key={m.id} mountain={m} completed={!!completions[m.id]} />
            ))}
          </div>
        ) : (
          <div className="empty-box">
            <p>등산 수준을 고르면 딱 맞는 산을 추천해 드려요.</p>
            <Link to="/" className="btn btn-primary">
              레벨 선택하기
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
