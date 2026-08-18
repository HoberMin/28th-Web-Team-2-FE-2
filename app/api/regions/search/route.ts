import { regionSearchRequestSchema } from "@/app/_lib/api/schemas/regions";
import { searchRegions } from "@/app/_lib/api/server/regions";
import { regionApiErrorResponse } from "../_api-error";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const keyword = new URL(request.url).searchParams.get("keyword") ?? "";
  const parsed = regionSearchRequestSchema.safeParse({ keyword });

  if (!parsed.success) {
    return Response.json(
      { message: "한글 동 이름을 두 글자 이상 입력해 주세요." },
      { status: 400 },
    );
  }

  try {
    return Response.json(await searchRegions(parsed.data.keyword));
  } catch (error) {
    return regionApiErrorResponse(error, "검색어가 올바르지 않아요.");
  }
}
