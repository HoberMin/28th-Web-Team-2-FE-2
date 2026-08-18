import { regionSchema } from "@/app/_lib/api/schemas/regions";
import { saveSelectedRegion } from "@/app/_lib/api/server/selected-region";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "선택한 동네 정보가 올바르지 않아요." }, { status: 400 });
  }

  const parsed = regionSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ message: "선택한 동네 정보가 올바르지 않아요." }, { status: 400 });
  }

  await saveSelectedRegion(parsed.data);
  return new Response(null, { status: 204 });
}
