import { Link, useLocation } from "react-router-dom";

// 로그인이 필요한 기능 자리에 대신 보여주는 안내 박스
export default function RequireLogin({ title = "로그인이 필요해요", message }) {
  const location = useLocation();
  return (
    <div className="login-required">
      <div className="login-required-icon">🔒</div>
      <h2>{title}</h2>
      <p>{message || "산행 기록은 계정에 저장돼요. 로그인하고 나만의 산행을 기록해 보세요."}</p>
      <div className="button-row center">
        <Link to="/login" state={{ from: location.pathname + location.search }} className="btn btn-primary">
          로그인
        </Link>
        <Link to="/signup" state={{ from: location.pathname + location.search }} className="btn btn-ghost">
          회원가입
        </Link>
      </div>
    </div>
  );
}
