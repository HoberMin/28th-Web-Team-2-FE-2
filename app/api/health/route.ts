// BFF Route Handler 예시 — 캐싱 의도는 라우트마다 항상 명시한다 (conventions #11)
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok", service: "web-2-fe-2 bff" });
}
