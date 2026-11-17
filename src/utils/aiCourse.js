import { loadJSON, saveJSON } from "./storage";

// 서버(/api/course)에 AI 코스 추천을 요청합니다.
// 한 번 받은 산은 브라우저에 저장해 두고 다시 요청하지 않아요 (크레딧 절약).
const CACHE_KEY = "sanlok_ai_courses";
const CACHE_DAYS = 30;

export function getCachedCourses(mountainId) {
  const cache = loadJSON(CACHE_KEY, {});
  const item = cache[mountainId];
  if (!item) return null;
  const age = Date.now() - item.savedAt;
  return age < CACHE_DAYS * 24 * 60 * 60 * 1000 ? item.data : null;
}

export async function fetchAiCourses(mountainId) {
  const cached = getCachedCourses(mountainId);
  if (cached) return cached;

  let res;
  try {
    res = await fetch(`/api/course?id=${encodeURIComponent(mountainId)}`);
  } catch {
    throw new Error("서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "AI 코스를 불러오지 못했어요.");

  const cache = loadJSON(CACHE_KEY, {});
  saveJSON(CACHE_KEY, { ...cache, [mountainId]: { savedAt: Date.now(), data } });
  return data;
}
