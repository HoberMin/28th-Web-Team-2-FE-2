"use client";

// 지역(동) 선택 UI — 온보딩(F00)·홈 위치 drawer(F01)·설정 동네 변경(F05)이 공유하는 조각.
// 검색(부분일치) + 「현재 위치로 찾기」 + "지금 있는 동네"(가까운 상위 4개) + 빈 결과.

import { type SVGProps, useEffect, useRef, useState } from "react";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import IconLocationpinLine from "@karrotmarket/react-monochrome-icon/IconLocationpinLine";
import { locateCurrentDistrict } from "../_lib/location";
import { regionsByProximity, searchRegions } from "../_lib/regions";
import { DEFAULT_DISTRICT } from "../_lib/vegetables";

// 검색 아이콘 — 디자이너 제공 에셋(public/veg/iconamoon_search.svg) 그대로 인라인.
function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M21 21L16.657 16.657M16.657 16.657C17.3998 15.9141 17.9891 15.0322 18.3912 14.0615C18.7932 13.0909 19.0002 12.0506 19.0002 11C19.0002 9.9494 18.7932 8.90908 18.3912 7.93845C17.9891 6.96782 17.3998 6.08589 16.657 5.343C15.9141 4.60011 15.0321 4.01082 14.0615 3.60877C13.0909 3.20673 12.0506 2.99979 11 2.99979C9.94936 2.99979 8.90905 3.20673 7.93842 3.60877C6.96779 4.01082 6.08585 4.60011 5.34296 5.343C3.84263 6.84333 2.99976 8.87821 2.99976 11C2.99976 13.1218 3.84263 15.1567 5.34296 16.657C6.84329 18.1573 8.87818 19.0002 11 19.0002C13.1217 19.0002 15.1566 18.1573 16.657 16.657Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type LocateStatus = "idle" | "locating" | "failed";

export function RegionPicker({
  onSelect,
  anchorDistrict,
  className,
}: {
  onSelect: (district: string) => void;
  /**
   * "지금 있는 동네" 추천 정렬 기준 — **알고 있는 실제 위치일 때만** 넘긴다(예: 이미 측위된
   * 홈 위치). 미지정이면 아직 위치를 모른다는 뜻으로 취급해 라벨이 달라진다("동네 추천").
   * 「현재 위치로 찾기」가 성공하면 그 동네를 곧바로 `onSelect`으로 넘긴다(앵커도 함께 갱신).
   */
  anchorDistrict?: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [locateStatus, setLocateStatus] = useState<LocateStatus>("idle");
  // 「현재 위치로 찾기」로 새로 알아낸 앵커 — 성공 즉시 선택하지 않고 근처 목록만 다시 정렬한다.
  const [locatedAnchor, setLocatedAnchor] = useState<string | null>(null);
  const scrollRef = useRef<HTMLUListElement>(null);

  // 검색어를 바꾸면 목록 스크롤을 맨 위로 — 안 되돌리면 새 결과가 중간부터 보인다.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [query]);

  const knownAnchor = locatedAnchor ?? anchorDistrict;
  // 실제 위치를 모르면(둘 다 없음) 표시상 DEFAULT_DISTRICT로 조용히 폴백하되, 라벨은
  // "지금 있는 동네"라고 오해하게 두지 않는다(아래 anchorKnown 분기).
  const searching = query.trim().length > 0;
  const regions = searching
    ? searchRegions(query)
    : regionsByProximity(knownAnchor ?? DEFAULT_DISTRICT, 4);

  async function handleLocate() {
    setLocateStatus("locating");
    const district = await locateCurrentDistrict();
    if (district) {
      // 찾은 동네를 곧바로 채택한다 — 버튼을 눌렀는데 목록만 다시 정렬되고 화면이 안 넘어가면
      // "왜 반응이 없지"로 읽힌다. 앵커도 같이 갱신해 뒤로 돌아왔을 때 목록이 맞게 남는다.
      setLocatedAnchor(district);
      setLocateStatus("idle");
      onSelect(district);
      return;
    }
    // 권한 거부·타임아웃·미지원 — 에러 화면을 띄우지 않고 검색 목록에 조용히 남는다.
    setLocateStatus("failed");
  }

  return (
    <div className={className}>
      {/* aria-live: 버튼 라벨·실패 안내 변화를 스크린리더가 즉시 읽도록(측위 중 → 완료/실패). */}
      <div aria-live="polite" aria-atomic="true">
        <button
          type="button"
          onClick={handleLocate}
          disabled={locateStatus === "locating"}
          className="flex h-12 w-full items-center gap-2 rounded-2xl bg-bg-neutral-weak px-4 text-left text-body-14-medium text-fg-neutral active:bg-bg-neutral-weak-pressed disabled:opacity-60"
        >
          <IconLocationpinLine className="size-5 text-fg-brand-contrast" aria-hidden="true" />
          {locateStatus === "locating" ? "위치 확인 중…" : "현재 위치로 찾기"}
        </button>
        {locateStatus === "failed" && (
          <p className="mt-1 px-1 text-caption-12-regular text-fg-neutral-muted">
            위치를 확인할 수 없어요. 아래에서 동네를 검색해 주세요
          </p>
        )}
      </div>

      <div className="mt-3">
        <TextField value={query} onValueChange={(v) => setQuery(v.value)} suffixIcon={<SearchIcon />}>
          <TextFieldInput placeholder="동 단위로 검색" aria-label="동 단위로 검색" />
        </TextField>
      </div>

      {!searching && (
        <p className="mt-6 text-body-14-regular text-fg-neutral-muted">
          {/* 위치를 실제로 알 때만 "지금 있는 동네"라고 말한다 — 모르면 DEFAULT_DISTRICT로
              조용히 폴백 중이라는 뜻이라 오해를 남기지 않게 다른 문구로 대체. */}
          {knownAnchor ? "지금 있는 동네" : "동네 추천"}
        </p>
      )}

      <ul ref={scrollRef} className="mt-2 flex flex-col">
        {regions.length === 0 ? (
          <li className="py-12 text-center text-body-14-regular text-fg-neutral-muted">
            검색 결과가 없어요
          </li>
        ) : (
          regions.map((region) => (
            <li key={region.id}>
              <button
                type="button"
                onClick={() => onSelect(region.label)}
                className="flex h-12 w-full items-center text-left active:bg-bg-neutral-weak"
              >
                <span className="text-body-16-regular text-fg-neutral">{region.label}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
