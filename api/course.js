// Vercel 서버리스 함수: GET /api/course?id=100-46
// AI에게 산의 대표 등산 코스를 물어보고 JSON으로 돌려줍니다.
// API 키는 여기(서버)에서만 쓰기 때문에 브라우저에 노출되지 않아요.
//
// 두 가지 방식 중 하나를 쓸 수 있어요 (환경 변수로 선택)
//   1) Gemini:            GEMINI_API_KEY (+ 선택: GEMINI_MODEL)
//   2) OpenAI 호환 API:   AI_BASE_URL, AI_API_KEY, AI_MODEL
//      (학교 AI 플랫폼처럼 OpenAI 방식 /chat/completions 를 주는 곳)
//   AI_BASE_URL이 있으면 2번, 없으면 1번을 씁니다.
//
//   - 배포: Vercel 프로젝트 설정 → Environment Variables에 추가
//   - 내 컴퓨터: 프로젝트 폴더의 .env.local 파일에 추가
import { getMountain } from "../src/data/mountains.js";

// 모델 이름은 자주 바뀌어서 환경 변수(GEMINI_MODEL)로 바꿀 수 있게 했어요.
const DEFAULT_MODEL = "gemini-flash-latest";

// 같은 서버 인스턴스 안에서는 한 번 받은 결과를 다시 씀 (크레딧 절약)
const memoryCache = new Map();

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  // 성공한 응답은 Vercel CDN에 7일 동안 저장 → 같은 산을 여러 사람이 눌러도 Gemini는 한 번만 호출
  res.setHeader("Cache-Control", status === 200 ? "public, s-maxage=604800, stale-while-revalidate=86400" : "no-store");
  res.end(JSON.stringify(body));
}

function buildPrompt(m) {
  return `한국의 산 "${m.name}"(${m.location}, 해발 ${m.height}m)의 대표 등산 코스를 알려줘.

규칙:
- 실제로 많이 이용하는 코스만 알려줘. 확실하지 않은 코스는 지어내지 말고 빼.
- 아는 코스가 없으면 courses를 빈 배열로 두고 confidence를 "low"로 해.
- 시간은 보통 성인 기준, 휴식 시간을 뺀 분 단위 숫자로.
- 거리는 들머리에서 정상까지 편도 km.
- 과장하거나 감성적인 표현 없이 담백하게.
- 코스는 최대 3개.

아래 JSON 형식으로만 답해:
{
  "summary": "이 산에 대한 담백한 소개 1~2문장",
  "confidence": "high" | "medium" | "low",
  "courses": [
    {
      "name": "코스 이름",
      "start": "들머리(출발 지점) 이름",
      "distanceKm": 숫자,
      "upMinutes": 숫자,
      "downMinutes": 숫자,
      "difficulty": "쉬움" | "보통" | "어려움",
      "highlight": "코스 특징 한 줄",
      "caution": "주의할 점 한 줄"
    }
  ]
}`;
}

// Gemini 응답을 믿지 않고 값 하나하나 검사해서 정리
function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function sanitize(raw) {
  const courses = Array.isArray(raw?.courses) ? raw.courses : [];
  return {
    summary: cleanText(raw?.summary, 300),
    confidence: ["high", "medium", "low"].includes(raw?.confidence) ? raw.confidence : "low",
    courses: courses
      .map((c) => ({
        name: cleanText(c?.name, 60),
        start: cleanText(c?.start, 60),
        distanceKm: clampNumber(c?.distanceKm, 0.3, 40),
        upMinutes: clampNumber(c?.upMinutes, 10, 900),
        downMinutes: clampNumber(c?.downMinutes, 10, 900),
        difficulty: ["쉬움", "보통", "어려움"].includes(c?.difficulty) ? c.difficulty : "보통",
        highlight: cleanText(c?.highlight, 120),
        caution: cleanText(c?.caution, 120),
      }))
      .filter((c) => c.name && c.upMinutes && c.downMinutes)
      .map((c) => ({ ...c, upMinutes: Math.round(c.upMinutes), downMinutes: Math.round(c.downMinutes) }))
      .slice(0, 3),
  };
}

// 환경 변수를 보고 어떤 AI를 쓸지 정함
function getProvider() {
  const { AI_BASE_URL, AI_API_KEY, AI_MODEL, GEMINI_API_KEY, GEMINI_MODEL } = process.env;

  if (AI_BASE_URL && AI_API_KEY) {
    const model = AI_MODEL || "gpt-4o-mini";
    return {
      model,
      async ask(prompt) {
        // Mindlogic(FactChat/SnowChat) 게이트웨이는 주소 끝에 / 가 붙은 형태를 써요.
        const base = AI_BASE_URL.replace(/\/$/, "");
        const url = base.includes("mindlogic.ai") ? `${base}/chat/completions/` : `${base}/chat/completions`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${AI_API_KEY}` },
          body: JSON.stringify({
            model,
            temperature: 0.3,
            messages: [
              { role: "system", content: "너는 한국 등산 정보를 JSON으로만 답하는 도우미야." },
              { role: "user", content: prompt },
            ],
          }),
        });
        if (!response.ok) return { ok: false, status: response.status, detail: await response.text() };
        const data = await response.json();
        return { ok: true, text: data?.choices?.[0]?.message?.content || "" };
      },
    };
  }

  if (GEMINI_API_KEY) {
    const model = GEMINI_MODEL || DEFAULT_MODEL;
    return {
      model,
      async ask(prompt) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
            }),
          },
        );
        if (!response.ok) return { ok: false, status: response.status, detail: await response.text() };
        const data = await response.json();
        return { ok: true, text: (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("") };
      },
    };
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return send(res, 405, { error: "GET 요청만 받아요." });

  const id = new URL(req.url, "http://localhost").searchParams.get("id");
  const mountain = getMountain(id);
  if (!mountain) return send(res, 404, { error: "없는 산이에요." });

  const provider = getProvider();
  if (!provider) return send(res, 500, { error: "서버에 AI API 키가 설정되지 않았어요." });

  if (memoryCache.has(mountain.id)) return send(res, 200, memoryCache.get(mountain.id));

  try {
    const { ok, status, detail, text } = await provider.ask(buildPrompt(mountain));

    if (!ok) {
      console.error("AI 오류", status, detail.slice(0, 500));
      const message =
        status === 429
          ? "AI 사용량이 많아요. 잠시 후 다시 시도해 주세요."
          : status === 401 || status === 403
            ? "AI API 키가 올바르지 않아요."
            : status === 404
              ? `모델(${provider.model})을 찾을 수 없어요. 모델 이름을 확인해 주세요.`
              : "AI 응답을 받지 못했어요.";
      return send(res, 502, { error: message });
    }

    const jsonText = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const result = { mountainId: mountain.id, model: provider.model, ...sanitize(JSON.parse(jsonText)) };

    memoryCache.set(mountain.id, result);
    return send(res, 200, result);
  } catch (err) {
    console.error("AI 코스 처리 실패", err);
    return send(res, 502, { error: "AI 응답을 처리하지 못했어요. 다시 시도해 주세요." });
  }
}
