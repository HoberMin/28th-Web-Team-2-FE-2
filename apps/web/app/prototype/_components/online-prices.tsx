"use client";

import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";
import type { OnlinePriceSet } from "../_lib/vegetables";
import { useReports } from "../_lib/reports-store";
import { useCurrentDistrict } from "../_lib/location";
import { formatNumber } from "../_lib/format";

/**
 * 채널별 검색 링크 — 항목을 눌렀을 때 실제로 그 몰에서 찾아볼 수 있게 한다.
 * 상품 단위 딥링크는 SKU가 계속 바뀌어 죽은 링크가 되므로 **품목 검색**으로 보낸다.
 * B마트는 웹 검색이 없어(앱 전용) 배민 홈으로 보낸다.
 */
const MALL_SEARCH: Record<string, (term: string) => string> = {
  컬리: (t) => `https://www.kurly.com/search?sword=${encodeURIComponent(t)}`,
  쿠팡: (t) => `https://www.coupang.com/np/search?q=${encodeURIComponent(t)}`,
  G마켓: (t) => `https://browse.gmarket.co.kr/search?keyword=${encodeURIComponent(t)}`,
  B마트: () => "https://www.baemin.com",
};

/** 목록에 없는 몰이 생겨도 링크가 죽지 않게 — 검색으로 폴백. */
function mallSearchUrl(mall: string, term: string): string {
  const build = MALL_SEARCH[mall];
  if (build) return build(term);
  return `https://search.naver.com/search.naver?query=${encodeURIComponent(term)}`;
}

/** 막대 길이 계산 — 0~100% 클램프(기준선이 온라인 최고가보다 훨씬 싸도 막대가 안 넘치게). */
function barWidthPct(price: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(2, (price / max) * 100));
}

// 온라인 판매가 — 가로 막대로 채널별 가격을 비교하고, 같은 축에 오프라인 기준선(동네 제보가
// 또는 오늘 시세)을 얹는다. 세로 리스트일 땐 온라인끼리만 비교돼 "동네가 싼가 온라인이 싼가"가
// 안 보였다(백로그 F03 #11). 여전히 **보조 기준**이라 헤딩 위계는 올리지 않는다.
export function OnlinePrices({
  set,
  unit,
  vegetableId,
  vegetableName,
  baselinePrice,
}: {
  set: OnlinePriceSet;
  unit: string;
  vegetableId: string;
  vegetableName: string;
  /** 오늘 시세(공공) — 동네 제보가 없을 때의 기준선 폴백 */
  baselinePrice: number;
}) {
  const { district } = useCurrentDistrict();
  const localReports = useReports({ vegetableId, district });
  const localPrice = localReports[0]?.pricePerKg ?? null;
  const referencePrice = localPrice ?? baselinePrice;
  const referenceLabel = localPrice ? "동네 제보가" : "오늘 시세";

  const { prices } = set;
  const maxPrice = Math.max(referencePrice, ...prices.map((p) => p.price));

  return (
    <section aria-label="온라인 판매가 비교" className="flex flex-col gap-3">
      <div className="flex items-baseline gap-1.5">
        <h3 className="text-body-16-semibold text-fg-neutral">온라인가 비교</h3>
        {set.hasEstimated && (
          <span className="text-caption-12-regular text-fg-neutral-muted">예시 데이터 포함</span>
        )}
      </div>

      {/* 기준선 — 오프라인 값(동네 제보가 우선, 없으면 오늘 시세) */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-caption-12-regular text-fg-neutral-muted">
          <span>{referenceLabel}(기준)</span>
          <span className="tabular-nums text-fg-neutral">
            {formatNumber(referencePrice)}원<span> /{unit}</span>
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-bg-neutral-weak">
          <div
            className="h-2.5 rounded-full bg-bg-brand-solid"
            style={{ width: `${barWidthPct(referencePrice, maxPrice)}%` }}
          />
        </div>
      </div>

      {/* 채널별 막대 — 성격 라벨(즉시배송 등)은 막대 아래 한 줄로. 라벨을 숨기고 금액만
          줄 세우면 "즉시배송이 제일 비싸다"는 당연한 결론만 반복돼 정보량이 0이 된다. */}
      <ul className="flex flex-col gap-3">
        {prices.map((p) => (
          <li key={p.mall}>
            <a
              href={mallSearchUrl(p.mall, vegetableName)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1 rounded-xl px-1 py-1 active:bg-bg-neutral-weak"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-body-14-medium text-fg-neutral">{p.mall}</span>
                <span className="flex shrink-0 items-center gap-1">
                  <span className="text-body-14-medium tabular-nums text-fg-neutral">
                    {formatNumber(p.price)}원
                  </span>
                  <IconChevronRightLine className="size-4 text-fg-neutral-muted" aria-hidden="true" />
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-bg-neutral-weak">
                <div
                  className="h-2.5 rounded-full bg-bg-neutral-weak-pressed"
                  style={{ width: `${barWidthPct(p.price, maxPrice)}%` }}
                />
              </div>
              <span className="truncate text-caption-12-regular text-fg-neutral-muted">
                {p.channel}
                {p.channelNote ? ` · ${p.channelNote}` : ""}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="text-caption-12-regular text-fg-neutral-muted">
        채널마다 배송 조건이 달라 단순 최저가 비교로는 판단이 어려워요. 오프라인 동네 가격이 기준이고
        온라인은 참고용입니다.
      </p>
    </section>
  );
}
