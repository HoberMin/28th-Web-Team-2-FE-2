import { getAccessToken } from "@/app/_lib/api/auth/session";
import { updateMyReportSchema } from "@/app/_lib/api/schemas/my-reports";
import { deleteMyReport, updateMyReport } from "@/app/_lib/api/server/my-reports";
import { myReportsApiErrorResponse } from "../_my-reports-error";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ reportId: string }>;
}

/** 제보 id는 경로 파라미터라 문자열로 온다 — 숫자로 못 읽으면 Spring까지 보내지 않는다. */
async function readReportId(context: RouteContext): Promise<number | null> {
  const { reportId } = await context.params;
  const parsed = Number(reportId);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    return Response.json({ message: "로그인이 필요해요." }, { status: 401 });
  }

  const reportId = await readReportId(context);
  if (reportId === null) {
    return Response.json({ message: "제보 정보가 올바르지 않아요." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "제보 정보가 올바르지 않아요." }, { status: 400 });
  }

  const parsed = updateMyReportSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ message: "제보 정보가 올바르지 않아요." }, { status: 400 });
  }

  try {
    await updateMyReport({ reportId, token, body: parsed.data });
    return new Response(null, { status: 204 });
  } catch (error) {
    return myReportsApiErrorResponse(error, "제보 정보가 올바르지 않아요.");
  }
}

export async function DELETE(_request: Request, context: RouteContext): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    return Response.json({ message: "로그인이 필요해요." }, { status: 401 });
  }

  const reportId = await readReportId(context);
  if (reportId === null) {
    return Response.json({ message: "제보 정보가 올바르지 않아요." }, { status: 400 });
  }

  try {
    await deleteMyReport({ reportId, token });
    return new Response(null, { status: 204 });
  } catch (error) {
    return myReportsApiErrorResponse(error, "제보 정보가 올바르지 않아요.");
  }
}
