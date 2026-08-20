"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/app/_lib/api/api-error";
import { clearTokens, getAccessToken } from "@/app/_lib/api/auth/session";
import { regionIdSchema } from "@/app/_lib/api/schemas/regions";
import { addUserRegion, setCurrentUserRegion } from "@/app/_lib/api/server/regions";
import { ROUTES } from "@/app/_lib/routes";

// "내 동네 관리"(F05 하위, Figma 시안 없음) 전용 Server Action. 이미 완성된 서버 fetch
// 함수(`server/regions.ts`)를 그대로 호출한다 — Route Handler(`app/api/regions/me*`)는
// 클라이언트 fetch 전용 경로라 여기서는 거치지 않는다. 에러 문구는 그 라우트의
// `_user-regions-error.ts`와 같은 톤으로 맞춘다.

export type RegionActionResult = { ok: true } | { ok: false; message: string };

async function requireToken(): Promise<string | RegionActionResult> {
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, message: "로그인이 필요해요." };
  }
  return token;
}

function isResult(value: string | RegionActionResult): value is RegionActionResult {
  return typeof value !== "string";
}

/**
 * Server Action은 클라이언트가 임의 인자로 직접 호출할 수 있는 **공개 진입점**이라,
 * 화면이 넘겨준 값이라고 믿지 않고 여기서 다시 검증한다.
 *
 * ⚠️ 특히 `setCurrentUserRegion`은 이 값을 Spring URL **경로에 문자열 보간**한다
 * (`/api/v1/users/me/regions/${regionId}/current`). 검증 없이 넘기면 `"../../../admin"`
 * 같은 값이 `new URL()`의 dot-segment 정규화로 `/api/v1/admin/current`가 되고,
 * `"x?evil=1"`은 쿼리스트링이 된다 — `springUrl`의 origin 검사는 same-origin이라 통과한다.
 * 같은 기능의 Route Handler(`app/api/regions/me/[regionId]/current/route.ts`)도 같은
 * 스키마로 막고 있다.
 */
function parseRegionId(regionId: string): string | null {
  const parsed = regionIdSchema.safeParse(regionId);
  return parsed.success ? parsed.data : null;
}

/** 현재 동네 전환. 이미 등록된 동네끼리만 전환하므로 성공하면 두 화면 모두 갱신한다. */
export async function switchCurrentRegionAction(regionId: string): Promise<RegionActionResult> {
  const token = await requireToken();
  if (isResult(token)) return token;

  const validRegionId = parseRegionId(regionId);
  if (!validRegionId) {
    return { ok: false, message: "법정동 코드가 올바르지 않아요." };
  }

  try {
    await setCurrentUserRegion({ regionId: validRegionId, token });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    console.error("현재 동네 전환 실패", {
      kind: error.kind,
      status: error.status,
      endpoint: error.endpoint,
    });
    if (error.isAuthExpired) {
      await clearTokens();
      return { ok: false, message: "로그인이 만료됐어요. 다시 로그인해 주세요." };
    }
    if (error.kind === "badRequest") {
      return { ok: false, message: "법정동 코드가 올바르지 않아요." };
    }
    if (error.kind === "notFound") {
      return { ok: false, message: "사용자를 찾을 수 없어요." };
    }
    return { ok: false, message: "동네를 전환하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  // 마이페이지 상단에도 현재 동네 이름이 보이므로 함께 무효화한다.
  revalidatePath(ROUTES.mypageRegions);
  revalidatePath(ROUTES.mypage);
  return { ok: true };
}

/**
 * 관심 지역 추가. 자동으로 현재 동네로 바꾸지 않는다 — 추가만 시도하고, 이미 등록된
 * 동네(409)는 에러로 던지지 않고 안내 문구로 부드럽게 돌려준다.
 */
export async function addRegionAction(regionId: string): Promise<RegionActionResult> {
  const token = await requireToken();
  if (isResult(token)) return token;

  const validRegionId = parseRegionId(regionId);
  if (!validRegionId) {
    return { ok: false, message: "동네 정보가 올바르지 않아요." };
  }

  try {
    await addUserRegion({ regionId: validRegionId, token });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    console.error("동네 추가 실패", {
      kind: error.kind,
      status: error.status,
      endpoint: error.endpoint,
    });
    if (error.isAuthExpired) {
      await clearTokens();
      return { ok: false, message: "로그인이 만료됐어요. 다시 로그인해 주세요." };
    }
    if (error.kind === "conflict") {
      return { ok: false, message: "이미 등록된 동네예요." };
    }
    if (error.kind === "badRequest") {
      return { ok: false, message: "동네 정보가 올바르지 않아요." };
    }
    return { ok: false, message: "동네를 추가하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  revalidatePath(ROUTES.mypageRegions);
  return { ok: true };
}
