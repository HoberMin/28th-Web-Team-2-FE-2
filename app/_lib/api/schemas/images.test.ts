import { describe, expect, it } from "vitest";
import {
  MAX_UPLOAD_IMAGE_BYTES,
  imageUploadEnvelopeSchema,
  uploadImageValidationMessage,
  validateUploadImage,
} from "./images";

describe("image upload schema", () => {
  it.each(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"])(
    "5MB 이하 %s 파일을 허용한다",
    (type) => {
    expect(validateUploadImage({ size: MAX_UPLOAD_IMAGE_BYTES, type })).toBeNull();
    },
  );

  it.each([
    [{ size: 0, type: "image/jpeg" }, "empty"],
    [{ size: MAX_UPLOAD_IMAGE_BYTES + 1, type: "image/jpeg" }, "tooLarge"],
    [{ size: 1, type: "text/plain" }, "unsupportedType"],
    [{ size: 1, type: "" }, "unsupportedType"],
  ] as const)("스펙에 맞지 않는 파일을 거부한다: %s", (file, expected) => {
    expect(validateUploadImage(file)).toBe(expected);
    expect(uploadImageValidationMessage(expected)).not.toHaveLength(0);
  });

  it("201 envelope의 data.imageUrl을 검증한다", () => {
    expect(
      imageUploadEnvelopeSchema.parse({
        code: "SUCCESS",
        message: "요청이 성공적으로 처리되었습니다.",
        data: { imageUrl: "https://marketgo-images.example/images/report.jpg" },
      }),
    ).toMatchObject({ data: { imageUrl: "https://marketgo-images.example/images/report.jpg" } });
  });
});
