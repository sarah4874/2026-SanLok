import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import OnboardingPage from "./pages/OnboardingPage";
import MainPage from "./pages/MainPage";
import MountainListPage from "./pages/MountainListPage";
import PlannerPage from "./pages/PlannerPage";
import MyPage from "./pages/MyPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      {/* 모든 페이지 위에 항상 고정되는 상단 바 */}
      <Navbar />

      {/* URL에 따라 변경되는 본문 화면 영역 */}
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/home" element={<MainPage />} />
        <Route path="/mountains" element={<MountainListPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;