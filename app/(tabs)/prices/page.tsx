import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GridVegetableItem } from "../../_components/grid-vegetable-item";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import { formatAsOfLabel } from "../../_lib/format";
import { ROUTES } from "../../_lib/routes";
import { VEGETABLE_GROUPS } from "../../_lib/vegetables";
import { PricesGroupChips } from "./_group-chips";
import {
  DEFAULT_PRICES_SORT,
  PRICES_SORT_OPTIONS,
  buildPriceRows,
  countByGroup,
  filterRows,
  getSortLabel,
  normalizeGroup,
  normalizeSort,
  sortRows,
} from "./_list";
import type { PriceRow, TrendState } from "./_list";
import { PricesSearchField } from "./_search-field";
import { PricesSortControl } from "./_sort-control";

// F02 야채 시세 — Figma `화면GUI` 298-3421(기본) · 298-3448(검색) · 298-3546(정렬시트),
// fileKey d5j7K9BNpSXxVUu3fmZfY4, 구현 2026-08-08.
//
// 세 프레임은 별도 화면이 아니라 **같은 화면의 상태**다. 검색어·카테고리·정렬을 URL 쿼리
// (`?q=&group=&sort=`)에 두어 목록을 서버(RSC)에서 완성한다. 입력·칩·시트만 클라이언트 leaf다.
//
// GNB(nav/gnb)는 여기서 그리지 않는다 — `app/(tabs)/layout.tsx`가 소유한다.
//
// 아이콘·사진은 전부 **Figma 원본 에셋**이다(`public/figma/design-library/`, 디자이너가 Figma
// Plugin API로 export해 레포에 전달). 이 화면이 한동안 들고 있던 임시 SVG 글리프 7종은 폐기했다.
// (그때 남긴 "에셋 다운로드가 정책상 차단돼 있다"는 서술은 사실이 아니었다 — `download_assets`
//  도구 자체는 정상이고, 그 도구가 돌려주는 figma.com URL을 받아오는 `curl` 경로가 deny에
//  걸리는 것이다. figma-bridge §0-0.)
//
// Figma 좌표 → 세로 리듬 (390×844 기준):
//   status bar 44 | 검색 필드 y=68 → pt-6 | 칩 행 y=136 → mt-4 | 정렬 행 y=182 → mt-2
//   | 그리드 y=228 → mt-2
//
// Figma와 다르게 한 것 (근거 있는 이탈만):
//   · **그리드 소수점을 박지 않는다.** Figma의 111.333px 카드 폭 / 123.333px 간격은
//     (358 - 24) ÷ 3의 자동 계산값이다. `grid-cols-3 gap-x-3`이면 390 화면에서 같은 결과가
//     나오고 소수점이 사라진다.
//     ⚠️ 다만 카드 내부는 `grid/vegetable-item`이 w-27.5(110 고정)를 들고 있어 3열 셀
//     (111.33px)보다 1.33px 좁다. 그 컴포넌트는 F04 찜 화면과 공유라 이번 작업에서 고치지
//     않았다 — 잔여 1.33px은 알고 남긴 값이다.
//   · **하단 pb-20.** Figma는 그리드(y=228+623=851)가 프레임 844를 넘어 마지막 행이 GNB 뒤로
//     86px 잘린다. 코드 레이아웃은 GNB가 본문을 덮지 않으므로(layout이 세로로 나눈다) 이
//     여백은 가림 보정이 아니라 스크롤 끝 숨통이다.
//   · **정렬 영역의 절대좌표를 버렸다.** Figma는 x=213 절대배치라 텍스트 우측 끝이 370에서
//     끝나 다른 섹션(374)과 4px 어긋난다. 컨테이너 px-4 안에서 우측 정렬로 잡았다.
//   · 카드는 아직 어디로도 링크되지 않는다 — 시세 상세 화면이 Figma 미확정이다.
//
// 찜 하트: 사진 위에 얹히는 자리라 그리드 전용 원본 2종(`icon/heart-stroke-grid-24` ·
//   `icon/heart-fill-grid-24`)을 쓴다. 흰 아웃라인 + drop shadow(찜 전), 빨강 #fd364d(찜 후)가
//   **원본 SVG에 이미 들어 있으므로 currentColor로 덮지 않는다** — 예전엔 currentColor 글리프를
//   넘겨 놓고 슬롯에 색 클래스가 없어 본문색(#171717)을 상속, 사진 위에서 검은 하트로 보였다.
//
// ⚠️ 상태 3종: 데이터가 동기 더미라 로딩·에러 경로가 없다. **빈 상태(검색 결과 없음)만**
//    구현했고, 시안이 없어 임시 구현이다(아래 EmptyResult 주석). 실 API가 붙으면 loading.tsx·
//    error.tsx가 함께 필요하다.
//
// ⚠️ 대비 (Figma 원본 유지 + 사실만 기록):
//    검색 placeholder 1.74:1 · 카드 단위 표기 1.92:1 · 등락 텍스트 3.95:1 (기준 4.5:1) 미달.
//    기준일·정렬 트리거의 content/secondary는 5.34:1로 통과.

export const metadata: Metadata = {
  title: "야채 시세",
};

/**
 * Figma가 등락 방향을 색(trend/down·up·flat)으로 구분하므로, 색 외 수단으로 아이콘을 함께 낸다.
 * 세 원본(`icon/trend-*` 477-9119~9121)은 색이 박힌 채 export돼 있어(down #217cf9 · up #ed2c42 ·
 * flat #b4bbcb = trend 토큰과 동일) currentColor로 덮지 않고 원본 색 그대로 쓴다.
 */
const TREND_ICON: Record<TrendState, ReactNode> = {
  down: <FigmaIcon name="trend-down" width={16} />,
  up: <FigmaIcon name="trend-up" width={16} />,
  flat: <FigmaIcon name="trend-flat" width={16} />,
};

const TREND_LABEL: Record<TrendState, string> = {
  down: "어제보다 내림",
  up: "어제보다 오름",
  flat: "어제와 같음",
};

/**
 * 카드 사진(110×110).
 *
 * 품목 일러스트가 있는 8종은 그걸 쓰고, 나머지는 Figma 카드 사진(`vegetable-grid.png`)으로 채운다.
 * 예전엔 이모지 + `text-6xl`(Figma 규격이 아닌 Tailwind 기본 스케일)로 때웠는데, Figma 원본이
 * 들어왔으므로 임의 표현을 버렸다.
 *
 * ⚠️ **`vegetable-grid.png`는 Figma 시안의 샘플 사진(오이)이다.** 시안(298-3421)이 모든 카드에
 *    같은 오이 사진을 깔아 둔 자리표시라 품목별 사진은 아직 없다 → 일러스트가 없는 품목은 이름과
 *    사진이 어긋난다. **품목별 사진 확보는 디자이너 확인 필요.**
 *
 * 품목명은 옆 텍스트가 담당하므로 사진은 장식(빈 alt)으로 둔다.
 */
function VegetableVisual({ row }: { row: PriceRow }) {
  if (row.image) {
    return (
      <Image
        src={row.image}
        alt=""
        width={110}
        height={110}
        className="size-full object-contain"
      />
    );
  }
  return (
    <FigmaImage
      name="vegetable-grid.png"
      width={110}
      height={110}
      className="size-full object-cover"
    />
  );
}

/**
 * 검색·필터 결과가 0건일 때. **Figma에 시안이 없어 임시 구현이다** — 문구·삽화·버튼 위계 전부
 * 디자이너 확정이 필요하다. 지금은 "왜 비었는지 + 어떻게 빠져나가는지"만 최소로 담는다.
 */
function EmptyResult({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <p className="text-body-16-semibold text-content-primary">찾는 야채가 없어요</p>
      <p className="text-body-14-regular text-content-secondary">
        {query ? `‘${query}’와 이름이 맞는 야채를 찾지 못했어요.` : "조건에 맞는 야채가 없어요."}
      </p>
      <Link
        href={ROUTES.prices}
        className="mt-2 inline-flex min-h-11 items-center justify-center rounded-lg bg-action-tertiary-default px-4 py-2 text-body-14-medium text-content-primary"
      >
        전체 야채 보기
      </Link>
    </div>
  );
}

/** searchParams 값은 문자열일 수도, 배열일 수도 있다. 첫 값만 쓴다. */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PricesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = (first(params.q) ?? "").trim();
  const group = normalizeGroup(first(params.group));
  const sort = normalizeSort(first(params.sort));

  const { rows, asOf } = buildPriceRows();
  const counts = countByGroup(rows);
  const visible = sortRows(filterRows(rows, { query, group }), sort);

  // 기본값은 URL에 남기지 않는다 — 링크를 만들 때 넘기는 값도 같은 규칙을 따른다.
  const sortParam = sort === DEFAULT_PRICES_SORT ? undefined : sort;

  return (
    <div className="pt-6 pb-20">
      <h1 className="sr-only">야채 시세</h1>

      <div className="px-4">
        <PricesSearchField query={query} group={group} sort={sortParam} />
      </div>

      <div className="mt-4">
        <PricesGroupChips
          groups={VEGETABLE_GROUPS}
          counts={counts}
          totalCount={rows.length}
          selected={group}
          query={query}
          sort={sortParam}
        />
      </div>

      <div className="mt-2 flex items-center justify-end gap-0.5 px-4">
        <div className="flex items-center gap-2">
          <span className="text-body-14-regular text-content-secondary">
            {formatAsOfLabel(asOf)}
          </span>
          <span aria-hidden="true" className="h-3.5 w-px shrink-0 bg-border-primary" />
        </div>
        <PricesSortControl
          options={PRICES_SORT_OPTIONS}
          value={sort}
          label={getSortLabel(sort)}
          query={query}
          group={group}
        />
      </div>

      <div className="mt-2 px-4">
        <p role="status" className="sr-only">
          야채 {visible.length}개
        </p>
        {visible.length === 0 ? (
          <EmptyResult query={query} />
        ) : (
          <ul className="grid grid-cols-3 gap-x-3 gap-y-10">
            {visible.map((row) => (
              <li key={row.id}>
                <GridVegetableItem
                  visual={<VegetableVisual row={row} />}
                  name={row.name}
                  price={row.price}
                  unit={row.unit}
                  trendAmount={row.trendAmount}
                  trendPercent={row.trendPercent}
                  trendState={row.trendState}
                  trendIcon={
                    <>
                      {TREND_ICON[row.trendState]}
                      <span className="sr-only">{TREND_LABEL[row.trendState]}</span>
                    </>
                  }
                  favorite={row.favorite}
                  favoriteIcon={
                    row.favorite ? (
                      <FigmaIcon name="heart-fill-grid-24" width={24} />
                    ) : (
                      <FigmaIcon name="heart-stroke-grid-24" width={24} />
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
