import { getAccessToken } from "@/app/_lib/api/auth/session";
import { regionIdSchema } from "@/app/_lib/api/schemas/regions";
import { setCurrentUserRegion } from "@/app/_lib/api/server/regions";
import { userRegionsApiErrorResponse } from "../../../_user-regions-error";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ regionId: string }>;
}

export async function PUT(_request: Request, { params }: RouteContext): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    return Response.json({ message: "로그인이 필요해요." }, { status: 401 });
  }

  const { regionId } = await params;
  const parsed = regionIdSchema.safeParse(regionId);
  if (!parsed.success) {
    return Response.json({ message: "법정동 코드가 올바르지 않아요." }, { status: 400 });
  }

  try {
    await setCurrentUserRegion({ regionId: parsed.data, token });
    return new Response(null, { status: 204 });
  } catch (error) {
    return userRegionsApiErrorResponse(error, "법정동 코드가 올바르지 않아요.");
  }
}
