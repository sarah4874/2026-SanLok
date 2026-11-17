// 날씨: Open-Meteo (https://open-meteo.com) — 무료, API 키 필요 없음
// elevation에 산 높이를 넣으면 정상 높이 기준 기온으로 보정해 줍니다.

const WEATHER_CODES = {
  0: ["맑음", "☀️"],
  1: ["대체로 맑음", "🌤️"],
  2: ["구름 조금", "⛅"],
  3: ["흐림", "☁️"],
  45: ["안개", "🌫️"],
  48: ["짙은 안개", "🌫️"],
  51: ["약한 이슬비", "🌦️"],
  53: ["이슬비", "🌦️"],
  55: ["강한 이슬비", "🌧️"],
  56: ["어는 이슬비", "🌧️"],
  57: ["어는 이슬비", "🌧️"],
  61: ["약한 비", "🌦️"],
  63: ["비", "🌧️"],
  65: ["강한 비", "🌧️"],
  66: ["어는 비", "🌧️"],
  67: ["어는 비", "🌧️"],
  71: ["약한 눈", "🌨️"],
  73: ["눈", "🌨️"],
  75: ["강한 눈", "❄️"],
  77: ["싸락눈", "🌨️"],
  80: ["소나기", "🌦️"],
  81: ["소나기", "🌧️"],
  82: ["강한 소나기", "⛈️"],
  85: ["눈 소나기", "🌨️"],
  86: ["강한 눈 소나기", "❄️"],
  95: ["뇌우", "⛈️"],
  96: ["뇌우·우박", "⛈️"],
  99: ["뇌우·우박", "⛈️"],
};

export function describeWeather(code) {
  const [text, icon] = WEATHER_CODES[code] || ["정보 없음", "❔"];
  return { text, icon };
}

const cache = new Map();

export async function fetchForecast(mountain) {
  const key = mountain.id;
  if (cache.has(key)) return cache.get(key);

  const params = new URLSearchParams({
    latitude: mountain.lat,
    longitude: mountain.lng,
    elevation: mountain.height,
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset",
    wind_speed_unit: "ms",
    timezone: "Asia/Seoul",
    forecast_days: "16",
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error("날씨 정보를 불러오지 못했어요.");
  const json = await res.json();
  const d = json.daily;

  const days = d.time.map((date, i) => ({
    date,
    code: d.weather_code[i],
    max: Math.round(d.temperature_2m_max[i]),
    min: Math.round(d.temperature_2m_min[i]),
    rain: d.precipitation_probability_max[i] ?? 0,
    wind: Math.round(d.wind_speed_10m_max[i] * 10) / 10,
    sunrise: d.sunrise[i].slice(11, 16),
    sunset: d.sunset[i].slice(11, 16),
  }));

  cache.set(key, days);
  return days;
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
