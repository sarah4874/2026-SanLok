import { useEffect, useState } from "react";
import { fetchForecast } from "../utils/weather";

// 산 하나의 16일 일별 예보를 불러오는 훅
export default function useForecast(mountain) {
  const [state, setState] = useState({ status: "idle", days: [], error: null, id: null });

  useEffect(() => {
    if (!mountain) return;
    let cancelled = false;

    fetchForecast(mountain)
      .then((days) => {
        if (!cancelled) setState({ status: "done", days, error: null, id: mountain.id });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", days: [], error: err.message, id: mountain.id });
      });

    return () => {
      cancelled = true;
    };
  }, [mountain]);

  // 산을 바꾼 직후에는 이전 산 데이터가 보이지 않도록 로딩으로 처리
  if (!mountain) return { status: "idle", days: [], error: null };
  if (state.id !== mountain.id) return { status: "loading", days: [], error: null };
  return state;
}
