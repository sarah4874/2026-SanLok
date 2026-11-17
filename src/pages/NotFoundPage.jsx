import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="page">
      <div className="empty-box tall">
        <p className="big-emoji">🧭</p>
        <h1>길을 잃었어요</h1>
        <p className="muted">찾는 페이지가 없어요. 등산로를 다시 확인해 볼까요?</p>
        <Link to="/home" className="btn btn-primary">
          홈으로
        </Link>
      </div>
    </main>
  );
}
