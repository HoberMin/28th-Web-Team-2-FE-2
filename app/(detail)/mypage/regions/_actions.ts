"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/app/_lib/api/api-error";
import { clearTokens, getAccessToken } from "@/app/_lib/api/auth/session";
import { regionSchema, type Region } from "@/app/_lib/api/schemas/regions";
import { ensureCurrentUserRegion } from "@/app/_lib/api/server/regions";
import {
  resolveSelectedRegionCoordinates,
  saveSelectedRegion,
} from "@/app/_lib/api/server/selected-region";
import { ROUTES } from "@/app/_lib/routes";

// "내 동네 관리"(F05 하위, Figma 시안 없음) 전용 Server Action.
//
// 2026-08-22 전환: 동네를 **여러 개 등록해 전환하는** 화면이었는데, 현재 위치 기반 하나만
// 쓰도록 정리했다(사용자 결정). 그래서 목록·추가·전환 액션이 사라지고 "현재 위치로 다시
// 설정" 하나만 남는다.
//
// ⚠️ Spring의 "현재 관심 지역"(`isCurrent`)과 홈·시세·가게 화면이 실제로 읽는 "선택 지역"
// (`mg_region_*` 쿠키, `selected-region.ts`)은 서로 다른 상태다 — 둘을 같이 갱신하지 않으면
// 한쪽만 바뀐다. 온보딩 지역 단계도 같은 두 벌을 쓴다(`client/regions.ts`).

export type RegionActionResult = { ok: true } | { ok: false; message: string };

/**
 * 현재 위치로 찾은 동네를 선택 지역으로 확정한다.
 *
 * Server Action은 클라이언트가 임의 인자로 직접 호출할 수 있는 **공개 진입점**이라, 화면이
 * 넘겨준 값이라고 믿지 않고 여기서 스키마로 다시 검증한다(`regionId`는 Spring URL 경로에
 * 문자열 보간되므로 특히 중요하다 — `server/regions.ts` 참고).
 */
export async function resetCurrentRegionAction(region: Region): Promise<RegionActionResult> {
  const parsed = regionSchema.safeParse(region);
  if (!parsed.success) {
    return { ok: false, message: "동네 정보가 올바르지 않아요." };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, message: "로그인이 필요해요." };
  }

  // 화면이 실제로 읽는 쿠키를 먼저 맞춘다 — 이게 성공해야 사용자 눈에 보이는 변화가 생긴다.
  try {
    const located = await resolveSelectedRegionCoordinates(parsed.data);
    if (!located) {
      return { ok: false, message: "동네 좌표를 확인하지 못했어요. 잠시 후 다시 시도해 주세요." };
    }
    await saveSelectedRegion(located);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    console.error("선택 지역 쿠키 갱신 실패", { kind: error.kind, status: error.status });
    return { ok: false, message: "동네를 저장하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  // 계정 쪽 관심 지역 동기화는 실패해도 화면 변경을 되돌리지 않는다 — 쿠키만으로 앱은 이미
  // 정상 동작하고, 제보처럼 계정 데이터가 필요한 흐름은 그 직전에 다시 맞춘다
  // (`ensureCurrentUserRegion`의 원래 호출부).
  try {
    await ensureCurrentUserRegion({ regionId: parsed.data.regionId, token });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    console.error("관심 지역 동기화 실패", {
      kind: error.kind,
      status: error.status,
      endpoint: error.endpoint,
    });
    if (error.isAuthExpired) {
      await clearTokens();
      return { ok: false, message: "로그인이 만료됐어요. 다시 로그인해 주세요." };
    }
  }

  // 선택 지역을 읽는 화면 전부가 갱신 대상이다.
  revalidatePath(ROUTES.mypageRegions);
  revalidatePath(ROUTES.mypage);
  revalidatePath(ROUTES.home);
  return { ok: true };
}
