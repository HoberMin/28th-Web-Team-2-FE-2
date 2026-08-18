export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 10;
export const NICKNAME_PATTERN = /^[가-힣A-Za-z0-9]+$/;

export function nicknameValidationMessage(value: string): string {
  const nickname = value.trim();
  if (nickname.length === 0) return "";
  if (nickname.length < NICKNAME_MIN) return `닉네임은 ${NICKNAME_MIN}자 이상이어야 해요.`;
  if (nickname.length > NICKNAME_MAX) return `닉네임은 ${NICKNAME_MAX}자까지 쓸 수 있어요.`;
  if (!NICKNAME_PATTERN.test(nickname)) return "한글, 영문, 숫자만 쓸 수 있어요.";
  return "";
}
