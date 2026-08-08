import Link from "next/link";

// 찜 빈 상태 — **Figma에 시안이 없다. 임시 구현이다.**
//
// 그럼에도 반드시 있어야 하는 화면이다: 찜은 신규 사용자가 0개로 시작하므로 빈 화면이 사실상
// 첫 화면이다. 시안이 없는 만큼 새 규격을 지어내지 않고 기존 토큰·타이포만으로 최소한
// (문구 + 다음 행동 유도)만 만들었다. 디자이너 시안이 나오면 이 파일을 통째로 교체한다.
//
// 대비: content/primary 13.51:1 · content/secondary 4.79:1 · content/brand/medium 5.53:1 —
// 셋 다 AA(4.5:1) 통과.

export interface SavedEmptyProps {
  /** 예: "찜한 야채가 없어요" */
  title: string;
  /** 예: "시세 화면에서 하트를 누르면 여기에 모여요." */
  description: string;
  actionHref: string;
  /** 예: "야채 시세 보러 가기" */
  actionLabel: string;
}

export function SavedEmpty({ title, description, actionHref, actionLabel }: SavedEmptyProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-20 text-center">
      <p className="text-title-18-bold text-content-primary">{title}</p>
      <p className="text-body-14-regular text-content-secondary">{description}</p>
      <Link
        href={actionHref}
        className="mt-2 inline-flex min-h-11 items-center px-2 text-body-16-semibold text-content-brand-medium underline"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
