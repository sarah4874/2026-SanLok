function MainPage() {
  return (
    <main className="main-page">
      <section className="top-area">
        <div className="dashboard">
          <h2>내가 다녀온 산</h2>
          <p>완등한 산 0 / 100</p>
        </div>

        <div className="intro">
          <h1>나만의 페이스로 정복하는 100대 명산</h1>
          <p>내 수준에 맞는 산을 찾고 산행을 기록해 보세요.</p>
        </div>
      </section>

      <section className="mountain-section">
        <h2>블랙야크 100대 명산</h2>

        <div className="mountain-list">
          <div className="mountain-card">산 카드가 들어갈 자리</div>
        </div>
      </section>
    </main>
  );
}

export default MainPage;