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
// 갈라지면 매장 탭·가게 상세의 "한 가게 × 여러 품목" 집계가 깨진다).
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
  const [stores, setStores] = useState<NearbyStore[] | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualPlace, setManualPlace] = useState("");

  useEffect(() => {
    if (!open || loading) return;
    let cancelled = false;
    setStores(null);
    void getNearbyStores(coords, district).then((list) => {
      if (!cancelled) setStores(list);
    });
    return () => {
      cancelled = true;
    };
    // coords는 위치가 갱신될 때만 바뀌는 원시값이라 lat·lng로 의존성을 좁힌다.
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
          <p className="text-body-14-regular text-fg-neutral-muted">
            {loading ? "위치 확인 중…" : `${district} 근처 청과·마트`}
          </p>

          <ul className="flex flex-col gap-2">
            {stores === null ? (
              <li className="py-8 text-center text-body-14-regular text-fg-neutral-muted">불러오는 중…</li>
            ) : stores.length === 0 ? (
              <li className="py-8 text-center text-body-14-regular text-fg-neutral-muted">
                근처에 등록된 가게가 없어요
              </li>
            ) : (
              stores.map((store) => (
                <li key={store.id}>
                  <button
                    type="button"
                    onClick={() => choose(store.name)}
                    className="flex w-full flex-col items-start gap-0.5 rounded-2xl bg-bg-neutral-weak px-4 py-3 text-left active:bg-bg-neutral-weak-pressed"
                  >
                    <span className="text-body-16-semibold text-fg-neutral">{store.name}</span>
                    <span className="text-caption-12-regular text-fg-neutral-muted">
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
            className="w-full rounded-2xl border border-bg-neutral-weak-pressed px-4 py-3 text-center text-body-14-medium text-fg-neutral-muted active:bg-bg-neutral-weak"
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
