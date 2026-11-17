import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import OnboardingPage from "./pages/OnboardingPage";
import AuthPage from "./pages/AuthPage";
import MainPage from "./pages/MainPage";
import MountainListPage from "./pages/MountainListPage";
import MountainDetailPage from "./pages/MountainDetailPage";
import PlannerPage from "./pages/PlannerPage";
import MyPage from "./pages/MyPage";
import NotFoundPage from "./pages/NotFoundPage";
import "./App.css";

// 페이지를 옮기면 맨 위로 스크롤
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        {/* 모든 페이지 위에 고정되는 상단 바 (온보딩 화면에서는 숨김) */}
        <Navbar />

        {/* URL에 따라 바뀌는 본문 */}
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/home" element={<MainPage />} />
          <Route path="/mountains" element={<MountainListPage />} />
          <Route path="/mountains/:id" element={<MountainDetailPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/dashboard" element={<Navigate to="/mountains" replace />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <footer className="footer">
          산록(山麓) · 산을 기록하다 · 날씨 정보{" "}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>
        </footer>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
