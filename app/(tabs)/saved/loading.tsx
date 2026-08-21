import { LoadingCircular } from "../../_components/loading-circular";

// 로딩 상태 — **Figma에 F04 로딩 시안이 없다. 임시 구현이다.**
// 새 규격을 지어내지 않고 이미 있는 `loading/circular` 컴포넌트만 화면 가운데에 둔다.
// 골격(skeleton)을 그리면 시안에 없는 레이아웃을 발명하는 셈이라 하지 않았다.
// 스피너 색은 currentColor라 부모에서 content/secondary(대비 4.79:1)를 준다.
export default function SavedLoading() {
  return (
    <div className="flex justify-center px-4 pt-4 pb-20 text-content-secondary">
      <div className="py-20">
        <LoadingCircular animate currentColor className="text-content-brand-light" label="찜 목록을 불러오고 있어요" />
      </div>
    </div>
  );
}
