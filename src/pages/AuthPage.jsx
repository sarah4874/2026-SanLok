import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

// mode: "login" | "signup"
export default function AuthPage({ mode }) {
  const { login, signup } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ email: "", nickname: "", password: "", passwordCheck: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignup) {
      if (form.nickname.trim().length < 2) return setError("닉네임은 2글자 이상이에요.");
      if (form.password.length < 6) return setError("비밀번호는 6자 이상으로 정해 주세요.");
      if (form.password !== form.passwordCheck) return setError("비밀번호가 서로 달라요.");
    }

    setIsSubmitting(true);
    const result = isSignup ? await signup(form) : await login(form);
    setIsSubmitting(false);

    if (!result.ok) return setError(result.message);

    // 레벨을 아직 안 골랐으면 온보딩으로
    if (!result.user.level) navigate("/", { replace: true });
    else navigate(from || "/home", { replace: true });
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{isSignup ? "회원가입" : "로그인"}</h1>
        <p className="auth-sub">
          {isSignup ? "산행 계획과 완등 기록을 내 계정에 모아 보세요." : "다시 오신 걸 환영해요!"}
        </p>

        <label className="field">
          <span>이메일</span>
          <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
        </label>

        {isSignup && (
          <label className="field">
            <span>닉네임</span>
            <input name="nickname" value={form.nickname} onChange={handleChange} required maxLength={12} />
          </label>
        )}

        <label className="field">
          <span>비밀번호</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
        </label>

        {isSignup && (
          <label className="field">
            <span>비밀번호 확인</span>
            <input
              type="password"
              name="passwordCheck"
              value={form.passwordCheck}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </label>
        )}

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSignup ? "가입하기" : "로그인"}
        </button>

        <p className="auth-switch">
          {isSignup ? "이미 계정이 있나요? " : "처음 오셨나요? "}
          <Link to={isSignup ? "/login" : "/signup"} state={{ from }}>
            {isSignup ? "로그인" : "회원가입"}
          </Link>
        </p>
        <p className="auth-note">※ 데모 버전이라 계정 정보는 이 브라우저에만 저장돼요.</p>
      </form>
    </main>
  );
}
