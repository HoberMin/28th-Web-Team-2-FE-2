"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { ActionButton } from "seed-design/ui/action-button";
import { AppBar, BottomBar, PhoneFrame, Scroll } from "../_lib/shell";
import { useCurrentDistrict } from "../_lib/location";
import { getNearbyStores, type NearbyStore } from "../_lib/nearby-stores";

// F04-1 가게 위치 선택 — GPS 반경 + Kakao 키워드 검색(청과·채소·과일) 더미.
// 목록에서 고르거나 없으면 직접 입력 → 제보 폼(F04-2)으로 place를 들고 이동.
export function ReportLocation({ item, method }: { item: string; method: string }) {
  const router = useRouter();
  const { district, loading } = useCurrentDistrict();
  const [stores, setStores] = useState<NearbyStore[] | null>(null);
  const [manualPlace, setManualPlace] = useState("");
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    void getNearbyStores(district).then((list) => {
      if (!cancelled) setStores(list);
    });
    return () => {
      cancelled = true;
    };
  }, [district, loading]);

  const backHref = `/prototype/price/${item}`;

  function goNext(place: string) {
    const query = new URLSearchParams({ item, method, place });
    const nextHref =
      method === "photo" ? `/prototype/capture?${query.toString()}` : `/prototype/report?${query.toString()}`;
    router.push(nextHref);
  }

  return (
    <PhoneFrame>
      <AppBar title="어디서 보셨나요?" backHref={backHref} />
      <Scroll className="px-4 pb-6">
        <p className="pt-1 text-body-14-regular text-fg-neutral-subtle">
          {loading ? "위치 확인 중…" : `${district} 근처 청과·마트`}
        </p>

        {!manualMode && (
          <ul className="mt-3 flex flex-col gap-2">
            {stores === null ? (
              <li className="py-12 text-center text-body-14-regular text-fg-neutral-subtle">불러오는 중…</li>
            ) : stores.length === 0 ? (
              <li className="py-12 text-center text-body-14-regular text-fg-neutral-subtle">
                근처에 등록된 가게가 없어요
              </li>
            ) : (
              stores.map((store) => (
                <li key={store.id}>
                  <button
                    type="button"
                    onClick={() => goNext(store.name)}
                    className="flex w-full flex-col items-start gap-0.5 rounded-2xl bg-bg-neutral-weak px-4 py-3 text-left active:bg-bg-neutral-weak-pressed"
                  >
                    <span className="text-body-16-semibold text-fg-neutral">{store.name}</span>
                    <span className="text-caption-12-regular text-fg-neutral-subtle">
                      {store.category} · {store.distanceM}m
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setManualMode((v) => !v)}
          className="mt-4 w-full rounded-2xl border border-bg-neutral-weak-pressed px-4 py-3 text-center text-body-14-medium text-fg-neutral-subtle active:bg-bg-neutral-weak"
        >
          목록에 없어요, 직접 입력할게요
        </button>

        {manualMode && (
          <div className="mt-4">
            <TextField label="가게 이름" value={manualPlace} onValueChange={(v) => setManualPlace(v.value)}>
              <TextFieldInput placeholder="예: 선릉시장 3번 가게" autoFocus />
            </TextField>
          </div>
        )}
      </Scroll>

      {manualMode && (
        <BottomBar>
          <ActionButton
            type="button"
            variant="neutralSolid"
            size="large"
            className="w-full"
            disabled={!manualPlace.trim()}
            onClick={() => goNext(manualPlace.trim())}
          >
            확인
          </ActionButton>
        </BottomBar>
      )}
    </PhoneFrame>
  );
}
