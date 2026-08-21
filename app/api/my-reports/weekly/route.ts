import { getAccessToken } from "@/app/_lib/api/auth/session";
import { getMyWeeklyReports } from "@/app/_lib/api/server/my-reports";
import { myReportsApiErrorResponse } from "../_my-reports-error";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    return Response.json({ message: "로그인이 필요해요." }, { status: 401 });
  }

  try {
    return Response.json(await getMyWeeklyReports(token));
  } catch (error) {
    return myReportsApiErrorResponse(error, "요청이 올바르지 않아요.");
  }
}
