"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/app/_components/button";
import { ImageProfileReporter } from "@/app/_components/image-profile-reporter";
import { TextField } from "@/app/_components/text-field";
import { saveNicknameAction } from "@/app/onboarding/_actions";
import { NICKNAME_MAX } from "@/app/_lib/nickname";

// F05 프로필 블록. 닉네임 편집이 붙어 있어 이 조각만 클라이언트다.
//
// 저장은 온보딩이 이미 쓰고 있는 `saveNicknameAction`(PATCH /api/v1/users/me)을 **그대로**
// 재사용한다 — 같은 규칙(2~10자·중복 409)을 두 곳에서 각자 구현하면 갈린다.

interface NicknameEditorProps {
  nickname: string;
  regionName?: string;
}

export function NicknameEditor({ nickname, regionName }: NicknameEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(nickname);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveNicknameAction(draft.trim());
      if (result.ok) {
        setEditing(false);
        router.refresh();
        return;
      }
      setMessage(result.message);
    });
  }

  return (
    <section className="flex flex-col gap-3 py-4">
      <div className="flex items-center gap-3">
        <ImageProfileReporter color="green" />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-title-18-bold text-content-primary">
            {nickname || "우리 동네 이웃"}
          </p>
          <p className="truncate text-body-14-regular text-content-secondary">
            {regionName ?? "동네를 아직 고르지 않았어요"}
          </p>
        </div>
        {!editing && (
          <Button
            variant="outlined"
            size="small"
            leading={false}
            trailing={false}
            onClick={() => setEditing(true)}
          >
            닉네임 변경
          </Button>
        )}
      </div>

      {editing && (
        <div className="flex flex-col gap-2">
          <TextField
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={NICKNAME_MAX}
            aria-label="닉네임"
            placeholder="2~10자, 한글·영문·숫자"
          />
          {message ? (
            <p role="alert" className="text-body-14-medium text-red-500">
              {message}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="small"
              leading={false}
              trailing={false}
              onClick={() => {
                setDraft(nickname);
                setMessage(null);
                setEditing(false);
              }}
            >
              취소
            </Button>
            <Button
              size="small"
              leading={false}
              trailing={false}
              state={pending ? "loading" : "normal"}
              disabled={pending}
              onClick={handleSave}
            >
              저장
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
