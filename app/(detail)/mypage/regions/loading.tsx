import { LoadingCircular } from "@/app/_components/loading-circular";

// 이 페이지는 `cookies()`(→ `getAccessToken()`)와 `no-store` 조회 때문에 완전 동적이다.
// `loading.tsx` 경계가 없으면 마이페이지에서 눌러도 Spring 왕복이 끝날 때까지 반응이 없어
// 보인다(`(detail)/prices/[itemId]/loading.tsx`와 같은 이유).
export default function MyPageRegionsLoading() {
  return (
    <div className="flex h-dvh justify-center bg-surface-secondary">
      <div className="flex h-full w-full max-w-97.5 flex-col items-center justify-center bg-surface-primary text-content-secondary">
        <LoadingCircular animate currentColor className="text-content-brand-light" label="동네 정보를 불러오고 있어요" />
      </div>
    </div>
  );
}
