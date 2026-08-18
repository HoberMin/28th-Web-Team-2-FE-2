// F02 야채 시세 화면의 URL 쿼리 계약.
//
// 검색어·카테고리·정렬은 별도 라우트가 아니라 **같은 화면의 상태**이고, 그 상태를 URL 쿼리에 둔다.
// 그래야 목록을 서버(RSC)에서 완성해 내려줄 수 있고, 뒤로가기·공유·새로고침에도 화면이 유지된다.
//
// 이 모듈은 클라이언트 컴포넌트에도 import되므로 **순수 문자열 조작만** 둔다
// (야채 카탈로그 같은 데이터 모듈을 여기서 끌어오면 46종이 통째로 클라 번들에 실린다).

import { ROUTES } from "../../_lib/routes";

export interface PricesQuery {
  /** 검색어. 빈 문자열이면 쿼리에서 뺀다. */
  q?: string;
  /** 카테고리(야채 그룹). 없으면 전체. */
  group?: string;
  /** 정렬 키. 기본값이면 쿼리에서 뺀다. */
  sort?: string;
  /** 사용자에게 보이는 1-based 페이지. 첫 페이지면 쿼리에서 뺀다. */
  page?: number;
}

/** 빈 값·기본값은 URL에 남기지 않는다 — 주소가 짧아야 공유·비교가 쉽다. */
export function buildPricesHref({ q, group, sort, page }: PricesQuery): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (group) params.set("group", group);
  if (sort) params.set("sort", sort);
  if (page && page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `${ROUTES.prices}?${search}` : ROUTES.prices;
}
