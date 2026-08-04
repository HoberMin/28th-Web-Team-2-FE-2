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

// 온라인 판매가 — 채널별 가격을 **싼 순 리스트**로 보여주고, 맨 위에 오프라인 기준선
// (동네 제보가 우선, 없으면 오늘 시세)을 한 줄로 얹는다. 줄을 누르면 그 몰의 검색 결과로 나간다.
//
// 2026-08-04: 가로 막대를 걷어냈다. 막대는 값의 비율을 보여주려던 장치인데, 이 자리에서
// 사용자가 하는 판단은 "동네보다 싼가"의 예/아니오 하나이고 그건 숫자 두 개를 나란히 두면 끝난다.
// 막대 때문에 한 줄이 3층(이름·막대·배송조건)으로 늘어 리스트가 화면 한 장을 넘겼다.
// 정렬도 싼 순으로 고정했다 — 목록의 목적이 "제일 싼 데가 어디냐"라서 그 답이 첫 줄에 와야 한다.
//
// 여전히 **보조 기준**이라 헤딩 위계는 올리지 않는다.
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

  // 싼 순 — 목록의 질문이 "제일 싼 데가 어디냐"라서 답이 첫 줄에 와야 한다.
  const prices = [...set.prices].sort((a, b) => a.price - b.price);

  return (
    <section aria-label="온라인 판매가 비교" className="flex flex-col gap-3">
      <div className="flex items-baseline gap-1.5">
        <h3 className="text-body-16-semibold text-fg-neutral">온라인가 비교</h3>
        {set.hasEstimated && (
          <span className="text-caption-12-regular text-fg-neutral-muted">예시 데이터 포함</span>
        )}
      </div>

      {/* 기준선 — 오프라인 값(동네 제보가 우선, 없으면 오늘 시세). 비교 대상이 무엇인지
          목록 위에 한 줄로 못 박아 둔다(막대 없이도 이 줄이 있으면 "동네보다 싼가"가 읽힌다). */}
      <div className="flex items-center justify-between rounded-xl bg-bg-neutral-weak px-3 py-2 text-caption-12-regular text-fg-neutral-muted">
        <span>{referenceLabel}(기준)</span>
        <span className="tabular-nums text-fg-neutral">
          {formatNumber(referencePrice)}원<span> /{unit}</span>
        </span>
      </div>

      {/* 채널별 리스트(싼 순) — 성격 라벨(즉시배송 등)은 가격 아래 한 줄로. 라벨을 숨기고 금액만
          줄 세우면 "즉시배송이 제일 비싸다"는 당연한 결론만 반복돼 정보량이 0이 된다.
          줄 전체가 링크라 어디를 눌러도 그 몰 검색 결과로 나간다. */}
      <ul className="flex flex-col">
        {prices.map((p) => {
          const cheaper = p.price < referencePrice;
          return (
            <li key={p.mall}>
              <a
                href={mallSearchUrl(p.mall, vegetableName)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border-b border-bg-neutral-weak py-3 last:border-b-0 active:bg-bg-neutral-weak"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body-14-medium text-fg-neutral">{p.mall}</span>
                  <span className="truncate text-caption-12-regular text-fg-neutral-muted">
                    {p.channel}
                    {p.channelNote ? ` · ${p.channelNote}` : ""}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  <span className="text-body-14-medium tabular-nums text-fg-neutral">
                    {formatNumber(p.price)}원
                  </span>
                  {/* 색만으로 싼/비싼을 나누지 않는다 — 문구도 같이 준다(WCAG 1.4.1) */}
                  <span
                    className={`text-caption-12-regular tabular-nums ${
                      cheaper ? "text-fg-positive" : "text-fg-neutral-muted"
                    }`}
                  >
                    {cheaper ? "기준보다 싸요" : "기준보다 비싸요"}
                  </span>
                </span>
                <span className="shrink-0 text-fg-neutral-muted [&_svg]:size-4" aria-hidden="true">
                  <IconChevronRightLine />
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <p className="text-caption-12-regular text-fg-neutral-muted">
        채널마다 배송 조건이 달라 단순 최저가 비교로는 판단이 어려워요. 오프라인 동네 가격이 기준이고
        온라인은 참고용입니다.
      </p>
    </section>
  );
}
