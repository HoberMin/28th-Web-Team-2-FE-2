import type { Metadata, Viewport } from "next";
import "./globals.css";

// 폰트는 globals.css가 import하는 app/fonts/wanted-sans-subset.css(@font-face 92분할)가 소유한다.
// next/font/local을 쓰지 않는 이유: 동적 서브셋은 unicode-range로 쪼갠 92개 파일이라
// next/font가 다루는 단일 파일 모델에 맞지 않는다. 대신 브라우저가 페이지에 실제로 등장한
// 문자 범위의 조각만 내려받는다(한 페이지 보통 2~4개 ≈ 50~100KB, 통합본은 1.29MB).

// `viewportFit: "cover"`가 있어야 iOS에서 `env(safe-area-inset-*)`이 실제 값을 갖는다.
// 이게 없으면 전부 0으로 계산돼 하단 home indicator 회피가 조용히 무효가 된다
// (지도 바텀시트 CTA·GNB 라벨이 인디케이터에 물린다).
export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "동네 야채 시세",
  description: "우리 동네 야채 시세를 확인하고 실제 구매가를 제보하는 UT 프로토타입.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className="h-full font-sans antialiased"
      // Seed Design 테마 속성 — 번들러 플러그인 없이 수동 지정 (design-guide §1-2)
      // SEED는 font-family: inherit이라 루트의 font-sans를 그대로 따른다.
      data-seed-color-mode="light-only"
      data-seed-user-color-scheme="light"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
