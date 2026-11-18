// Vercel 서버리스 함수: GET /api/weather?id=100-46
// 브라우저 대신 서버가 Open-Meteo에서 날씨를 받아 와서 돌려줍니다.
//   - 사용자 네트워크에서 Open-Meteo 연결이 끊기는 문제를 피할 수 있어요.
//   - 응답을 Vercel CDN에 30분 저장해서, 같은 산은 누가 열든 바로 떠요.
import { getMountain } from "../src/data/mountains.js";

const TIMEOUT_MS = 4000; // 한 번 요청에 최대 4초 (두 번 시도해도 브라우저 제한 10초 안에 답함)

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", status === 200 ? "public, s-maxage=1800, stale-while-revalidate=3600" : "no-store");
  res.end(JSON.stringify(body));
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") return send(res, 405, { error: "GET 요청만 받아요." });

  const id = new URL(req.url, "http://localhost").searchParams.get("id");
  const mountain = getMountain(id);
  if (!mountain) return send(res, 404, { error: "없는 산이에요." });

  const params = new URLSearchParams({
    latitude: mountain.lat,
    longitude: mountain.lng,
    elevation: mountain.height, // 정상 높이 기준 기온으로 보정
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset",
    wind_speed_unit: "ms",
    timezone: "Asia/Seoul",
    forecast_days: "16",
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params}`;

  // 실패하면 한 번만 더 시도
  let json;
  for (let attempt = 0; attempt < 2 && !json; attempt++) {
    try {
      json = await fetchWithTimeout(url);
    } catch (err) {
      console.error("Open-Meteo 실패", attempt + 1, err.message);
    }
  }
  if (!json?.daily) return send(res, 502, { error: "날씨 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요." });

  const d = json.daily;
  // 예보 마지막 날은 값이 비어(null) 있을 때가 있어서 빼고 씁니다.
  const days = d.time
    .map((date, i) => ({
      date,
      code: d.weather_code[i],
      max: d.temperature_2m_max[i],
      min: d.temperature_2m_min[i],
      rain: d.precipitation_probability_max[i] ?? 0,
      wind: d.wind_speed_10m_max[i],
      sunrise: d.sunrise[i]?.slice(11, 16),
      sunset: d.sunset[i]?.slice(11, 16),
    }))
    .filter((day) => day.max !== null && day.min !== null && day.wind !== null && day.code !== null)
    .map((day) => ({
      ...day,
      max: Math.round(day.max),
      min: Math.round(day.min),
      wind: Math.round(day.wind * 10) / 10,
    }));

  return send(res, 200, { mountainId: mountain.id, days });
}
