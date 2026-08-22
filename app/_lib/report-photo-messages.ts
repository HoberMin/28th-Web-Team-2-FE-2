// 제보 사진·인식 실패 문구의 단일 소스.
//
// 같은 실패를 세 곳이 말한다 — 폼(`app/report/_report-form.tsx`)·Server Action
// (`app/report/_actions.ts`)·BFF 라우트(`app/api/report-image-analysis`). 각자 문구를
// 들고 있으면 같은 상황에 다른 말이 뜨므로 여기 한 곳만 본다.
//
// **위치가 `app/report/_lib/`가 아닌 이유**: BFF 라우트(`app/api/*`)가 화면 폴더를 import하면
// `api-patterns` 3층 규약의 의존 방향이 뒤집힌다. 지금은 순수 상수·순수 함수라 피해가 없지만,
// 형제 모듈(`report/_lib/photo-draft.ts`)이 `"use client"`라 나중에 재수출 한 줄이면 라우트가
// 클라이언트 모듈을 끌어온다. 그래서 양쪽이 같이 볼 수 있는 `app/_lib/`에 둔다.
//
// ⚠️ **원본 오류 메시지를 화면에 그대로 내보내지 않는다.** 예전엔 인식 실패 시 `error.message`를
//    그대로 렌더해서, 프로덕션에서 Server Action이 예기치 못한 오류를 던지면 Next의 영문
//    안내문("An error occurred in the Server Components render…")이 빨간 글씨로 통째로 떴다.
//    원문은 `console.error`로만 남기고 사용자에게는 아래 문구만 보여준다.
//
// 문구 기준: **사용자가 취할 행동이 다르면 다른 문구, 같으면 한 문구.**
//   · 다시 선택 / 다른 사진 고르기 / 다시 시도 / 직접 입력 / 품목 재선택 — 이 5가지만 구분한다.
//   · Spring 502·503·파싱 실패는 사용자가 할 일이 같아 `analyze` 하나로 합쳤다.
//   · Figma에 사진 실패 상태 시안이 없다(`_report-form.tsx` 머리말) — 문구만 둔다.
//
// 예외 1건: BFF 라우트의 **요청 검증** 400(본문이 JSON이 아니거나 스키마 불일치)은 우리 코드
// 버그라 사용자 안내가 아니라 진단용이다. 그래서 라우트가 자체 문구를 쓰고, 폼은 그 400을
// `analyze`로 표시한다 — 사용자가 할 일은 어느 쪽이든 "직접 입력"이라 같다.

export const PHOTO_MESSAGE = {
  /** 고른 사진을 화면에 띄우지 못했다(파일 손상·객체 URL 실패). */
  load: "사진을 불러오지 못했어요. 다시 선택해 주세요.",
  /**
   * 업로드 실패 — 저장소 장애(503)·네트워크·알 수 없는 오류.
   *
   * **"사진을 삭제한 뒤"를 반드시 남긴다.** 업로드가 안 되면 `handleSubmit`이 early return해
   * 제보 자체가 막히므로(사진 없는 제보만 통과한다), 사진 삭제가 유일한 탈출구다.
   * 이 안내를 지우면 화면 전체가 재시도만 권하고 되는 방법을 아무도 말하지 않는다.
   */
  upload: "사진을 올리지 못했어요. 다시 시도하거나 사진을 삭제한 뒤 제보해 주세요.",
  /**
   * 서버가 사진 형식을 거부(400). 재시도는 같은 파일로 같은 결과라 **다른 사진**을 권한다.
   * (클라이언트 `validateUploadImage`가 대부분 먼저 걸러 여기까지 오는 일은 드물다)
   */
  invalidFormat: "사진 형식을 확인해 주세요. 다른 사진을 골라 주세요.",
  /** 인식 실패 전부. 인식은 부가 기능이라 직접 입력으로 안내하고 폼은 그대로 쓸 수 있다. */
  analyze: "사진에서 값을 읽지 못했어요. 직접 입력해 주세요.",
  /** 인식만 로그인이 필요한 경우 — 제보 자체를 막지 않으므로 직접 입력을 같이 안내한다. */
  analyzeLogin: "로그인하면 사진 인식을 쓸 수 있어요. 값은 직접 입력해도 돼요.",
  /** 인식 힌트로 넘긴 품목을 서버가 못 찾음(404). 필요한 조치가 달라 따로 둔다. */
  itemNotFound: "선택한 품목을 찾지 못했어요. 품목을 다시 선택해 주세요.",
} as const;

/**
 * 사진 인식 실패를 HTTP status 하나로 문구에 매핑한다.
 *
 * 폼과 BFF 라우트가 같은 함수를 쓴다. 다만 **현재 폼은 응답 body의 `message`를 읽지 않고**
 * status로 직접 이 함수를 호출한다(body 형태를 신뢰하지 않는 이 레포 방침 —
 * `api-error.ts` 머리말). 함수를 공유하는 값은 "폼이 body를 읽기로 바뀌어도 문구가
 * 갈리지 않는다"는 것이다.
 */
export function photoAnalysisMessage(status: number): string {
  if (status === 401) return PHOTO_MESSAGE.analyzeLogin;
  if (status === 404) return PHOTO_MESSAGE.itemNotFound;
  return PHOTO_MESSAGE.analyze;
}
