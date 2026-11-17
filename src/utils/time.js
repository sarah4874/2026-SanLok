// 날짜·시간 계산 도우미

// Date → "2026-11-16" (한국 시간 기준)
export function toDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(dateString, days) {
  const d = new Date(dateString + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

// "2026-11-16" → "11월 16일 (월)"
export function formatDate(dateString) {
  const d = new Date(dateString + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export function formatFullDate(dateString) {
  const d = new Date(dateString + "T00:00:00");
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

// "08:30" → 510(분)
export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// 510 → "08:30"
export function fromMinutes(total) {
  const t = ((Math.round(total) % 1440) + 1440) % 1440;
  const h = Math.floor(t / 60);
  const m = t % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// 95 → "1시간 35분"
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

// 높이로 대략적인 산행 시간 추정 (휴식 제외)
// 실제 코스마다 다르니 플래너에서 직접 고칠 수 있게 합니다.
export function estimateHikeMinutes(height) {
  const up = Math.round((height * 0.15 + 30) / 10) * 10;
  const down = Math.round((up * 0.7) / 10) * 10;
  return { up, down };
}
