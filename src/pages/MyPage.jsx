import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { LEVELS, LEVEL_KEYS, SERIES_TOTAL, getMountain } from "../data/mountains";
import RequireLogin from "../components/RequireLogin";
import PlanList from "../components/PlanList";
import { formatFullDate, toDateString } from "../utils/time";

export default function MyPage() {
  const { user, level, setLevel, plans, completions, deletePlan, updateProfile, logout } = useApp();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [showPast, setShowPast] = useState(false);

  if (!user) {
    return (
      <main className="page">
        <RequireLogin message="마이페이지에서 내 산행 계획과 완등 기록을 한눈에 볼 수 있어요." />
      </main>
    );
  }

  const today = toDateString();
  const upcoming = plans.filter((p) => p.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = plans.filter((p) => p.date < today).sort((a, b) => b.date.localeCompare(a.date));

  const completedList = Object.entries(completions)
    .map(([id, record]) => ({ mountain: getMountain(id), record }))
    .filter((c) => c.mountain)
    .sort((a, b) => b.record.date.localeCompare(a.record.date));

  const saveNickname = (e) => {
    e.preventDefault();
    if (nickname.trim().length < 2) return;
    updateProfile({ nickname: nickname.trim() });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  return (
    <main className="page mypage">
      {/* 1. 프로필 */}
      <section className="panel">
        <div className="profile">
          <div className="avatar">{user.nickname.slice(0, 1)}</div>
          <div className="profile-info">
            {isEditing ? (
              <form onSubmit={saveNickname} className="inline-form">
                <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={12} autoFocus />
                <button className="btn btn-primary btn-small">저장</button>
                <button type="button" className="btn btn-ghost btn-small" onClick={() => setIsEditing(false)}>
                  취소
                </button>
              </form>
            ) : (
              <h1>
                {user.nickname}
                <button className="text-button" onClick={() => setIsEditing(true)}>
                  닉네임 수정
                </button>
              </h1>
            )}
            <p className="muted">{user.email}</p>
          </div>
          <button className="btn btn-ghost btn-small" onClick={handleLogout}>
            로그아웃
          </button>
        </div>

        <div className="level-row">
          <span className="level-row-label">등산 수준</span>
          <div className="chip-row">
            {LEVEL_KEYS.map((lvl) => (
              <button key={lvl} className={`chip ${level === lvl ? "active" : ""}`} onClick={() => setLevel(lvl)}>
                {LEVELS[lvl].emoji} {LEVELS[lvl].label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. 산행 계획 */}
      <section className="panel">
        <div className="section-head">
          <h2>다가오는 산행</h2>
          <Link to="/planner" className="text-link">
            + 새 계획
          </Link>
        </div>
        {upcoming.length > 0 ? (
          <PlanList plans={upcoming} onDelete={deletePlan} />
        ) : (
          <p className="muted">예정된 산행이 없어요. 산행 플래너에서 계획을 세워 보세요.</p>
        )}
        {past.length > 0 && (
          <>
            <button className="text-button past-toggle" onClick={() => setShowPast(!showPast)}>
              지난 계획 {past.length}개 {showPast ? "접기" : "보기"}
            </button>
            {showPast && <PlanList plans={past} onDelete={deletePlan} />}
          </>
        )}
      </section>

      {/* 3. 완등 기록 */}
      <section className="panel">
        <div className="section-head">
          <h2>완등 기록</h2>
          <Link to="/mountains" className="text-link">
            명산 찾기 →
          </Link>
        </div>
        {["100", "100+"].map((series) => {
          const done = completedList.filter((c) => c.mountain.series === series).length;
          const total = SERIES_TOTAL[series];
          return (
            <div key={series} className="done-progress">
              <span className="done-progress-label">명산{series}</span>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${(done / total) * 100}%` }} />
              </div>
              <span>
                {done} / {total}
              </span>
            </div>
          );
        })}
        {completedList.length > 0 ? (
          <ul className="done-chips">
            {completedList.map(({ mountain, record }) => (
              <li key={mountain.id}>
                <Link to={`/mountains/${mountain.id}`} title={`${formatFullDate(record.date)} 완등`}>
                  ✓ {mountain.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">아직 완등 기록이 없어요.</p>
        )}
      </section>
    </main>
  );
}
