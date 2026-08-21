import "server-only";

import { regionLowestPricesSchema, type RegionLowestPrices } from "../schemas/reports";
import { getRegionLowestPrices } from "./reports";
import { DEFAULT_DISTRICT, VEGETABLES, getBaselineDummy } from "../../vegetables";
import { getFallbackNearbyStores } from "../../nearby-stores";
import { hasDedicatedVegetableIcon } from "../../vegetable-images";

/**
 * 전용 벡터가 있는 품목을 앞으로 오게 정렬한 카탈로그 — 홈 화면 더미 생성기가 이 순서로
 * 앞에서부터 골라야 아이콘이 안 맞는 품목(예: 생강 → 당근 아이콘)이 먼저 뽑히지 않는다.
 */
const VEGETABLES_ICON_FIRST = [...VEGETABLES].sort(
  (left, right) => Number(hasDedicatedVegetableIcon(right.id)) - Number(hasDedicatedVegetableIcon(left.id)),
);

/**
 * 백엔드 `/api/v1/regions/{id}/reports/lowest-prices`가 아직 배포되지 않았거나(에러) DB에
 * 제보 row가 없어 빈 목록만 줄 때(정상 200) F01 홈 「동네 최저가」 화면 유지용으로만 쓰는
 * 어댑터다. 실제 API가 안정되면 이 파일을 삭제하고 `getRegionLowestPrices`를 직접 호출하면
 * 된다. 임시 응답도 `regionLowestPricesSchema`로 검증해 라이브 계약과 어긋나지 않게 한다.
 *
 * `priceDiffRate`는 퍼센트다. -8은 -8%를 뜻하며, 비율인 -0.08을 넣지 않는다.
 * TODO(✍️): 스펙 확정 시 교체 — Spring reports API가 안정화되면 호출부의 fallback 분기를 제거한다.
 */

function buildTemporaryRegionLowestPrices(limit: number): RegionLowestPrices {
  const dummies = getFallbackNearbyStores(DEFAULT_DISTRICT);
  const sample = VEGETABLES_ICON_FIRST.slice(0, limit);
  const items = sample.map((vegetable, index) => {
    const baseline = getBaselineDummy(vegetable.id);
    const diff = -Math.round(baseline.current * 0.08);
    const store = dummies[index % dummies.length];
    return {
      rank: index + 1,
      reportId: index + 1,
      itemId: index + 1,
      itemName: vegetable.name,
      itemImageUrl: null,
      storeId: null,
      storeName: store?.name ?? null,
      price: baseline.current + diff,
      unit: vegetable.unit,
      priceDiffRate: baseline.current === 0 ? 0 : (diff / baseline.current) * 100,
    };
  });

  return regionLowestPricesSchema.parse({ regionName: null, items });
}

export function isTemporaryReportsDataError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("kind" in error)) return false;
  const kind = Reflect.get(error, "kind");
  return kind === "network" || kind === "upstream" || kind === "server" || kind === "parse" || kind === "notFound";
}

/**
 * DB에 아직 제보 row가 없으면 Spring이 정상 200으로 **빈 목록**을 준다 — 에러가 아니라서
 * `isTemporaryReportsDataError`로는 못 잡는다. 그래서 성공 응답이라도 `items`가 비어 있으면
 * 같은 더미로 폴백한다.
 */
export async function getRegionLowestPricesWithTemporaryFallback(
  params: Parameters<typeof getRegionLowestPrices>[0],
): Promise<{ prices: RegionLowestPrices; isTemporary: boolean }> {
  const limit = params.limit ?? 10;
  try {
    const prices = await getRegionLowestPrices(params);
    if (prices.items.length > 0) return { prices, isTemporary: false };
    console.warn("[reports] region-lowest-prices temporary data fallback (empty upstream result)", {
      regionId: params.regionId,
    });
    return { prices: buildTemporaryRegionLowestPrices(limit), isTemporary: true };
  } catch (error) {
    if (!isTemporaryReportsDataError(error)) throw error;
    console.warn("[reports] region-lowest-prices temporary data fallback", {
      regionId: params.regionId,
      endpoint: error && typeof error === "object" ? Reflect.get(error, "endpoint") : undefined,
    });
    return { prices: buildTemporaryRegionLowestPrices(limit), isTemporary: true };
  }
}
