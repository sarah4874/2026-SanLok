import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { LEVELS, LEVEL_KEYS } from "../data/mountains";

export default function OnboardingPage() {
  const { level, setLevel, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // 이미 레벨을 골랐다면 바로 홈으로 (레벨을 바꾸러 온 경우는 제외)
  if (level && !location.state?.change) {
    return <Navigate to="/home" replace />;
  }

  const handleSelectLevel = (newLevel) => {
    setLevel(newLevel);
    navigate("/home");
  };

  return (
    <main className="onboarding">
      <div className="onboarding-inner">
        <p className="eyebrow">산을 기록하다</p>
        <h1>
          <span className="logo-mark">⛰</span> 산록(山麓)에 오신 것을 환영합니다
        </h1>
        <p className="onboarding-sub">
          {user ? `${user.nickname}님, ` : ""}나의 등산 레벨을 골라 주세요. 레벨에 맞는 명산을 추천해 드릴게요.
        </p>

        <div className="level-cards">
          {LEVEL_KEYS.map((lvl) => (
            <button
              key={lvl}
              className={`level-card ${lvl === level ? "active" : ""}`}
              onClick={() => handleSelectLevel(lvl)}
            >
              <span className="level-card-emoji">{LEVELS[lvl].emoji}</span>
              <strong>{LEVELS[lvl].label}</strong>
              <span className="level-card-sub">{lvl}</span>
              <span className="level-card-desc">{LEVELS[lvl].desc}</span>
            </button>
          ))}
        </div>

        {!user && (
          <p className="onboarding-login">
            이미 계정이 있나요? <Link to="/login">로그인</Link>
          </p>
        )}
      </div>
    </main>
  );
}
