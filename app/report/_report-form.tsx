"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/button";
import { FigmaIcon } from "@/app/_lib/figma-asset";
import { ROUTES } from "@/app/_lib/routes";
import { FieldInput, FieldSelect, FieldUnitSelect } from "./_components/field-price";
import { PhotoDropzone } from "./_components/photo-dropzone";
import { PhotoPreview } from "./_components/photo-preview";
import { ReportCtaFooter } from "./_components/report-cta-footer";
import { ScanModal } from "./_components/scan-modal";

// F04-1 야채 제보 폼의 인터랙션 leaf — Figma 화면GUI(원본) 364:8145 · 8173 · 8201 · 8236 · 8265.
//
// Figma 5프레임은 별개 화면이 아니라 **같은 폼의 상태**다:
//   8145 · 8173  사진 없음(dropzone)  ← 두 프레임의 자식 좌표가 **완전히 동일**하다(중복)
//   8201         사진 인식 모달이 폼 위에 떠 있음 (폼은 아직 dropzone)
//   8236 · 8265  사진 등록됨(preview) ← 라벨 이름만 다르고 사실상 중복
// 그래서 라우트를 나누지 않고 이 컴포넌트의 상태로 처리한다.
//
// ── Figma를 그대로 베끼지 않은 곳 ─────────────────────────────────────────────
//  1. 루트가 Figma에서는 자식 전부 absolute다. 폼 **내부**는 auto-layout이 정상이라
//     루트만 세로 흐름으로 바꿨다(실측 gap 40이 일관돼 gap-10 하나로 대체된다).
//  2. Status Bar(364:8171)는 iOS 목업이라 구현 대상이 아니다 → Figma의 top 좌표(헤더 44 ·
//     폼 121)를 그대로 옮기지 않고, **헤더 아래 여백만 실측 28px(pt-7)**을 지킨다.
//  3. 프레임 높이 1000은 콘텐츠 길이일 뿐이라 옮기지 않았다 — 본문을 스크롤시키고 CTA를 고정한다.
//  4. 제목·라벨 고정 폭(179 · 358)을 버렸다. 한국어 텍스트에 고정 폭을 주면 실데이터에서 깨진다.
//
// ── Figma에 정의가 없어 코드가 정한 것 (전부 GUI피드백.md에 기록) ────────────────
//  · **사진 등록 → 인식 → 미리보기 전환 조건이 없다.** 8201(모달)의 폼은 아직 dropzene이고
//    8236(미리보기)로 가는 트리거가 시안에 없다. 여기서는 **파일을 고른 뒤 이미지가 실제로
//    로드될 때까지 모달을 띄우고, 로드가 끝나면 미리보기로 넘어간다** — 발명한 타이머가 아니라
//    실제 비동기 작업을 모달이 덮는 방식이다. X는 취소(사진 버림)로 뒀다.
//  · **인식 성공 시 품목·가격을 자동 입력한다는 안내문구가 dropzone에 있지만 그 동작 정의가 없다.**
//    자동 입력은 하지 않는다(값을 발명하지 않는다).
//  · 인식 **실패** 상태가 없다. 파일 로드가 실패하면 모달을 닫고 사진을 버린다.
//  · 단위 선택 시트·목록이 없다 → `FieldUnitSelect`는 자리만 두고 동작을 붙이지 않았다.
//  · CTA "확인"의 이동 대상이 명시돼 있지 않다 → F04-4 제보 완료로 보냈다(플로우상 유일한 전진 경로).
//
// 상태 3종: 이 화면은 입력 폼이라 로딩·에러·빈 상태가 성립하지 않는다(제출 API가 붙으면 그때).

export interface ReportFormProps {
  /** F04-2에서 고른 품목. 없으면 고르라고 안내한다. */
  vegetableName?: string;
  /** 품목의 단위 종류. 예: "kg" */
  unitType?: string;
  /** F04-3에서 고른 판매 장소. */
  placeName?: string;
  /** 선택값을 물고 다니기 위한 현재 쿼리스트링(품목·장소 화면으로 넘길 때 붙인다). */
  carryQuery: string;
}

type PhotoState = { url: string; scanning: boolean } | null;

export function ReportForm({
  vegetableName,
  unitType,
  placeName,
  carryQuery,
}: ReportFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<PhotoState>(null);
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");

  // 객체 URL은 컴포넌트가 사라질 때 반드시 해제한다 — 안 하면 탭을 떠날 때마다 누적된다.
  useEffect(() => {
    const url = photo?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [photo?.url]);

  const canSubmit = Boolean(vegetableName) && price.trim() !== "" && amount.trim() !== "";

  function handlePickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // 같은 파일을 다시 고를 수 있어야 하므로 input 값을 비운다.
    event.target.value = "";
    if (!file) return;
    setPhoto({ url: URL.createObjectURL(file), scanning: true });
  }

  function handleCancelScan() {
    setPhoto(null);
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 pt-7">
        <div className="flex flex-col gap-10">
          <h1 className="text-title-24-semibold text-content-primary">
            야채의 실제 가격을
            <br />
            알려주세요
          </h1>

          <div className="flex flex-col gap-10">
            <FieldBlock label="야채 사진">
              {photo ? (
                <PhotoPreview
                  removeButton={
                    <button
                      type="button"
                      aria-label="사진 삭제"
                      className="flex size-6 items-center justify-center rounded-full bg-surface-inverse"
                      onClick={() => setPhoto(null)}
                    >
                      <FigmaIcon
                        name="close"
                        width={16}
                        currentColor
                        className="text-content-inverse"
                      />
                    </button>
                  }
                >
                  <Image
                    src={photo.url}
                    alt="등록한 야채 사진"
                    width={124}
                    height={124}
                    unoptimized
                    className="size-full object-cover"
                    onLoad={() => setPhoto((prev) => (prev ? { ...prev, scanning: false } : prev))}
                    onError={() => setPhoto(null)}
                  />
                </PhotoPreview>
              ) : (
                <PhotoDropzone
                  action={
                    <Button
                      variant="primary"
                      size="small"
                      leading={false}
                      trailing={false}
                      className="w-full"
                      onClick={() => fileRef.current?.click()}
                    >
                      사진 등록하기
                    </Button>
                  }
                />
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={handlePickFile}
              />
            </FieldBlock>

            <FieldBlock label="제보 품목">
              <FieldSelect
                value={vegetableName ?? "품목을 선택해 주세요"}
                actionLabel={vegetableName ? "다시 선택" : "선택"}
                href={`${ROUTES.reportVegetable}${carryQuery}`}
                ariaLabel={
                  vegetableName ? `제보 품목 ${vegetableName}, 다시 선택` : "제보 품목 선택"
                }
              />
            </FieldBlock>

            <FieldBlock label="가격">
              <FieldInput
                inputMode="numeric"
                placeholder="가격을 입력해 주세요"
                value={price}
                aria-label="가격"
                onChange={(event) => setPrice(event.target.value)}
              />
            </FieldBlock>

            <FieldBlock label="양">
              {/* Figma 364:8165 — flex gap-[4px], 양 입력이 flex-1, 단위가 124 고정. */}
              <div className="flex w-full items-center gap-1">
                <FieldInput
                  inputMode="numeric"
                  placeholder="1"
                  value={amount}
                  aria-label="양"
                  className="min-w-0 flex-1"
                  onChange={(event) => setAmount(event.target.value)}
                />
                <FieldUnitSelect unit={unitType ?? "kg"} aria-label="단위 선택" />
              </div>
            </FieldBlock>

            <FieldBlock label="판매 장소">
              <FieldSelect
                value={placeName ?? "장소를 선택해 주세요"}
                actionLabel={placeName ? "위치 변경" : "선택"}
                href={`${ROUTES.reportPlace}${carryQuery}`}
                ariaLabel={placeName ? `판매 장소 ${placeName}, 위치 변경` : "판매 장소 선택"}
              />
            </FieldBlock>
          </div>
        </div>
      </div>

      <ReportCtaFooter>
        <Button
          variant="secondary"
          leading={false}
          trailing={false}
          className="w-full"
          disabled={!canSubmit}
          onClick={() => router.push(ROUTES.reportDone)}
        >
          확인
        </Button>
      </ReportCtaFooter>

      {photo?.scanning ? <ScanModal onClose={handleCancelScan} /> : null}
    </>
  );
}

/**
 * Figma의 필드 블록 — 라벨 + gap-[8px] + 입력.
 * 라벨은 caption/12-medium · content/primary (364:8151 계열 실측).
 */
function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col items-start gap-2">
      <p className="w-full text-caption-12-medium text-content-primary">{label}</p>
      {children}
    </div>
  );
}
