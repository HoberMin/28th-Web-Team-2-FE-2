"use client";

import { useEffect, useReducer, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GridVegetableItem } from "../../_components/grid-vegetable-item";
import { FigmaIcon } from "../../_lib/figma-asset";
import { updateItemFavorite } from "./_actions";
import {
  createFavoriteState,
  reduceFavoriteState,
} from "./_favorite-state";
import type { TrendState } from "./_item-view";

const TREND_ICON_NAME: Record<TrendState, string> = {
  down: "trend-down",
  up: "trend-up",
  flat: "trend-flat",
};

const TREND_LABEL: Record<TrendState, string> = {
  down: "어제보다 내림",
  up: "어제보다 오름",
  flat: "어제와 같음",
};

export interface PriceVegetableCardProps {
  itemId: number;
  name: string;
  image: string;
  price: string;
  unit: string;
  trendState: TrendState;
  trendAmount: string;
  trendPercent: string;
  initialFavorite: boolean;
  canFavorite: boolean;
  /** API 숫자 ID와 기존 slug 상세 경로의 계약이 생기기 전까지 실제 화면에서는 넘기지 않는다. */
  detailHref?: string;
}

export function PriceVegetableCard({
  itemId,
  name,
  image,
  price,
  unit,
  trendState,
  trendAmount,
  trendPercent,
  initialFavorite,
  canFavorite,
  detailHref,
}: PriceVegetableCardProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    reduceFavoriteState,
    initialFavorite,
    createFavoriteState,
  );
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);

  useEffect(() => {
    dispatch({ type: "hydrate", liked: initialFavorite });
  }, [initialFavorite]);

  const toggleFavorite = () => {
    if (!canFavorite) {
      dispatch({ type: "notice", message: "찜하려면 카카오 로그인이 필요해요." });
      return;
    }
    if (inFlight.current) return;

    const nextLiked = !state.liked;
    inFlight.current = true;
    dispatch({ type: "request", liked: nextLiked });

    startTransition(async () => {
      try {
        const result = await updateItemFavorite(itemId, nextLiked);
        if (result.status === "success") {
          dispatch({ type: "success" });
          router.refresh();
          return;
        }
        dispatch({ type: "failure", message: result.message });
      } catch {
        dispatch({
          type: "failure",
          message: "찜 상태를 바꾸지 못했어요. 다시 시도해 주세요.",
        });
      } finally {
        inFlight.current = false;
      }
    });
  };

  return (
    <div className="relative">
      {detailHref ? (
        <Link
          href={detailHref}
          aria-label={`${name} 시세 상세 보기`}
          className="absolute inset-0 z-10 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
        />
      ) : null}
      <GridVegetableItem
        visual={
          // 품목 이미지 host가 고정되지 않아 Next remotePatterns를 광범위하게 열지 않는다.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            width={110}
            height={110}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="size-full object-contain"
          />
        }
        name={name}
        price={price}
        unit={unit}
        trendAmount={trendAmount}
        trendPercent={trendPercent}
        trendState={trendState}
        trendIcon={
          <>
            <FigmaIcon name={TREND_ICON_NAME[trendState]} width={16} />
            <span className="sr-only">{TREND_LABEL[trendState]}</span>
          </>
        }
        favorite={state.liked}
        favoriteIcon={
          <button
            type="button"
            aria-label={
              canFavorite
                ? `${name} ${state.liked ? "찜 취소" : "찜하기"}`
                : `${name} 찜하려면 로그인 필요`
            }
            aria-pressed={state.liked}
            aria-busy={state.pending || isPending}
            disabled={state.pending || isPending}
            onClick={toggleFavorite}
            className="absolute top-px right-px z-20 flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary"
          >
            {/* 44px hit area를 안쪽으로 넓히고 아이콘 중심은 기존 36px Figma 위치에 둔다. */}
            <FigmaIcon
              name={state.liked ? "heart-fill-grid-24" : "heart-stroke-grid-24"}
              width={24}
              className="translate-x-1.25 -translate-y-1.25"
            />
          </button>
        }
      />
      {state.message ? (
        <p role="status" className="mt-1 text-caption-12-regular text-content-error">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
