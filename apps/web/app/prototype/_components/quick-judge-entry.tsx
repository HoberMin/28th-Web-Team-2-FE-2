import Link from "next/link";
import IconCheckmarkCircleFill from "@karrotmarket/react-monochrome-icon/IconCheckmarkCircleFill";
import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";

// 홈 → 즉석 판단(F10) 진입점.
// 매장 가격표 앞에서 켜는 앱이라, 홈에서 품목을 찾아 들어가는 경로(스크롤 4회)와 별도로
// "지금 이 가격 사도 되나"만 묻는 최단 경로를 홈 상단에 둔다.
//
// 배경이 주황(brand-solid)이 아니라 어두운 solid인 이유:
// 주황 위 흰 글자는 2.94:1이다. Seed의 ActionButton brandSolid가 그 기준선을 쓰지만,
// 이 카드는 12px 보조문구까지 얹는 자리라 그 기준선으로는 안 읽힌다.
// 어두운 solid는 13.3:1이고, 하단 CTA(오프라인 가격 제보하기)와 같은 "강한 액션" 생김새를 공유한다.
// 브랜드색은 아이콘이 맡는다.
export function QuickJudgeEntry() {
  return (
    <Link
      href="/prototype/judge"
      className="flex items-center gap-3 rounded-2xl bg-bg-neutral-inverted px-4 py-4 text-fg-neutral-inverted active:bg-bg-neutral-inverted-pressed"
    >
      <span className="shrink-0 text-palette-carrot-500 [&_svg]:size-6" aria-hidden="true">
        <IconCheckmarkCircleFill />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-body-16-semibold">이 가격 사도 될까요?</span>
        <span className="text-caption-12-regular">
          가격만 입력하면 우리 동네 기준으로 바로 알려드려요
        </span>
      </span>
      <span className="shrink-0 [&_svg]:size-5" aria-hidden="true">
        <IconChevronRightLine />
      </span>
    </Link>
  );
}
