import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// npm run dev 에서도 /api/course, /api/weather 가 동작하도록 api 폴더 파일을 개발 서버에 연결합니다.
// (배포된 Vercel에서는 api 폴더가 자동으로 서버리스 함수가 돼서 이 플러그인은 쓰이지 않아요)
function devApi(env) {
  return {
    name: "sanlok-dev-api",
    configureServer(server) {
      // /api/course → api/course.js, /api/weather → api/weather.js
      for (const name of ["course", "weather"]) {
        server.middlewares.use(`/api/${name}`, async (req, res) => {
          for (const key of ["GEMINI_API_KEY", "GEMINI_MODEL", "AI_BASE_URL", "AI_API_KEY", "AI_MODEL"]) {
            if (env[key]) process.env[key] = env[key];
          }
          try {
            const { default: handler } = await server.ssrLoadModule(`/api/${name}.js`);
            await handler(req, res);
          } catch (err) {
            console.error(err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "개발 서버 오류" }));
          }
        });
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // .env.local 에서 VITE_로 시작하지 않는 값도 읽을 수 있게 ""로 불러옴 (브라우저로는 안 나감)
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), devApi(env)],
  };
});
