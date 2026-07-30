"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import IconXmarkLine from "@karrotmarket/react-monochrome-icon/IconXmarkLine";
import { PhoneFrame } from "../_lib/shell";

// F02 야채 촬영 — 실제 후면 카메라(getUserMedia) 실시간 프리뷰.
// 셔터 → 현재 프레임을 canvas에 고정 → "인식중" 스피너 → 제보 폼(F04-2)으로.
// 진입 경로는 F03-1(제보 방식 선택)→F04-1(가게 위치 선택)뿐 — 홈에서 직접 진입 없음.
type Phase = "live" | "analyzing" | "error";

export function CaptureView({ item, place }: { item: string; place: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("live");

  const closeHref = `/prototype/price/${item}`;
  const query = new URLSearchParams({ method: "photo", item, ...(place ? { place } : {}) });
  const shutterHref = `/prototype/report?${query.toString()}`;

  // 마운트 시 후면 카메라 열기. 언마운트 시 스트림 정리.
  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setPhase("error");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (!cancelled) setPhase("error");
      }
    }

    void start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  // 인식중 페이즈에 진입하면 스피너를 잠깐 보여준 뒤 다음 화면으로.
  useEffect(() => {
    if (phase !== "analyzing") return;
    const id = setTimeout(() => router.push(shutterHref), 2000);
    return () => clearTimeout(id);
  }, [phase, router, shutterHref]);

  function handleShutter() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    // 프레임 고정 후 카메라 정지(프리뷰가 방금 찍은 장면에 멈춘 것처럼 보이게)
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setPhase("analyzing");
  }

  return (
    <PhoneFrame>
      <div className="absolute inset-0 bg-palette-static-black">
        {/* 실시간 카메라 프리뷰 (인식중엔 숨기고 고정 프레임 표시) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-hidden
          className={`absolute inset-0 size-full object-cover ${phase === "analyzing" ? "hidden" : ""}`}
        />
        {/* 셔터 순간 고정된 프레임 */}
        <canvas
          ref={canvasRef}
          aria-hidden
          className={`absolute inset-0 size-full object-cover ${phase === "analyzing" ? "" : "hidden"}`}
        />

        <div className="relative z-10 flex h-full flex-col text-palette-static-white">
          {/* 상단 바 */}
          <div className="shrink-0 bg-palette-static-black/95">
            <div className="relative flex h-14 items-center justify-center">
              <Link
                href={closeHref}
                aria-label="촬영 닫기"
                className="absolute left-2 flex size-12 items-center justify-center rounded-full hover:bg-palette-static-white-alpha-200 [&_svg]:size-6"
              >
                <IconXmarkLine />
              </Link>
              <h1 className="text-head2-18">야채 촬영</h1>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            {phase === "analyzing" && <DotSpinner />}
            {phase === "error" && (
              <div className="mx-8 flex flex-col items-center gap-4 text-center">
                <p className="text-body-14-regular text-palette-static-white-alpha-900">
                  카메라를 열 수 없어요.
                  <br />
                  브라우저 카메라 권한을 확인해 주세요.
                </p>
                <Link
                  href={shutterHref}
                  className="rounded-full bg-palette-static-white-alpha-200 px-5 py-2 text-body-14-regular text-palette-static-white hover:bg-palette-static-white-alpha-300"
                >
                  촬영 없이 계속하기
                </Link>
              </div>
            )}
          </div>

          {/* 안내 + 셔터 (사진 위, 가독성 위해 하단 그라디언트) */}
          <div className="shrink-0 bg-gradient-to-t from-palette-static-black-alpha-500 to-transparent pt-10 pb-10">
            <div className="flex flex-col items-center gap-5">
              <button
                type="button"
                aria-label="촬영"
                onClick={handleShutter}
                disabled={phase !== "live"}
                className="flex size-[74px] items-center justify-center rounded-full bg-bg-brand-solid shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-palette-static-white disabled:bg-palette-static-white-alpha-300"
              >
                <Image src="/veg/camera.svg" alt="" width={32} height={32} className="size-8" />
              </button>
              <p aria-live="polite" className="text-body-16-regular text-palette-static-white-alpha-900">
                {phase === "analyzing" ? "야채를 인식중입니다" : "가격과 야채가 잘 보이게 촬영해 주세요"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// 8개 점이 원형으로 돌며 꼬리가 옅어지는 로딩 스피너 (Figma 100-5031)
function DotSpinner() {
  return (
    <div className="relative size-12 animate-spin" style={{ animationDuration: "0.9s" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 size-2 rounded-full bg-palette-static-white"
          style={{
            transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-18px)`,
            opacity: (i + 1) / 8,
          }}
        />
      ))}
    </div>
  );
}
