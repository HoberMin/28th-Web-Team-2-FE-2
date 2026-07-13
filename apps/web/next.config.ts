import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["@web2/design-system"],
  turbopack: {
    // 모노레포 루트 고정 — 홈 디렉토리의 무관한 lockfile 오인식 방지
    root: path.join(import.meta.dirname, "../.."),
  },
};

export default nextConfig;
