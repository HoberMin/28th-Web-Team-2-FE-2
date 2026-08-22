import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      // 업로드 파일은 5MB까지 허용하고 multipart 오버헤드를 위해 요청 본문은 6MB로 둔다.
      bodySizeLimit: "6mb",
    },
  },
  images: {
    // 야채·카트 자산이 SVG(Figma export) — next/image가 SVG를 서빙하려면 필요.
    // 보안 하드닝: 스크립트 실행 차단(script-src 'none')·sandbox·다운로드 처리로
    // SVG 내장 스크립트 위협을 무력화한다(자산은 우리 소유이나 방어적으로).
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  turbopack: {
    // 프로젝트 루트 고정 — 홈 디렉토리의 무관한 package-lock.json을 워크스페이스 루트로
    // 오인하는 경고를 막는다(단일 루트 프로젝트 전환 후에도 이 고정은 필요하다).
    root: import.meta.dirname,
  },
  // transpilePackages 없음 — 단일 루트 프로젝트라 불필요
  // (구 모노레포에서는 @web2/design-system 트랜스파일이 필요했다)
};

export default nextConfig;
