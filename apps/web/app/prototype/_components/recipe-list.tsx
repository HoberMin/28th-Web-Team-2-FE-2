import { getRecipesFor } from "../_lib/recipes";

// 레시피 연계 — 콘텐츠는 예시/더미(실제 레시피 제휴 없음). 인터랙션 없어 서버 렌더.
export function RecipeList({ vegetableId }: { vegetableId: string }) {
  const recipes = getRecipesFor(vegetableId);
  if (recipes.length === 0) return null;

  return (
    <section aria-label="이 야채로 만드는 레시피" className="flex flex-col gap-4 px-4 pt-7">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#141a24]">이 야채로 만드는 레시피</h2>
        <span className="text-caption-12-regular text-fg-neutral-subtle">예시 · 실제 레시피 제휴 아님</span>
      </div>
      <ul className="flex gap-2 overflow-x-auto">
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
    </section>
  );
}
