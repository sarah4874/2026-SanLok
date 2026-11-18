// 날씨: Open-Meteo (https://open-meteo.com) — 무료, API 키 필요 없음

const WEATHER_CODES = {
  0: ["맑음"],
  1: ["대체로 맑음"],
  2: ["구름 조금"],
  3: ["흐림"],
  45: ["안개"],
  48: ["짙은 안개"],
  51: ["약한 이슬비"],
  53: ["이슬비"],
  55: ["강한 이슬비"],
  56: ["어는 이슬비"],
  57: ["어는 이슬비"],
  61: ["약한 비"],
  63: ["비"],
  65: ["강한 비"],
  66: ["어는 비"],
  67: ["어는 비"],
  71: ["약한 눈"],
  73: ["눈"],
  75: ["강한 눈"],
  77: ["싸락눈"],
  80: ["소나기"],
  81: ["소나기"],
  82: ["강한 소나기"],
  85: ["눈 소나기"],
  86: ["강한 눈 소나기"],
  95: ["뇌우"],
  96: ["뇌우·우박"],
  99: ["뇌우·우박"],
};

export function describeWeather(code) {
  const [text] = WEATHER_CODES[code] || ["정보 없음"];
  return { text };
}

// 날씨는 우리 서버(/api/weather)를 거쳐 받아 옵니다. (api/weather.js 참고)
// 한 번 받은 산은 30분 동안 브라우저에 저장해서, 새로고침해도 바로 보여요.
const CACHE_KEY = "sanlok_weather";
const CACHE_MINUTES = 30;
const TIMEOUT_MS = 10000;
const memory = new Map();

function readCache(id) {
  if (memory.has(id)) return memory.get(id);
  try {
    const item = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")[id];
    if (item && Date.now() - item.savedAt < CACHE_MINUTES * 60 * 1000) return item.days;
  } catch {
    // 저장된 값을 못 읽어도 새로 받으면 됨
  }
  return null;
}

function writeCache(id, days) {
  memory.set(id, days);
  try {
    const all = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    // 오래된 항목은 정리
    for (const key of Object.keys(all)) {
      if (Date.now() - all[key].savedAt > CACHE_MINUTES * 60 * 1000) delete all[key];
    }
    all[id] = { savedAt: Date.now(), days };
    localStorage.setItem(CACHE_KEY, JSON.stringify(all));
  } catch {
    // 저장 실패해도 화면은 동작
  }
}

// 같은 산을 동시에 여러 번 요청하면 하나로 합침
const pending = new Map();

export function fetchForecast(mountain) {
  const cached = readCache(mountain.id);
  if (cached) return Promise.resolve(cached);
  if (!pending.has(mountain.id)) {
    pending.set(
      mountain.id,
      requestForecast(mountain).finally(() => pending.delete(mountain.id)),
    );
  }
  return pending.get(mountain.id);
}

async function requestForecast(mountain) {
  // 10초 안에 응답이 없으면 포기 (무한정 기다리지 않게)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`/api/weather?id=${encodeURIComponent(mountain.id)}`, { signal: controller.signal });
  } catch {
    throw new Error("날씨 정보를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.");
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !Array.isArray(data.days)) {
    throw new Error(data.error || "날씨 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  writeCache(mountain.id, data.days);
  return data.days;
}

// 산행 안전 체크
export function getSafetyTips(day) {
  const tips = [];
  if (day.code >= 95) tips.push({ type: "danger", text: "뇌우 예보 — 산행을 미루는 게 좋아요." });
  if (day.rain >= 60) tips.push({ type: "warn", text: `강수 확률 ${day.rain}% — 우비와 방수 등산화를 챙기세요.` });
  if (day.wind >= 10) tips.push({ type: "warn", text: `최대 풍속 ${day.wind}m/s — 능선·정상에서 강풍 주의.` });
  if (day.min <= 0) tips.push({ type: "warn", text: `정상 최저 ${day.min}°C — 아이젠과 방한 장비가 필요해요.` });
  if (day.max >= 30) tips.push({ type: "warn", text: `최고 ${day.max}°C — 물을 넉넉히 챙기고 한낮 산행을 피하세요.` });
  if (tips.length === 0) tips.push({ type: "good", text: "산행하기 좋은 날씨예요." });
  return tips;
}
