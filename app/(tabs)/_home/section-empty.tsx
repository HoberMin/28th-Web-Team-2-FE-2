// F01 홈 섹션의 빈 상태.
//
// ⚠️ **Figma 시안 없음 — 임시 구현이다.** F01_홈(298:3477)·F01_홈_더보기(298:3509) 어느 프레임에도
//    빈/로딩/에러 상태 시안이 없다. 그런데 이 서비스는 이웃 제보로 최저가가 쌓이는 구조라
//    출시 초기에는 "우리 동네 제보 0건"이 사실상 기본 화면이다 — 그래서 비워 두지 않고
//    기존 토큰·타이포만으로 최소한만 만들어 뒀다.
//    디자이너 시안이 나오면 이 파일을 통째로 교체한다.
//
// 임시 구현에서 스스로 정한 것(= Figma 근거 없음, 확인 필요):
//   · 세로 패딩 py-10, 가운데 정렬, 문구 2줄(제목 + 보조)
//   · 색은 대비를 통과하는 조합만 썼다 — content/primary 13.51:1 · content/secondary 4.79:1.
//     content/disabled(1.92:1)는 본문에 쓰면 AA 미달이라 쓰지 않았다.
//   · 그림·일러스트는 넣지 않았다. 에셋을 못 가져와서가 아니라 **빈 상태용 그림이 Figma에 없어서**다
//     (있는 에셋은 `public/figma/design-library/`에 다 들어와 있다). 임의로 다른 화면의 그림을
//     끌어다 쓰지 않는다.

export interface SectionEmptyProps {
  title: string;
  description: string;
}

export function SectionEmpty({ title, description }: SectionEmptyProps) {
  return (
    <div className="flex w-full flex-col items-center gap-1 py-10 text-center">
      <p className="text-body-16-semibold text-content-primary">{title}</p>
      <p className="text-body-14-medium text-content-secondary">{description}</p>
    </div>
  );
}
