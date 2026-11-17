import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { LEVELS, LEVEL_KEYS, getMountain, mountainList } from "../data/mountains";
import useForecast from "../hooks/useForecast";
import { describeWeather, getSafetyTips } from "../utils/weather";
import { makeId } from "../utils/storage";
import {
  addDays,
  estimateHikeMinutes,
  formatDate,
  formatDuration,
  fromMinutes,
  toDateString,
  toMinutes,
} from "../utils/time";

// 산 높이로 기본 타임라인 만들기 (분 단위)
function generateSteps(mountain, startTime) {
  const { up, down } = estimateHikeMinutes(mountain.height);
  const s = toMinutes(startTime);
  const half = Math.round(up / 2 / 10) * 10;
  const summit = s + up + 10; // 중간 휴식 10분 포함
  return [
    { time: s, title: "들머리 출발", memo: "스트레칭, 물·간식 확인" },
    { time: s + half, title: "중간 휴식", memo: "10분 휴식, 수분 보충" },
    { time: summit, title: `${mountain.name} 정상 도착`, memo: "정상 인증 사진" },
    { time: summit + 30, title: "하산 시작", memo: "점심·휴식 30분 후 출발" },
    { time: summit + 30 + down, title: "하산 완료", memo: "" },
  ].map((step) => ({ id: makeId(), time: fromMinutes(step.time), title: step.title, memo: step.memo }));
}

const sortSteps = (steps) => [...steps].sort((a, b) => a.time.localeCompare(b.time));

export default function PlannerPage() {
  const [params] = useSearchParams();
  const { plans } = useApp();
  const planId = params.get("plan");
  const plan = planId ? plans.find((p) => p.id === planId) : null;

  const mountainParam = getMountain(params.get("mountain"));
  const dateParam = params.get("date");

  // key가 바뀌면 편집기를 새로 그려서 선택한 계획/산으로 초기화
  const editorKey = plan ? plan.id : `new-${mountainParam?.id || ""}-${dateParam || ""}`;

  return (
    <main className="page">
      <div className="page-head">
        <h1>산행 플래너</h1>
        <p className="muted">산과 날짜를 고르면 정상 날씨를 보여 드려요. 타임라인은 분 단위로 직접 고칠 수 있어요.</p>
      </div>
      <PlannerEditor
        key={editorKey}
        initialPlan={plan}
        initialMountain={plan ? getMountain(plan.mountainId) : mountainParam}
        initialDate={plan ? plan.date : dateParam}
      />
    </main>
  );
}

function PlannerEditor({ initialPlan, initialMountain, initialDate }) {
  const { user, savePlan, level } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const today = toDateString();
  const lastDay = addDays(today, 15); // 예보는 16일까지

  const startMountain =
    initialMountain || mountainList.find((m) => m.level === (level || "초급") && m.featured) || mountainList[0];

  const [mountainId, setMountainId] = useState(startMountain.id);
  const [date, setDate] = useState(initialDate || today);
  const [startTime, setStartTime] = useState(initialPlan?.startTime || "08:00");
  const [steps, setSteps] = useState(() => initialPlan?.steps || generateSteps(startMountain, "08:00"));
  const [memo, setMemo] = useState(initialPlan?.memo || "");
  // 새 계획을 저장하면 주소가 바뀌며 화면이 새로 그려지므로, 저장 완료 표시는 location.state로 넘겨받음
  const [message, setMessage] = useState(location.state?.saved ? "저장했어요!" : "");

  const mountain = getMountain(mountainId);
  const forecast = useForecast(mountain);
  const day = forecast.days.find((d) => d.date === date);

  const sorted = sortSteps(steps);
  const total = sorted.length >= 2 ? toMinutes(sorted[sorted.length - 1].time) - toMinutes(sorted[0].time) : 0;
  const endsAfterSunset = day && sorted.length > 0 && sorted[sorted.length - 1].time > day.sunset;
  const startsBeforeSunrise = day && sorted.length > 0 && sorted[0].time < day.sunrise;

  const changeMountain = (id) => {
    const next = getMountain(id);
    setMountainId(next.id);
    setSteps(generateSteps(next, startTime)); // 산이 바뀌면 타임라인도 새로
    setMessage("");
  };

  const regenerate = () => {
    setSteps(generateSteps(mountain, startTime));
    setMessage("");
  };

  const updateStep = (id, field, value) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeStep = (id) => setSteps(steps.filter((s) => s.id !== id));

  const addStep = () => {
    const last = sorted[sorted.length - 1];
    const time = last ? fromMinutes(toMinutes(last.time) + 30) : startTime;
    setSteps([...steps, { id: makeId(), time, title: "", memo: "" }]);
  };

  const handleSave = () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    if (sorted.some((s) => !s.title.trim())) {
      setMessage("이름이 비어 있는 일정이 있어요.");
      return;
    }
    const saved = savePlan({
      id: initialPlan?.id,
      mountainId,
      date,
      startTime,
      steps: sorted.map((s) => ({ ...s, title: s.title.trim() })),
      memo: memo.trim(),
    });
    if (!saved) {
      setMessage("저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.");
      return;
    }
    if (initialPlan) setMessage("저장했어요!");
    else navigate(`/planner?plan=${saved.id}`, { replace: true, state: { saved: true } });
  };

  return (
    <div className="planner">
      {/* 왼쪽: 위는 산·날짜 선택, 아래는 날씨 */}
      <section className="panel planner-side">
        <div className="planner-pick">
          <label className="field">
            <span>어느 산에 갈까요?</span>
            <select value={mountainId} onChange={(e) => changeMountain(e.target.value)}>
              {LEVEL_KEYS.map((lvl) => (
                <optgroup key={lvl} label={`${LEVELS[lvl].emoji} ${LEVELS[lvl].label}`}>
                  {mountainList
                    .filter((m) => m.level === lvl)
                    .sort((a, b) => a.name.localeCompare(b.name, "ko"))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.elevation})
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          <Link to={`/mountains/${mountain.id}`} className="text-link small">
            {mountain.name} 정보 보기 →
          </Link>

          <label className="field">
            <span>언제 갈까요?</span>
            <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        <div className="planner-weather">
          <h3>
            {formatDate(date)} · {mountain.name} 정상 날씨
          </h3>
          <div className="weather-box">
            {forecast.status === "loading" && <p className="muted">날씨를 불러오는 중…</p>}
            {forecast.status === "error" && (
              <div className="weather-error">
                <p className="form-error">{forecast.error}</p>
                <button className="btn btn-ghost btn-small" onClick={forecast.retry}>
                  ↻ 다시 시도
                </button>
              </div>
            )}
            {forecast.status === "done" && !day && (
              <p className="muted">
                {date > lastDay
                  ? "16일 이후 날씨는 아직 예보가 없어요. 가까워지면 다시 확인해 주세요."
                  : "이 날짜의 예보가 없어요."}
              </p>
            )}
            {day && <WeatherDetail day={day} />}
          </div>
        </div>
      </section>

      {/* 오른쪽: 타임라인 + 아래 저장 박스 */}
      <div className="planner-right">
        <section className="panel planner-main">
          <div className="timeline-head">
            <div>
              <h2>분 단위 타임라인</h2>
              <p className="muted small">
                총 {formatDuration(Math.max(total, 0))} · 일정 {sorted.length}개
              </p>
            </div>
            <div className="timeline-tools">
              <label className="inline-field">
                출발
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </label>
              <button className="btn btn-ghost btn-small" onClick={regenerate}>
                ↻ 추천 일정으로 다시 만들기
              </button>
            </div>
          </div>

          {(endsAfterSunset || startsBeforeSunrise) && (
            <div className="tip warn">
              {endsAfterSunset && (
                <p>⚠️ 하산 완료가 일몰({day.sunset}) 이후예요. 출발을 앞당기거나 헤드랜턴을 챙기세요.</p>
              )}
              {startsBeforeSunrise && <p>🔦 일출({day.sunrise}) 전에 출발해요. 헤드랜턴이 필요해요.</p>}
            </div>
          )}

          <ol className="timeline">
            {sorted.map((step, i) => {
              const gap = i > 0 ? toMinutes(step.time) - toMinutes(sorted[i - 1].time) : null;
              return (
                <li key={step.id} className="timeline-item">
                  {gap !== null && <span className="timeline-gap">+{formatDuration(gap)}</span>}
                  <div className="timeline-row">
                    <input
                      type="time"
                      className="timeline-time"
                      value={step.time}
                      onChange={(e) => e.target.value && updateStep(step.id, "time", e.target.value)}
                      aria-label="시간"
                    />
                    <div className="timeline-body">
                      <input
                        className="timeline-title"
                        value={step.title}
                        placeholder="일정 이름 (예: 깔딱고개)"
                        onChange={(e) => updateStep(step.id, "title", e.target.value)}
                        aria-label="일정 이름"
                      />
                      <input
                        className="timeline-memo"
                        value={step.memo}
                        placeholder="메모"
                        onChange={(e) => updateStep(step.id, "memo", e.target.value)}
                        aria-label="메모"
                      />
                    </div>
                    <button className="icon-button" onClick={() => removeStep(step.id)} aria-label="일정 삭제">
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>

          <button className="btn btn-dashed btn-block" onClick={addStep}>
            + 일정 추가
          </button>

          <label className="field">
            <span>준비물·메모</span>
            <textarea
              rows={3}
              value={memo}
              placeholder="예: 물 1L, 아이젠, 보조배터리, 김밥"
              onChange={(e) => setMemo(e.target.value)}
            />
          </label>

          <p className="muted small">※ 추천 일정은 높이로 계산한 대략적인 시간이에요. 실제 코스에 맞게 고쳐 쓰세요.</p>
        </section>

        <section className="panel save-box">
          <div>
            <strong>
              {mountain.name} · {formatDate(date)}
            </strong>
            <p className="muted small">
              {message ? (
                <span className={message.includes("저장했어요") ? "save-ok" : "form-error"}>{message}</span>
              ) : user ? (
                "저장한 계획은 마이페이지에서 볼 수 있어요."
              ) : (
                "로그인하면 계획을 저장할 수 있어요."
              )}
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            {user ? (initialPlan ? "계획 수정 저장" : "계획 저장") : "로그인하고 저장"}
          </button>
        </section>
      </div>
    </div>
  );
}

function WeatherDetail({ day }) {
  const w = describeWeather(day.code);
  return (
    <>
      <div className="weather-main">
        <span className="weather-big-icon">{w.icon}</span>
        <div>
          <strong>{w.text}</strong>
          <p>
            최고 {day.max}° / 최저 {day.min}°
          </p>
        </div>
      </div>
      <dl className="weather-facts">
        <div>
          <dt>강수확률</dt>
          <dd>{day.rain}%</dd>
        </div>
        <div>
          <dt>최대 풍속</dt>
          <dd>{day.wind}m/s</dd>
        </div>
        <div>
          <dt>일출</dt>
          <dd>{day.sunrise}</dd>
        </div>
        <div>
          <dt>일몰</dt>
          <dd>{day.sunset}</dd>
        </div>
      </dl>
      <ul className="tips">
        {getSafetyTips(day).map((tip) => (
          <li key={tip.text} className={`tip ${tip.type}`}>
            {tip.text}
          </li>
        ))}
      </ul>
    </>
  );
}
