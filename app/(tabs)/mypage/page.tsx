// F05 마이페이지 — **Figma 시안이 아직 없다.**
//
// 화면을 지어내지 않고 자리만 잡아 둔다. GNB(nav/gnb 223-7003)는 항목이 5개로 확정돼 있어서
// "내 정보" 탭이 이미 존재하는데, 대응 라우트가 없으면 배포본에서 탭 하나가 404가 된다.
// 시안이 오면 이 파일을 통째로 교체한다 — 여기 있는 문구·여백은 규격이 아니다.
//
// 관련: feedback.md §4-2 (디자이너에게 F05를 최우선으로 요청한 항목)
export default function MyPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-2 px-4 py-10">
      <p className="text-title-18-bold text-content-primary">마이페이지는 준비 중이에요</p>
      <p className="text-center text-body-14-regular text-content-secondary">
        곧 만나보실 수 있어요.
      </p>
    </div>
  );
}
