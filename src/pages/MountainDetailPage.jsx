import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { LEVELS, getMountain, mountainList } from "../data/mountains";
import LevelBadge from "../components/LevelBadge";
import CertifyModal from "../components/CertifyModal";
import { estimateHikeMinutes, formatDuration, formatFullDate } from "../utils/time";
import NotFoundPage from "./NotFoundPage";

// 받침 여부에 따라 은/는 고르기 ("가리산(홍천)"은 괄호 앞 글자로 판단)
function josa(word, withBatchim, without) {
  const base = word.replace(/\(.*\)/, "").trim();
  const code = base.charCodeAt(base.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return withBatchim;
  return code % 28 === 0 ? without : withBatchim;
}

// 레벨별 기본 준비물
const GEAR = {
  초급: ["물 500ml", "간단한 간식", "편한 운동화"],
  중급: ["물 1L", "등산화", "바람막이", "간식"],
  고급: ["물 1.5L 이상", "등산화·스틱", "도시락", "여벌 옷", "헤드랜턴"],
};

// 계절별로 더 챙길 것
function seasonGear() {
  const month = new Date().getMonth() + 1;
  if (month === 12 || month <= 2) return { label: "겨울", items: ["아이젠", "방한 장갑", "보온병"] };
  if (month >= 6 && month <= 8) return { label: "여름", items: ["여분 물", "모자", "벌레 기피제"] };
  if (month >= 9 && month <= 11) return { label: "가을", items: ["얇은 패딩", "장갑"] };
  return { label: "봄", items: ["얇은 겉옷", "선크림"] };
}

const LEVEL_TIP = {
  초급: "등산이 처음이어도 부담 없이 다녀올 수 있는 높이예요.",
  중급: "가파른 구간이나 바위가 섞여 있을 수 있어요. 등산화를 신고 가는 걸 추천해요.",
  고급: "하루를 넉넉히 잡아야 하는 산이에요. 일찍 출발하고 하산 시간을 꼭 정해 두세요.",
};

export default function MountainDetailPage() {
  const { id } = useParams();
  const mountain = getMountain(id);
  const { user, completions } = useApp();
  const navigate = useNavigate();
  const [isCertifyOpen, setIsCertifyOpen] = useState(false);

  if (!mountain) return <NotFoundPage />;

  const completion = completions[mountain.id];
  const { up, down } = estimateHikeMinutes(mountain.height);
  const season = seasonGear();
  const nearby = mountainList
    .filter((m) => m.area === mountain.area && m.id !== mountain.id)
    .sort(
      (a, b) =>
        Math.abs(a.lat - mountain.lat) +
        Math.abs(a.lng - mountain.lng) -
        (Math.abs(b.lat - mountain.lat) + Math.abs(b.lng - mountain.lng)),
    )
    .slice(0, 4);

  const openCertify = () => {
    if (!user) navigate("/login", { state: { from: `/mountains/${mountain.id}` } });
    else setIsCertifyOpen(true);
  };

  return (
    <main className="page detail-page">
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
              왕복 약 {formatDuration(up + down)} <small>(오르기 {formatDuration(up)}, 휴식 제외)</small>
            </dd>
          </div>
          {completion && (
            <div>
              <dt>완등</dt>
              <dd className="done-text">✓ {formatFullDate(completion.date)}</dd>
            </div>
          )}
        </dl>

        <div className="detail-section">
          <h2>산행 정보</h2>
          <p>
            {mountain.name}
            {josa(mountain.name, "은", "는")} {mountain.location}에 있는 {mountain.elevation} 산으로, 블랙야크{" "}
            {mountain.seriesLabel}에 들어가 있어요. 산록 기준으로는 {LEVELS[mountain.level].label} 코스예요.{" "}
            {LEVEL_TIP[mountain.level]}
          </p>
        </div>

        <div className="detail-section">
          <h2>챙기면 좋은 것</h2>
          <ul className="gear-list">
            {GEAR[mountain.level].map((item) => (
              <li key={item}>{item}</li>
            ))}
            {season.items.map((item) => (
              <li key={item} className="season">
                {item}
              </li>
            ))}
          </ul>
          <p className="muted small">초록색은 {season.label}철에 더 챙기면 좋은 것이에요.</p>
        </div>

        {nearby.length > 0 && (
          <div className="detail-section">
            <h2>{mountain.area}의 가까운 명산</h2>
            <ul className="nearby-list">
              {nearby.map((m) => (
                <li key={m.id}>
                  <Link to={`/mountains/${m.id}`}>
                    {m.name} <small>{m.elevation}</small>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

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
