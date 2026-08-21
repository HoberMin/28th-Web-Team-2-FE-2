import "server-only";

import { newsArticleSchema, type NewsArticle } from "../schemas/news";
import { getNews } from "./news";

/**
 * 백엔드 `/api/v1/news`가 아직 배포되지 않았거나(에러) 빈 목록만 줄 때(정상 200) F01 홈
 * 「최근 시세 뉴스」 화면 유지용으로만 쓰는 어댑터다. 실제 API가 안정되면 이 파일을 삭제하고
 * `getNews`를 직접 호출하면 된다. `stores-fallback.ts`/`reports-fallback.ts`와 같은 이유·같은
 * 구조 — 더미도 `newsArticleSchema`로 검증해 라이브 계약과 어긋나지 않게 한다.
 *
 * 더미 2건은 Figma `F01_홈` 개발 노트에 참고 링크로 박혀 있던 실제 기사다.
 *
 * TODO(✍️): 스펙 확정 시 교체 — Spring news API가 안정화되면 호출부의 fallback 분기를 제거한다.
 */
const TEMPORARY_NEWS: NewsArticle[] = [
  newsArticleSchema.parse({
    title: "양파 가격 폭락에 농가 울상...'상생' 할인 판매",
    originalUrl: "https://www.ytn.co.kr/_ln/0115_202608010201332426",
    publishedAt: "2026-08-01",
    thumbnailUrl: "https://image.ytn.co.kr/general/jpg/2026/0801/202608010201332426_t.jpg",
  }),
  newsArticleSchema.parse({
    title: "올해 보리 생산량 47.3% 증가…마늘·양파도 소폭 늘어",
    originalUrl: "https://www.newsis.com/view/NISX20260730_0003729538",
    publishedAt: "2026-07-30",
    thumbnailUrl: "https://img1.newsis.com/2025/05/08/NISI20250508_0020801708_web.jpg?rnd=20250508130110",
  }),
];
