import { describe, expect, it } from "vitest";

import { PHOTO_MESSAGE, photoAnalysisMessage } from "./report-photo-messages";

// 이 파일의 목적은 문구가 **다시 갈리는 것**을 막는 것이다. 사진 실패 문구는 폼·Server
// Action·BFF 라우트 세 곳이 같이 쓰는데, 예전엔 각자 들고 있어서 같은 상황에 다른 말이 떴다.
describe("사진 인식 실패 문구", () => {
  it("로그인이 필요한 401은 직접 입력 안내를 함께 준다", () => {
    // 인식은 부가 기능이라 로그인이 없어도 제보 자체는 된다 — 막힌 것처럼 말하면 안 된다.
    expect(photoAnalysisMessage(401)).toBe(PHOTO_MESSAGE.analyzeLogin);
    expect(photoAnalysisMessage(401)).toContain("직접 입력");
  });

  it("품목을 못 찾은 404만 품목 재선택을 안내한다", () => {
    expect(photoAnalysisMessage(404)).toBe(PHOTO_MESSAGE.itemNotFound);
  });

  it("나머지 실패(400·500·502·503)는 한 문구로 합친다", () => {
    // 사용자가 할 일이 전부 "직접 입력"이라 분기를 늘리지 않는다.
    for (const status of [400, 500, 502, 503]) {
      expect(photoAnalysisMessage(status)).toBe(PHOTO_MESSAGE.analyze);
    }
  });
});

describe("사진 업로드 실패 문구", () => {
  it("업로드 실패 안내는 사진 삭제라는 탈출구를 반드시 남긴다", () => {
    // 업로드가 안 되면 제출이 early return하므로 사진 삭제가 유일하게 제보를 통과시키는 길이다.
    // 이 문구에서 그 안내를 빼면 화면 전체가 재시도만 권하고 되는 방법을 아무도 말하지 않는다.
    expect(PHOTO_MESSAGE.upload).toContain("삭제");
  });

  it("형식 오류는 재시도가 아니라 다른 사진을 권한다", () => {
    // 같은 파일로 다시 올리면 같은 400이다 — "다시 시도"는 사용자를 루프에 넣는다.
    expect(PHOTO_MESSAGE.invalidFormat).not.toContain("다시 시도");
    expect(PHOTO_MESSAGE.invalidFormat).toContain("다른 사진");
  });
});
