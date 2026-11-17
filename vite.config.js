import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// npm run dev 에서도 /api/course 가 동작하도록, api/course.js 를 개발 서버에 연결합니다.
// (배포된 Vercel에서는 api 폴더가 자동으로 서버리스 함수가 돼서 이 플러그인은 쓰이지 않아요)
function devApi(env) {
  return {
    name: "sanlok-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/course", async (req, res) => {
        for (const name of ["GEMINI_API_KEY", "GEMINI_MODEL", "AI_BASE_URL", "AI_API_KEY", "AI_MODEL"]) {
          if (env[name]) process.env[name] = env[name];
        }
        try {
          const { default: handler } = await server.ssrLoadModule("/api/course.js");
          await handler(req, res);
        } catch (err) {
          console.error(err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "개발 서버 오류" }));
        }
      });
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
