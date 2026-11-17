import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { LEVELS, mountainList } from "../data/mountains";
import MountainCard from "../components/MountainCard";

export default function MountainListPage() {
  const { completions } = useApp();
  const [params, setParams] = useSearchParams();

  // 입력창 값은 화면 안(state)에서 바로 바꿔야 한글 조합(ㄴ→나→남)이 끊기지 않아요.
  // 주소(?q=설악)에는 입력을 멈추고 0.3초 뒤에 반영해서, 새로고침·공유해도 검색어가 유지돼요.
  const [query, setQuery] = useState(() => params.get("q") || "");
  const keyword = query.trim();

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams(keyword ? { q: keyword } : {}, { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword, setParams]);

  const handleSearch = (value) => setQuery(value);

  // 이름, 지역, 레벨 이름(등린이/중수/챌린저), 목록 이름(명산100+)으로 검색
  const filtered = mountainList.filter(
    (m) =>
      !keyword ||
      m.name.includes(keyword) ||
      m.location.includes(keyword) ||
      m.area.includes(keyword) ||
      m.level.includes(keyword) ||
      LEVELS[m.level].label.includes(keyword) ||
      m.seriesLabel.includes(keyword),
  );

  return (
    <main className="page">
      <h1 className="page-title">명산 찾기</h1>

      <input
        className="search-input"
        type="search"
        placeholder="산 이름이나 지역으로 검색 (예: 설악, 강원)"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        aria-label="명산 검색"
      />

      {filtered.length > 0 ? (
        <div className="card-grid three">
          {filtered.map((m) => (
            <MountainCard key={m.id} mountain={m} completed={!!completions[m.id]} />
          ))}
        </div>
      ) : (
        <div className="empty-box">
          <p>‘{keyword}’에 맞는 산이 없어요.</p>
          <button className="btn btn-ghost" onClick={() => handleSearch("")}>
            검색 지우기
          </button>
        </div>
      )}
    </main>
  );
}
