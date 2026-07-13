import type { Story } from "./types";

// Figma node 369-4075 sync — head 2종은 커스텀 폰트 파일 확보 전이라
// Pretendard로 fallback 렌더된다(자간·크기·굵기는 확정).
function TypographyStory() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-neutral-400">head1 · Y SpotlightOTF (fallback)</p>
        <p className="font-head1 text-head1-26">head1-26 · 다시 봄 Looky</p>
        <p className="font-head1 text-head1-24">head1-24 · 다시 봄 Looky</p>
        <p className="font-head1 text-head1-20">head1-20 · 다시 봄 Looky</p>
        <p className="font-head1 text-head1-18">head1-18 · 다시 봄 Looky</p>
        <p className="font-head1 text-head1-16">head1-16 · 다시 봄 Looky</p>
      </div>
      <div>
        <p className="text-xs text-neutral-400">head2 · YPairingFont OTF Bold (fallback)</p>
        <p className="font-head2 text-head2-26">head2-26 · 다시 봄 Looky</p>
        <p className="font-head2 text-head2-24">head2-24 · 다시 봄 Looky</p>
        <p className="font-head2 text-head2-20">head2-20 · 다시 봄 Looky</p>
        <p className="font-head2 text-head2-18">head2-18 · 다시 봄 Looky</p>
        <p className="font-head2 text-head2-16">head2-16 · 다시 봄 Looky</p>
        <p className="font-head2 text-head2-14">head2-14 · 다시 봄 Looky</p>
      </div>
      <div>
        <p className="text-xs text-neutral-400">body · Pretendard</p>
        <p className="font-body text-body-18-semibold">body-18-semibold · 가나다 ABC 123</p>
        <p className="font-body text-body-18-medium">body-18-medium · 가나다 ABC 123</p>
        <p className="font-body text-body-18-regular">body-18-regular · 가나다 ABC 123</p>
        <p className="font-body text-body-16-bold">body-16-bold · 가나다 ABC 123</p>
        <p className="font-body text-body-16-semibold">body-16-semibold · 가나다 ABC 123</p>
        <p className="font-body text-body-16-medium">body-16-medium · 가나다 ABC 123</p>
        <p className="font-body text-body-16-regular">body-16-regular · 가나다 ABC 123</p>
        <p className="font-body text-body-14-medium">body-14-medium · 가나다 ABC 123</p>
        <p className="font-body text-body-14-regular">body-14-regular · 가나다 ABC 123</p>
      </div>
      <div>
        <p className="text-xs text-neutral-400">caption · Pretendard</p>
        <p className="font-body text-caption-12-medium">caption-12-medium · 가나다 ABC 123</p>
        <p className="font-body text-caption-12-regular">caption-12-regular · 가나다 ABC 123</p>
      </div>
    </div>
  );
}

export const typographyStory: Story = {
  id: "typography",
  title: "Typography",
  group: "파운데이션",
  figma: "node 369-4075",
  description:
    "타이포 스케일 전량. head1/head2는 커스텀 폰트 파일 확보 전 Pretendard fallback(자간·크기·굵기는 Figma 확정값).",
  Component: TypographyStory,
};
