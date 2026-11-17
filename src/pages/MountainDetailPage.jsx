import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getMountain } from "../data/mountains";
import LevelBadge from "../components/LevelBadge";
import CertifyModal from "../components/CertifyModal";
import { estimateHikeMinutes, formatDuration, formatFullDate } from "../utils/time";
import NotFoundPage from "./NotFoundPage";

export default function MountainDetailPage() {
  const { id } = useParams();
  const mountain = getMountain(id);
  const { user, completions } = useApp();
  const navigate = useNavigate();
  const [isCertifyOpen, setIsCertifyOpen] = useState(false);

  if (!mountain) return <NotFoundPage />;

  const completion = completions[mountain.id];
  const { up, down } = estimateHikeMinutes(mountain.height);

  const openCertify = () => {
    if (!user) navigate("/login", { state: { from: `/mountains/${mountain.id}` } });
    else setIsCertifyOpen(true);
  };

  return (
    <main className="page">
      <Link to="/mountains" className="back-link">
        ← 명산 목록
      </Link>

      <section className="detail-card">
        <div className="detail-meta">
          <span className="detail-number">블랙야크 {mountain.seriesLabel}</span>
          <LevelBadge level={mountain.level} />
        </div>
        <h1>{mountain.name}</h1>
        {mountain.desc && <p className="detail-desc">{mountain.desc}</p>}

        <dl className="detail-facts">
          <div>
            <dt>높이</dt>
            <dd>{mountain.elevation}</dd>
          </div>
          <div>
            <dt>위치</dt>
            <dd>{mountain.location}</dd>
          </div>
          <div>
            <dt>예상 소요</dt>
            <dd>
              왕복 약 {formatDuration(up + down)} <small>(오르기 {formatDuration(up)})</small>
            </dd>
          </div>
          {completion && (
            <div>
              <dt>완등</dt>
              <dd className="done-text">✓ {formatFullDate(completion.date)}</dd>
            </div>
          )}
        </dl>

        <div className="detail-actions">
          <Link to={`/planner?mountain=${mountain.id}`} className="btn btn-primary">
            이 산으로 계획 세우기
          </Link>
          <button className="btn btn-ghost" onClick={openCertify}>
            {completion ? "완등 기록 수정" : "완등 인증하기"}
          </button>
        </div>
      </section>

      {isCertifyOpen && <CertifyModal mountain={mountain} onClose={() => setIsCertifyOpen(false)} />}
    </main>
  );
}
