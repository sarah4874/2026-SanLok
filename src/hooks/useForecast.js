import { useEffect, useState } from "react";
import { fetchForecast } from "../utils/weather";

// 산 하나의 16일 일별 예보를 불러오는 훅
// retry()를 부르면 다시 불러옵니다.
export default function useForecast(mountain) {
  const [state, setState] = useState({ status: "idle", days: [], error: null, key: null });
  const [attempt, setAttempt] = useState(0);
  const key = mountain ? `${mountain.id}-${attempt}` : null;

  useEffect(() => {
    if (!mountain) return;
    let cancelled = false;
    const currentKey = `${mountain.id}-${attempt}`;

    fetchForecast(mountain)
      .then((days) => {
        if (!cancelled) setState({ status: "done", days, error: null, key: currentKey });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", days: [], error: err.message, key: currentKey });
      });

    return () => {
      cancelled = true;
    };
  }, [mountain, attempt]);

  const retry = () => setAttempt((n) => n + 1);

  // 산을 바꾸거나 다시 시도하는 중에는 로딩으로 처리
  if (!mountain) return { status: "idle", days: [], error: null, retry };
  if (state.key !== key) return { status: "loading", days: [], error: null, retry };
  return { ...state, retry };
}
