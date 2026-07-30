"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { Switch } from "seed-design/ui/switch";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetRoot,
} from "seed-design/ui/bottom-sheet";
import IconChevronRightLine from "@karrotmarket/react-monochrome-icon/IconChevronRightLine";
import {
  addDistrict,
  removeDistrict,
  setActiveDistrict,
  setOnboarding,
  useDistricts,
  useOnboarding,
} from "../_lib/onboarding-store";
import { RegionPicker } from "./region-picker";
import { AVATAR_OPTIONS, ProfileAvatar } from "./profile-avatar";

// 닉네임 규칙 — onboarding-view.tsx와 같은 기준(2~10자). 그 파일이 상수를 export하지 않아
// 여기서 값만 맞춰 다시 선언한다(온보딩 로직 자체를 가져다 쓰긴엔 화면 구조가 다르다).
const NICKNAME_MIN = 2;
const NICKNAME_MAX = 10;

const NOTIF_KEY = "veg-notifications-enabled-v1";
function readNotifEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(NOTIF_KEY) !== "0";
}

type Sheet = "nickname" | "district" | "avatar" | "withdraw" | null;

// F05-1 설정 화면 — 계정(닉네임·동네·프로필 이미지) / 알림 전체 on-off / 약관·버전·문의(더미) /
// 로그아웃·탈퇴. 지금까지 마이페이지엔 회원 관리가 통째로 없었다.
export function SettingsView() {
  const router = useRouter();
  const { nickname, avatar, district } = useOnboarding();
  const districts = useDistricts();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [districtView, setDistrictView] = useState<"list" | "add">("list");
  const [notifEnabled, setNotifEnabled] = useState(true);

  // 알림 on/off는 이 화면에서만 쓰는 단순 설정이라 별도 스토어 파일을 새로 만들지 않고
  // localStorage를 직접 읽고 쓴다(다른 화면이 구독할 필요가 없다).
  useEffect(() => {
    setNotifEnabled(readNotifEnabled());
  }, []);

  function handleNotifChange(next: boolean) {
    setNotifEnabled(next);
    try {
      window.localStorage.setItem(NOTIF_KEY, next ? "1" : "0");
    } catch {
      // 프라이빗 모드 등 저장 실패 — 세션 내 상태만 유지
    }
  }

  function closeSheet() {
    setSheet(null);
    setDistrictView("list");
  }

  function handlePickDistrict(name: string) {
    addDistrict(name);
    setActiveDistrict(name);
    setDistrictView("list");
  }

  // 로그아웃 — 이 프로토타입엔 계정 서버가 없어 "완전히 다른 사람이 된다"는 의미가 없다.
  // 대신 온보딩을 다시 거치게(completed=false) 해 디자이너가 재진입 플로우를 확인할 때 쓴다.
  // 찜·제보 등 기기 데이터는 남는다 — 데이터까지 지우는 건 탈퇴의 역할.
  function handleLogout() {
    setOnboarding({ completed: false });
    router.push("/prototype/onboarding");
  }

  // 탈퇴 — 백엔드가 없어 "이 기기가 쌓은 걸 전부 지운다"로 구현한다. 이 앱 store는 전부
  // "veg-" 접두사를 쓰므로(각 _lib 스토어 파일의 STORAGE_KEY) 접두사로 일괄 삭제하면
  // 새 스토어가 추가돼도 이 화면을 다시 고칠 필요가 없다.
  function handleWithdraw() {
    const keys = Object.keys(window.localStorage).filter((k) => k.startsWith("veg-"));
    keys.forEach((k) => window.localStorage.removeItem(k));
    // 하드 내비게이션이라야 실제로 지워진다 — 각 스토어가 모듈 스코프에 스냅샷 캐시를 들고 있어
    // 클라 라우팅으로 넘어가면 localStorage만 비고 화면은 지운 데이터를 계속 보여준다.
    window.location.href = "/prototype/onboarding";
  }

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection title="계정">
        <SettingsRow label="닉네임" value={nickname || "미설정"} onClick={() => setSheet("nickname")} />
        <SettingsRow
          label="동네"
          value={`${districts.length}개 등록`}
          onClick={() => setSheet("district")}
        />
        <SettingsRow
          label="프로필 이미지"
          value={<ProfileAvatar avatarId={avatar} size={28} />}
          onClick={() => setSheet("avatar")}
        />
      </SettingsSection>

      <SettingsSection title="알림">
        <div className="flex h-14 items-center justify-between px-1">
          <span className="text-body-16-regular text-fg-neutral">알림 받기</span>
          <Switch checked={notifEnabled} onCheckedChange={handleNotifChange} aria-label="알림 전체 켜기/끄기" />
        </div>
      </SettingsSection>

      <SettingsSection title="정보">
        <StaticRow label="이용약관" value="준비 중" />
        <StaticRow label="개인정보 처리방침" value="준비 중" />
        <StaticRow label="버전" value="1.0.0" />
        <StaticRow label="문의하기" value="준비 중" />
      </SettingsSection>

      <div className="flex flex-col gap-2 pt-2">
        <ActionButton type="button" variant="neutralWeak" size="large" className="w-full" onClick={handleLogout}>
          로그아웃
        </ActionButton>
        <button
          type="button"
          onClick={() => setSheet("withdraw")}
          className="h-11 text-center text-body-14-regular text-fg-neutral-muted underline underline-offset-2"
        >
          탈퇴하기
        </button>
      </div>

      <BottomSheetRoot open={sheet !== null} onOpenChange={(next) => !next && closeSheet()}>
        {sheet === "nickname" && <NicknameSheetBody current={nickname} onDone={closeSheet} />}

        {sheet === "district" && (
          <BottomSheetContent title={districtView === "list" ? "동네 관리" : "동네 추가"} showHandle>
            <BottomSheetBody className="flex flex-col gap-2 pb-4">
              {districtView === "list" ? (
                <>
                  <ul className="flex flex-col">
                    {districts.map((name) => {
                      const active = name === district;
                      return (
                        <li key={name} className="flex h-12 items-center justify-between gap-2">
                          <span
                            className={
                              active
                                ? "text-body-16-semibold text-fg-brand-contrast"
                                : "text-body-16-regular text-fg-neutral"
                            }
                          >
                            {name}
                            {active && (
                              <span className="ml-2 text-caption-12-regular text-fg-brand-contrast">
                                현재 동네
                              </span>
                            )}
                          </span>
                          {!active && (
                            <span className="flex shrink-0 items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setActiveDistrict(name)}
                                className="text-body-14-medium text-fg-neutral-muted active:opacity-70"
                              >
                                활성화
                              </button>
                              <button
                                type="button"
                                onClick={() => removeDistrict(name)}
                                aria-label={`${name} 등록 해제`}
                                className="text-body-14-medium text-fg-critical active:opacity-70"
                              >
                                해제
                              </button>
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {districts.length < 3 && (
                    <button
                      type="button"
                      onClick={() => setDistrictView("add")}
                      className="flex h-12 w-full items-center rounded-xl bg-bg-neutral-weak px-4 text-left text-body-14-medium text-fg-neutral active:bg-bg-neutral-weak-pressed"
                    >
                      동네 추가 (최대 3개)
                    </button>
                  )}
                </>
              ) : (
                <RegionPicker anchorDistrict={district} onSelect={handlePickDistrict} />
              )}
            </BottomSheetBody>
          </BottomSheetContent>
        )}

        {sheet === "avatar" && (
          <BottomSheetContent title="프로필 이미지" showHandle>
            <BottomSheetBody className="pb-4">
              <div className="grid grid-cols-4 gap-3">
                <AvatarOption
                  selected={!avatar}
                  onSelect={() => {
                    setOnboarding({ avatar: "" });
                    closeSheet();
                  }}
                />
                {AVATAR_OPTIONS.map((option) => (
                  <AvatarOption
                    key={option.id}
                    id={option.id}
                    label={option.label}
                    selected={avatar === option.id}
                    onSelect={() => {
                      setOnboarding({ avatar: option.id });
                      closeSheet();
                    }}
                  />
                ))}
              </div>
            </BottomSheetBody>
          </BottomSheetContent>
        )}

        {sheet === "withdraw" && (
          <BottomSheetContent
            title="정말 탈퇴하시겠어요?"
            description="찜·제보·구매 기록 등 이 기기에 저장된 모든 정보가 삭제되고 되돌릴 수 없어요."
          >
            <BottomSheetBody className="flex flex-col gap-2 pb-4">
              <ActionButton
                type="button"
                variant="criticalSolid"
                size="large"
                className="w-full"
                onClick={handleWithdraw}
              >
                탈퇴하기
              </ActionButton>
              <ActionButton type="button" variant="neutralWeak" size="large" className="w-full" onClick={closeSheet}>
                취소
              </ActionButton>
            </BottomSheetBody>
          </BottomSheetContent>
        )}
      </BottomSheetRoot>
    </div>
  );
}

function NicknameSheetBody({ current, onDone }: { current: string; onDone: () => void }) {
  const [value, setValue] = useState(current);
  const trimmed = value.trim();
  const valid = trimmed.length >= NICKNAME_MIN && trimmed.length <= NICKNAME_MAX;

  function handleSave() {
    if (!valid) return;
    setOnboarding({ nickname: trimmed });
    onDone();
  }

  return (
    <BottomSheetContent title="닉네임 변경" showHandle>
      <BottomSheetBody className="flex flex-col gap-4 pb-4">
        <TextField
          value={value}
          onValueChange={(v) => setValue(v.value)}
          maxGraphemeCount={NICKNAME_MAX}
          invalid={value.length > 0 && !valid}
          errorMessage={`${NICKNAME_MIN}자 이상 입력해 주세요`}
        >
          <TextFieldInput placeholder="닉네임" aria-label="닉네임" autoFocus />
        </TextField>
        <ActionButton
          type="button"
          variant="neutralSolid"
          size="large"
          className="w-full"
          disabled={!valid}
          onClick={handleSave}
        >
          저장
        </ActionButton>
      </BottomSheetBody>
    </BottomSheetContent>
  );
}

function AvatarOption({
  id,
  label,
  selected,
  onSelect,
}: {
  id?: string;
  label?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={label ?? "기본 아이콘"}
      className={`flex flex-col items-center gap-1 rounded-2xl p-2 ${
        selected ? "bg-bg-brand-weak" : ""
      }`}
    >
      <ProfileAvatar avatarId={id} size={48} />
    </button>
  );
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-2">
      <h2 className="text-body-14-medium text-fg-neutral-muted">{title}</h2>
      <div className="flex flex-col rounded-2xl bg-bg-neutral-weak px-4">{children}</div>
    </section>
  );
}

function SettingsRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 items-center justify-between gap-3 border-b border-bg-layer-default text-left last:border-b-0 active:opacity-70"
    >
      <span className="text-body-16-regular text-fg-neutral">{label}</span>
      <span className="flex items-center gap-1.5 text-body-14-regular text-fg-neutral-muted">
        {value}
        <IconChevronRightLine className="size-4" aria-hidden="true" />
      </span>
    </button>
  );
}

function StaticRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-14 items-center justify-between gap-3 border-b border-bg-layer-default last:border-b-0">
      <span className="text-body-16-regular text-fg-neutral">{label}</span>
      <span className="text-body-14-regular text-fg-neutral-muted">{value}</span>
    </div>
  );
}
