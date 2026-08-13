"use client";

import { type FormEvent, type PointerEvent, useState } from "react";
import Image from "next/image";
import { Button } from "@/app/_components/button";

const MIN_NICKNAME_LENGTH = 2;
const MAX_NICKNAME_LENGTH = 8;

interface NicknameStepProps {
  defaultValue: string;
  onComplete: (nickname: string) => void;
}

function validationMessage(value: string): string {
  const length = value.trim().length;
  if (length === 0) return "";
  if (length < MIN_NICKNAME_LENGTH) return "2자 이상 적어주세요";
  if (length > MAX_NICKNAME_LENGTH) return "8자 이하로 적어주세요";
  return "";
}

export function NicknameStep({ defaultValue, onComplete }: NicknameStepProps) {
  const [nickname, setNickname] = useState(defaultValue);
  const error = validationMessage(nickname);
  const isValid = nickname.trim().length >= MIN_NICKNAME_LENGTH && !error;
  const describedBy = error ? "nickname-error" : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;
    onComplete(nickname.trim());
  }

  function handleBackgroundPointerDown(event: PointerEvent<HTMLFormElement>) {
    if (!(event.target instanceof Element) || event.target.closest("input, button")) return;
    (document.activeElement as HTMLElement | null)?.blur();
  }

  return (
    <main className="min-h-dvh bg-surface-secondary">
      <form
        className="mx-auto flex min-h-dvh w-full max-w-97.5 flex-col bg-surface-primary"
        onSubmit={handleSubmit}
        onPointerDown={handleBackgroundPointerDown}
      >
        <div className="flex-1 px-4 pt-21">
          <h1 className="flex flex-col gap-0.5 text-title-24-semibold text-content-primary">
            <span className="flex items-center gap-1">
              반가워요!
              <Image
                src="/figma/design-library/images/onboarding-nickname-onion@2x.png"
                alt=""
                width={28}
                height={28}
              />
            </span>
            <span className="block">
              사용할 <strong className="font-bold text-content-brand-medium">닉네임</strong>을 알려주세요
            </span>
          </h1>

          {/*
            heading↔필드 간격. Figma 화면GUI(원본) 재실측(2026-08-13): `nickname-body`가
            flex-col **gap-[28px]** 이다(364:7990). 이전 값 26은 프레임 364:7939 하나만 26이고
            키보드 상태(7962)·에러 상태(7986)는 둘 다 28이라, 다수인 28로 맞췄다.
            → Figma 7939의 26이 오타로 보인다 (GUI피드백.md에 기록).
          */}
          <div className="mt-7">
            <label className="sr-only" htmlFor="nickname">
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={nickname}
              autoComplete="nickname"
              aria-invalid={Boolean(describedBy)}
              aria-describedby={describedBy}
              placeholder="이름 또는 별명"
              className={`h-13 w-full rounded-lg border bg-surface-primary px-4 text-body-16-medium text-content-primary placeholder:text-content-disabled focus-visible:outline-2 focus-visible:outline-offset-1 ${
                describedBy
                  ? "border-content-error focus-visible:outline-content-error"
                  : "border-border-primary focus-visible:outline-border-tertiary"
              }`}
              onChange={(event) => setNickname(event.target.value)}
            />
            {describedBy ? (
              // Figma 364:8010 실측: 에러 문구는 **body/16-medium**이다(14가 아니다).
              // 필드↔문구 간격 8은 맞았다(`nickname-body-field-group` gap-[8px]).
              <p id="nickname-error" className="mt-2 text-body-16-medium text-content-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <footer className="sticky bottom-0 h-18.25 shrink-0 bg-surface-primary px-4 pb-3 pt-3">
          <Button
            type="submit"
            className="h-12.25 w-full"
            disabled={!isValid}
            leading={false}
            trailing={false}
          >
            다음
          </Button>
        </footer>
      </form>
    </main>
  );
}
