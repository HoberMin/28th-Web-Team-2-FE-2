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
        <div className="flex-1 px-4 pt-10">
          <h1 className="text-title-24-semibold text-content-primary">
            <span className="flex items-center gap-1.5">
              반가워요!
              <Image src="/veg/onion.svg" alt="" width={28} height={28} unoptimized />
            </span>
            <span className="block">
              사용할 <strong className="font-bold text-content-brand-medium">닉네임</strong>을 알려주세요
            </span>
          </h1>

          <div className="mt-6.5">
            <label className="sr-only" htmlFor="nickname">
              닉네임
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              value={nickname}
              autoComplete="nickname"
              autoFocus
              aria-invalid={Boolean(describedBy)}
              aria-describedby={describedBy}
              placeholder="이름 또는 별명"
              className={`h-13 w-full rounded-lg border bg-surface-primary px-4 text-body-16-medium text-content-primary placeholder:text-content-disabled focus-visible:outline-2 focus-visible:outline-offset-1 ${
                describedBy
                  ? "border-red-500 focus-visible:outline-red-500"
                  : "border-border-primary focus-visible:outline-border-tertiary"
              }`}
              onChange={(event) => setNickname(event.target.value)}
            />
            {describedBy ? (
              <p id="nickname-error" className="mt-2 text-body-14-medium text-red-500" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <footer className="sticky bottom-0 shrink-0 bg-surface-primary px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
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
