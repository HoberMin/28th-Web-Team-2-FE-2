"use client";

import { useEffect, useState } from "react";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ActionButton } from "seed-design/ui/action-button";
import { ButtonChip, ChipLabel } from "seed-design/ui/chip";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetRoot,
  BottomSheetTrigger,
} from "seed-design/ui/bottom-sheet";
import { useCurrentCoords, useCurrentDistrict } from "../_lib/location";
import { getNearbyStores, type NearbyStore } from "../_lib/nearby-stores";

// 제보 폼 안의 가게 위치 선택 drawer(구 F04-1 페이지를 흡수) — 근처 가게 목록 + 직접 입력.
// 시트에서 고른 값이 폼의 유일한 위치 값이 된다(자유 편집 금지 — 오타로 같은 가게가
// 갈라지면 가게 탭·가게 상세의 "한 가게 × 여러 품목" 집계가 깨진다).
export function LocationPickerSheet({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (place: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { district, loading } = useCurrentDistrict();
  const coords = useCurrentCoords();
  const [manualMode, setManualMode] = useState(false);
  const [manualPlace, setManualPlace] = useState("");

  // 조회 결과를 "어떤 조건으로 받은 것인지"(queryKey)와 함께 담는다.
  // 조건이 바뀌면 effect에서 setStores(null)로 초기화하는 대신 **파생으로** null이 되게 하려는 것 —
  // effect 안의 동기 setState는 연쇄 렌더를 만든다(react-hooks 규칙). 비동기 then의 setState는 문제없다.
  const [result, setResult] = useState<{ key: string; list: NearbyStore[] } | null>(null);
  const queryKey = `${district}|${coords.lat}|${coords.lng}`;
  const stores = result?.key === queryKey ? result.list : null;

  useEffect(() => {
    if (!open || loading) return;
    let cancelled = false;
    void getNearbyStores(coords, district).then((list) => {
      if (!cancelled) setResult({ key: queryKey, list });
    });
    return () => {
      cancelled = true;
    };
    // coords는 위치가 갱신될 때만 바뀌는 원시값이라 lat·lng로 의존성을 좁힌다(queryKey가 이를 대표한다).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading, district, coords.lat, coords.lng]);

  function choose(place: string) {
    onSelect(place);
    setManualMode(false);
    setManualPlace("");
    setOpen(false);
  }

  const label = value ? `📍 ${value}` : loading ? "위치 확인 중…" : "위치 선택";

  return (
    <BottomSheetRoot open={open} onOpenChange={setOpen}>
      <BottomSheetTrigger asChild>
        <ButtonChip type="button" variant={value ? "solid" : "outlineStrong"} size="medium">
          <ChipLabel>{label}</ChipLabel>
        </ButtonChip>
      </BottomSheetTrigger>
      <BottomSheetContent title="어디서 보셨나요?">
        <BottomSheetBody className="flex flex-col gap-3 pb-2">
          <p className="text-body-14-regular text-content-secondary">
            {loading ? "위치 확인 중…" : `${district} 근처 청과·마트`}
          </p>

          <ul className="flex flex-col gap-2">
            {stores === null ? (
              <li className="py-8 text-center text-body-14-regular text-content-secondary">불러오는 중…</li>
            ) : stores.length === 0 ? (
              <li className="py-8 text-center text-body-14-regular text-content-secondary">
                근처에 등록된 가게가 없어요
              </li>
            ) : (
              stores.map((store) => (
                <li key={store.id}>
                  <button
                    type="button"
                    onClick={() => choose(store.name)}
                    className="flex w-full flex-col items-start gap-0.5 rounded-2xl bg-gray-100 px-4 py-3 text-left active:bg-gray-200"
                  >
                    <span className="text-body-16-semibold text-content-primary">{store.name}</span>
                    <span className="text-caption-12-regular text-content-secondary">
                      {store.category} · {store.distanceM}m
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>

          <button
            type="button"
            onClick={() => setManualMode((v) => !v)}
            className="w-full rounded-2xl border border-border-primary px-4 py-3 text-center text-body-14-medium text-content-secondary active:bg-gray-100"
          >
            {manualMode ? "목록에서 고를게요" : "목록에 없어요, 직접 입력할게요"}
          </button>

          {manualMode && (
            <div className="flex flex-col gap-3">
              <TextField label="가게 이름" value={manualPlace} onValueChange={(v) => setManualPlace(v.value)}>
                <TextFieldInput placeholder="예: 선릉시장 3번 가게" autoFocus />
              </TextField>
              <ActionButton
                type="button"
                variant="neutralSolid"
                size="large"
                className="w-full"
                disabled={!manualPlace.trim()}
                onClick={() => choose(manualPlace.trim())}
              >
                이 위치로 선택
              </ActionButton>
            </div>
          )}
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}
