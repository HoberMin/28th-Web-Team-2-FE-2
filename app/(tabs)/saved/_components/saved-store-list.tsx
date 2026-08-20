"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateStoreFavorite } from "@/app/_lib/api/actions/store-favorite";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "@/app/_lib/routes";
import type { SavedStoreView } from "../_saved-store-view";
import { RowSavedStore } from "./row-saved-store";

// F04 「가게」 탭 목록. 행 자체는 서버에서 그려도 되지만 **하트가 단골 해제 버튼**이라
// 이 목록만 클라이언트다(conventions #10 — 지시어는 인터랙션이 있는 leaf에).
//
// 해제는 낙관적으로 목록에서 먼저 빼고(`removed`), 실패하면 되돌린다. 성공 뒤 refresh로
// 서버 목록과 다시 맞춘다 — 단골 응답은 전부 no-store라 항상 최신을 받는다.

interface SavedStoreListProps {
  stores: SavedStoreView[];
}

function StoreThumbnail({ imageUrl, name }: { imageUrl?: string; name: string }) {
  if (!imageUrl) {
    // 사진이 없으면 회색 자리만 둔다 — 없는 사진을 다른 가게 이미지로 대체하지 않는다.
    return <span aria-hidden="true" className="block size-full bg-surface-secondary" />;
  }
  return (
    <Image
      src={imageUrl}
      alt={`${name} 가게 사진`}
      width={72}
      height={72}
      unoptimized
      className="size-full object-cover"
    />
  );
}

export function SavedStoreList({ stores }: SavedStoreListProps) {
  const router = useRouter();
  const [removed, setRemoved] = useState<ReadonlySet<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visible = stores.filter((store) => !removed.has(store.id));

  function handleUnfavorite(store: SavedStoreView) {
    const storeId = Number(store.id);
    setMessage(null);
    setRemoved((current) => new Set(current).add(store.id));

    startTransition(async () => {
      const result = await updateStoreFavorite(storeId, false);
      if (result.status === "success") {
        router.refresh();
        return;
      }
      setRemoved((current) => {
        const next = new Set(current);
        next.delete(store.id);
        return next;
      });
      setMessage(result.message);
    });
  }

  return (
    <div className="flex flex-col">
      {message ? (
        <p role="alert" className="pb-2 text-body-14-medium text-red-500">
          {message}
        </p>
      ) : null}
      <ul className="flex flex-col">
        {visible.map((store) => (
          <li key={store.id} className="relative">
            <Link
              href={ROUTES.storeDetail(store.id)}
              className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
            >
              <RowSavedStore
                thumbnail={<StoreThumbnail imageUrl={store.imageUrl} name={store.name} />}
                name={store.name}
                distance={store.distance}
                openState={store.openState}
                openLabel={store.openLabel}
                hours={store.hours}
              />
            </Link>
            {/*
              하트를 Link 안에 넣으면 버튼 안 버튼(중첩 인터랙티브)이 된다 — 행 링크 위에
              절대 위치로 겹쳐 둔다. RowSavedStore의 하트 자리(48×48)와 같은 크기다.
            */}
            <button
              type="button"
              onClick={() => handleUnfavorite(store)}
              aria-label={`${store.name} 단골 해제`}
              className="absolute top-1/2 right-1 flex size-12 -translate-y-1/2 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
            >
              <FigmaIcon name="heart-fill" width={23} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
