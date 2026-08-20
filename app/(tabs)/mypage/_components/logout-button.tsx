"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

// 로그아웃은 BFF Route Handler(`app/api/auth/logout`)를 부른다 — Server Action이 아니라
// 이쪽인 이유는 그 핸들러가 이미 "Spring 폐기 실패해도 우리 쿠키는 지운다" 규칙을
// 들고 있어서다. 여기서 다시 구현하면 규칙이 두 곳으로 갈린다.

export function LogoutButton() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    setMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/logout", { method: "POST" });
        if (!response.ok) throw new Error(`logout ${response.status}`);
      } catch {
        setMessage("로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2 pt-6">
      {message ? (
        <p role="alert" className="text-body-14-medium text-red-500">
          {message}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="min-h-11 self-start px-1 text-body-14-medium text-content-secondary underline disabled:text-content-disabled"
      >
        {pending ? "로그아웃 중…" : "로그아웃"}
      </button>
    </div>
  );
}
