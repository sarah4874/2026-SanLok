import { useState } from "react";
import { fetchAiCourses, getCachedCourses } from "../utils/aiCourse";
import { formatDuration } from "../utils/time";

const CONFIDENCE = {
  high: "비교적 잘 알려진 코스예요.",
  medium: "일부 정보가 실제와 다를 수 있어요.",
  low: "정보가 부족한 산이에요. 꼭 다른 자료로 확인하세요.",
};

// 플래너 안의 "AI 코스 추천" 박스
// onApply(course): 코스를 고르면 타임라인을 그 코스 시간으로 다시 만듦
export default function AiCoursePanel({ mountain, selectedName, onApply }) {
  // 이미 받아 둔 산이면 바로 보여 주기
  const [state, setState] = useState(() => {
    const cached = getCachedCourses(mountain.id);
    return cached ? { status: "done", data: cached } : { status: "idle" };
  });

  const load = async () => {
    setState({ status: "loading" });
    try {
      setState({ status: "done", data: await fetchAiCourses(mountain.id) });
    } catch (err) {
      setState({ status: "error", error: err.message });
    }
  };

  return (
    <div className="ai-panel">
      <div className="ai-head">
        <div>
          <strong>
            코스 추천 <span className="ai-tag">AI</span>
          </strong>
        </div>
        {state.status === "idle" && (
          <button className="btn btn-primary btn-small" onClick={load}>
            코스 받아오기
          </button>
        )}
      </div>

      {state.status === "loading" && <p className="muted small">코스를 찾는 중…</p>}

      {state.status === "error" && (
        <div className="ai-error">
          <p className="form-error">{state.error}</p>
          <button className="btn btn-ghost btn-small" onClick={load}>
            다시 시도
          </button>
        </div>
      )}

      {state.status === "done" && (
        <>
          {state.data.summary && <p className="ai-summary">{state.data.summary}</p>}

          {state.data.courses.length > 0 ? (
            <ul className="ai-courses">
              {state.data.courses.map((c) => (
                <li key={c.name} className={selectedName === c.name ? "selected" : ""}>
                  <div className="ai-course-top">
                    <strong>{c.name}</strong>
                    <span className="ai-difficulty">{c.difficulty}</span>
                  </div>
                  <p className="ai-course-meta">
                    {c.start && <>들머리 {c.start} · </>}
                    {c.distanceKm && <>편도 {c.distanceKm}km · </>}
                    오르기 {formatDuration(c.upMinutes)} · 내려오기 {formatDuration(c.downMinutes)}
                  </p>
                  {c.highlight && <p className="ai-course-note">{c.highlight}</p>}
                  {c.caution && <p className="ai-course-note caution">주의 · {c.caution}</p>}
                  <button className="btn btn-ghost btn-small" onClick={() => onApply(c)}>
                    {selectedName === c.name ? "적용됨" : "이 코스로 일정 만들기"}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted small">AI가 이 산의 코스를 확실히 알지 못해요. 높이 기준 추천 일정을 써 주세요.</p>
          )}

          <p className="ai-disclaimer">
            AI가 만든 참고용 정보예요. {CONFIDENCE[state.data.confidence]} 출발 전에 국립공원·지자체 안내를 꼭
            확인하세요.
          </p>
        </>
      )}
    </div>
  );
}
