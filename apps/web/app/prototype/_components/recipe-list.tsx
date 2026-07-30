import { getRecipesFor } from "../_lib/recipes";

// 레시피 연계 — 콘텐츠는 예시/더미(실제 레시피 제휴 없음). 인터랙션 없어 서버 렌더.
// 제목·접기는 페이지의 CollapsibleSection이 담당한다(판단 정보와 위계를 가르기 위해).
export function RecipeList({ vegetableId }: { vegetableId: string }) {
  const recipes = getRecipesFor(vegetableId);
  if (recipes.length === 0) return null;

  return (
    <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {recipes.map((r) => (
          <li
            key={r.id}
            className="flex shrink-0 flex-col gap-1 rounded-2xl bg-bg-neutral-weak px-4 py-3"
          >
            <span className="text-body-14-medium text-fg-neutral">{r.title}</span>
            <span className="text-caption-12-regular text-fg-neutral-subtle">{r.minutes}분</span>
          </li>
        ))}
    </ul>
  );
}
