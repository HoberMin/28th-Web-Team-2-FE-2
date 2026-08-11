"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import IconClockFill from "@karrotmarket/react-monochrome-icon/IconClockFill";
import type { MapStore } from "@/app/(tabs)/stores/_data";
import type { ReporterRank } from "@/app/_components/badge-reporter-rank";
import { ImageStorePlaceholder } from "@/app/_components/image-store-placeholder";
import { ItemComment } from "@/app/_components/item-comment";
import type { ReporterTone } from "@/app/_components/image-profile-reporter";
import { FigmaIcon, FigmaImage } from "@/app/_lib/figma-asset";
import { addComment, useComments, type Comment } from "@/app/_lib/comments-store";
import { ROUTES } from "@/app/_lib/routes";
import { StoreDetailBackButton } from "./_back-button";
import type { StoreDetailData, StoreDetailPrice } from "./_data";

interface StoreDetailClientProps {
  store: MapStore;
  detail: StoreDetailData;
}

interface FigmaComment {
  id: string;
  nickname: string;
  rank: ReporterRank;
  age: string;
  body: string;
  tone: ReporterTone;
}

const FIGMA_COMMENTS: FigmaComment[] = Array.from({ length: 15 }, (_, index) => ({
  id: `figma-comment-${index + 1}`,
  nickname: "떡볶이킬러",
  rank: (["sprout", "rookie", "expert", "king"] as const)[index % 4],
  age: `${index + 3}시간 전`,
  body: "사장님이 친절해요~ 사장님이 친절해요~ 사장님이 친절해요~ 사장님이 친절해요~",
  tone: (["green", "orange", "blue", "gray"] as const)[index % 4],
}));

function StoreHero({ imageName, storeName }: { imageName?: string; storeName: string }) {
  if (imageName) {
    return (
      <FigmaImage
        name={imageName}
        alt={`${storeName} 가게 전경`}
        width={390}
        height={220}
        className="h-55 w-full object-cover"
      />
    );
  }

  return (
    <ImageStorePlaceholder />
  );
}

function StoreInformation({ store, detail }: StoreDetailClientProps) {
  const [hoursOpen, setHoursOpen] = useState(true);

  return (
    <section className="px-4 py-5">
      <h1 className="text-title-20-bold text-content-primary">{store.name}</h1>
      <div className="mt-3 flex items-start gap-2 text-content-secondary">
        <FigmaIcon name="map-pin-fill" width={20} currentColor />
        <p className="min-w-0 flex-1 text-caption-12-medium">{detail.address}</p>
      </div>
      <button
        type="button"
        aria-expanded={hoursOpen}
        onClick={() => setHoursOpen((current) => !current)}
        className="mt-3 flex w-full items-start gap-2 text-left text-content-secondary"
      >
        <IconClockFill aria-hidden="true" className="size-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-caption-12-medium">
            <span className="font-semibold text-content-primary">영업종료</span>
            {" · 10:30에 영업시작"}
          </p>
          {hoursOpen && (
            <div className="mt-2 space-y-1 text-caption-12-medium">
              {detail.hours.map((line) => <p key={line}>{line}</p>)}
            </div>
          )}
        </div>
        <FigmaIcon name={hoursOpen ? "chevron-up" : "chevron-down"} width={16} currentColor />
      </button>
      <div className="mt-4 flex gap-2">
        <span className="rounded-sm bg-surface-accent-subtle px-2 py-1 text-caption-12-semibold text-content-accent">
          저렴한 야채 {store.affordableCount}
        </span>
        <span className="rounded-sm bg-surface-brand px-2 py-1 text-caption-12-semibold text-content-brand-light">
          오늘 제보된 품목 {store.todayReportCount}
        </span>
      </div>
    </section>
  );
}

function PriceRow({ item, compact = false }: { item: StoreDetailPrice; compact?: boolean }) {
  return (
    <div className={`flex w-full items-center gap-3 ${compact ? "h-14.5" : "min-h-19.25"}`}>
      <FigmaImage name="onion.png" width={compact ? 28 : 40} height={compact ? 28 : 40} className={compact ? "size-7 object-contain" : "size-10 object-contain"} />
      <div className="min-w-0 flex-1">
        <p className={compact ? "text-body-14-semibold text-content-primary" : "text-body-16-semibold text-content-primary"}>{item.name}</p>
        <p className="text-caption-12-regular text-content-tertiary">{item.age}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={compact ? "text-body-14-semibold text-content-primary" : "text-body-16-semibold text-content-primary"}>
          {item.price}<span className="ml-1 text-caption-12-regular text-content-disabled">{item.unit}</span>
        </p>
        {!compact && <p className="text-caption-12-medium text-trend-down">{item.trend}</p>}
      </div>
    </div>
  );
}

function PriceSheet({ prices, onClose }: { prices: StoreDetailPrice[]; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-30 flex items-end bg-black/45" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label="제보된 저렴한 야채 전체 목록"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[65.6%] w-full overflow-hidden rounded-t-3xl bg-surface-primary"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-content-disabled" />
        <div className="flex items-center justify-between px-4 pt-5 pb-2">
          <h2 className="text-body-16-bold text-content-primary">제보된 저렴한 야채</h2>
          <p className="text-caption-12-regular text-content-tertiary">최근 30일간 · 최신 순</p>
        </div>
        <div className="max-h-[522px] overflow-y-auto px-4 pb-4">
          {prices.map((item) => <PriceRow key={item.id} item={item} compact />)}
        </div>
      </section>
    </div>
  );
}

function StorePrices({ prices }: { prices: StoreDetailPrice[] }) {
  const [kind, setKind] = useState<StoreDetailPrice["kind"]>("cheap");
  const [sheetOpen, setSheetOpen] = useState(false);
  const filtered = prices.filter((item) => item.kind === kind);

  return (
    <>
      <section className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-body-16-bold text-content-primary">가게에 제보된 야채</h2>
          <p className="text-caption-12-regular text-content-tertiary">최근 30일간 · 최신 순</p>
        </div>
        <div className="mt-5 grid h-10 grid-cols-2 rounded-md bg-surface-secondary p-1">
          {(["cheap", "expensive"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={kind === value}
              onClick={() => setKind(value)}
              className={`rounded-sm text-caption-12-semibold ${kind === value ? "bg-surface-primary text-content-primary shadow-sm" : "text-content-tertiary"}`}
            >
              {value === "cheap" ? "저렴해요" : "비싸요"}
            </button>
          ))}
        </div>
        <div className="mt-1 divide-y divide-border-secondary">
          {filtered.slice(0, 4).map((item) => <PriceRow key={item.id} item={item} />)}
          {filtered.length === 0 && <p className="py-12 text-center text-body-14-medium text-content-tertiary">아직 제보가 없어요</p>}
        </div>
        {filtered.length > 4 && (
          <button type="button" onClick={() => setSheetOpen(true)} className="mt-2 h-9.5 w-full rounded-md border border-border-primary text-caption-12-semibold text-content-secondary">
            더보기
          </button>
        )}
      </section>
      {sheetOpen && <PriceSheet prices={filtered} onClose={() => setSheetOpen(false)} />}
    </>
  );
}

function toFigmaComment(comment: Comment, index: number): FigmaComment {
  return {
    id: comment.id,
    nickname: comment.nickname,
    rank: "sprout",
    age: "방금 전",
    body: comment.body,
    tone: (["green", "orange", "blue", "gray"] as const)[index % 4],
  };
}

function StoreComments({ storeName }: { storeName: string }) {
  const localComments = useComments(storeName);
  const [value, setValue] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const comments = [...localComments.map(toFigmaComment), ...FIGMA_COMMENTS];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = value.trim();
    if (!body) return;
    addComment({ storeName, nickname: "황유나", body });
    setValue("");
  };

  return (
    <section className="px-4 pt-5 pb-6">
      <h2 className="text-body-16-bold text-content-primary">댓글 67</h2>
      <form onSubmit={handleSubmit} className="mt-4 flex h-10 items-center rounded-md bg-surface-secondary px-3">
        <label htmlFor="store-comment" className="sr-only">댓글 입력</label>
        <input id="store-comment" value={value} onChange={(event) => setValue(event.target.value)} placeholder="댓글을 입력하세요" className="min-w-0 flex-1 bg-transparent text-caption-12-medium text-content-primary outline-none placeholder:text-content-disabled" />
        <button type="submit" disabled={!value.trim()} className="rounded-sm bg-action-primary-default px-2 py-1 text-caption-12-semibold text-content-inverse disabled:bg-action-primary-disabled">등록</button>
      </form>
      <div className="mt-1">
        {comments.slice(0, visibleCount).map((comment) => (
          <ItemComment
            key={comment.id}
            nickname={comment.nickname}
            rank={comment.rank}
            age={comment.age}
            body={comment.body}
            profileColor={comment.tone}
          />
        ))}
      </div>
      {visibleCount < comments.length && (
        <button type="button" onClick={() => setVisibleCount((count) => count + 5)} className="mt-2 h-9.5 w-full rounded-md bg-surface-secondary text-caption-12-semibold text-content-secondary">댓글 더보기</button>
      )}
    </section>
  );
}

export function StoreDetailClient({ store, detail }: StoreDetailClientProps) {
  const [favorite, setFavorite] = useState(false);

  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-surface-secondary">
      <div className="relative flex h-full min-h-0 w-full max-w-97.5 flex-col overflow-hidden bg-surface-primary">
        <header className="flex h-12.25 shrink-0 items-center border-b border-border-secondary px-1">
          <StoreDetailBackButton />
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-21">
          <StoreHero imageName={detail.imageName} storeName={store.name} />
          <StoreInformation store={store} detail={detail} />
          <div className="h-2 bg-border-secondary" />
          <StorePrices prices={detail.prices} />
          <div className="h-2 bg-border-secondary" />
          <StoreComments storeName={store.name} />
        </main>
        <footer className="absolute right-0 bottom-0 left-0 z-20 flex h-18.25 items-center gap-4 border-t border-border-secondary bg-surface-primary px-4 pb-[env(safe-area-inset-bottom)]">
          <button type="button" aria-label={favorite ? "가게 찜 해제" : "가게 찜하기"} aria-pressed={favorite} onClick={() => setFavorite((current) => !current)} className="flex w-10 shrink-0 flex-col items-center text-content-secondary">
            <FigmaIcon name={favorite ? "heart-fill" : "heart-stroke-bold"} width={24} currentColor />
            <span className="text-caption-12-semibold">999+</span>
          </button>
          <Link href={`${ROUTES.report}?store=${encodeURIComponent(store.id)}`} className="flex flex-1 items-center justify-center rounded-lg bg-action-secondary-default px-7 py-3 text-body-16-semibold text-content-inverse active:bg-content-secondary">
            가게에 제보하기
          </Link>
        </footer>
      </div>
    </div>
  );
}
