import { CardNews } from "../../_components/card-news";
import { FigmaImage } from "@/app/_lib/figma-asset";
import type { HomeNewsItem } from "./_data";
import { SectionEmpty } from "./section-empty";

// F01 홈 3번 섹션 「최근 시세 뉴스」 — Figma 298:3501 / 298:3534.
//
// Figma 실측:
//   섹션      flex-col gap-[24px] w-[632px]
//   제목      title/18-bold, 색이 **raw `gray/1000`** 에 바인딩돼 있다
//   본문      flex gap-[16px] w-[632px] · card/news × 3 (각 200px)
//
// Figma와 다르게 구현한 것:
//   · 제목 색을 raw `gray/1000` 대신 **`content/primary`** 로 구현했다. 다른 두 섹션 제목은
//     시맨틱(content/primary)에 바인딩돼 있는데 이 제목만 시맨틱을 건너뛰었다 —
//     같은 위계의 제목이 서로 다른 통로를 타면 시맨틱 레이어가 깨진다. → 디자이너 확인 필요.
//   · 섹션 gap 24 → **16(gap-4)로 통일**(section-recommended-store.tsx 주석 참고).
//   · 컨테이너 `w-[632px]` 고정을 버리고 **가로 스크롤 캐러셀**로 만들었다. 632px는 카드 3장이
//     한 줄에 다 들어가는 캔버스 폭일 뿐이고, 실제 화면(390px)에서는 잘린다. Figma가 카드를 옆으로
//     늘어놓은 의도를 살려 `-mx-4 px-4 overflow-x-auto snap-x`로 화면 밖까지 흐르게 하고,
//     스크롤바는 이미 있는 `@utility no-scrollbar`로 숨긴다(globals.css 수정 아님 — 사용만).
//     `-mx-4 px-4`는 페이지의 좌우 여백(px-4)을 뚫고 나가되 첫 카드가 여백선에 맞게 서기 위한 것.
//     ⚠️ **`scroll-px-4`가 반드시 같이 있어야 한다.** `snap-start`는 아이템 시작 모서리를
//        "스크롤포트 시작 + scroll-padding"에 맞추는데, scroll-padding이 0이면 브라우저가
//        왼쪽 패딩 16px만큼 스크롤을 밀어버려 첫 카드가 컨테이너 끝에 붙는다(패딩은 적용돼
//        있는데 스냅이 그 위로 스크롤한 상태다). 실제로 이 증상이 배포본에서 발견됐다.
//        `scroll-px-4`로 스냅 기준선을 패딩선과 일치시킨다.
//
// Figma 개발 주석(298:3537): "카드 클릭 시 뉴스로 이동(링크)" + 참고용 외부 기사 URL 2개.
// → 카드를 <a>로 감싸고 외부 링크라 `target="_blank"` + `rel="noopener noreferrer"`를 붙였다.
//   (Figma에 새 탭 여부 정의는 없다 — 외부 도메인이라 코드 판단으로 새 탭을 골랐다.)
//
// 썸네일은 Figma 샘플 에셋(`images/news-thumbnail.png`)을 쓴다. 실제 기사마다 이미지가 달라지므로
// CardNews의 슬롯 구조는 그대로 두고 여기서 그림만 꽂는다 — 기사 이미지 URL이 붙으면 이 자리를
// 기사별 <Image>로 바꾸면 된다.
// ⚠️ 대비: 날짜 content/disabled(#b4bbcb) on 흰 배경 = 1.92:1 → 14px 기준 4.5:1 미달.
//    card/news 원본 규격 그대로라 여기서 바꾸지 않는다(figma-bridge §4).

export interface SectionNewsProps {
  items: HomeNewsItem[];
}

/**
 * 카드 썸네일(200×108). Figma 샘플 에셋을 카드 폭에 꽉 채워 자른다 —
 * `/playground` card-news 스토리와 같은 크기·같은 처리다.
 */
function NewsThumbnail() {
  return (
    <FigmaImage
      name="news-thumbnail.png"
      width={200}
      height={108}
      className="size-full object-cover"
    />
  );
}

export function SectionNews({ items }: SectionNewsProps) {
  return (
    <section className="flex w-full flex-col items-start gap-4">
      <h2 className="w-full text-title-18-bold text-content-primary">최근 시세 뉴스</h2>

      {items.length > 0 ? (
        // self-stretch가 필요하다: 섹션이 `items-start`라 자식이 늘어나지 않는데, 이 목록은
        // 폭이 컨테이너에 맞아야(그리고 -mx-4로 좌우 16씩 더 뻗어야) 가로 스크롤이 성립한다.
        <ul className="-mx-4 flex snap-x scroll-px-4 gap-4 self-stretch overflow-x-auto px-4 no-scrollbar">
          {items.map((item) => (
            <li key={item.id} className="shrink-0 snap-start">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md focus-visible:outline-2 focus-visible:outline-content-primary focus-visible:outline-offset-2"
              >
                <CardNews
                  thumbnail={<NewsThumbnail />}
                  title={item.title}
                  date={item.date}
                />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <SectionEmpty
          title="아직 소식이 없어요"
          description="시세와 관련된 뉴스가 올라오면 여기에 모아드려요."
        />
      )}
    </section>
  );
}
