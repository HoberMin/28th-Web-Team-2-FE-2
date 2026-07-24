import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Pretendard variable — self-host (OFL). CSS 변수 --font-pretendard로 노출.
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

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
      className={`${pretendard.variable} h-full antialiased`}
      // Seed Design 테마 속성 — 번들러 플러그인 없이 수동 지정 (design-guide §1-2)
      data-seed-color-mode="light-only"
      data-seed-user-color-scheme="light"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
