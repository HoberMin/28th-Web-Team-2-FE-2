import { ItemComment } from "../../_components/item-comment";
import type { Story } from "./types";

function ItemCommentStory() {
  return (
    <div className="w-full max-w-89.5">
      <ItemComment
        nickname="떡볶이킬러"
        rank="sprout"
        age="3시간 전"
        profileColor="green"
        body="사장님이 친절해요~ 사장님이 친절해요~ 사장님이 친절해요~  사장님이 친절해요~"
      />
    </div>
  );
}

export const itemCommentStory: Story = {
  id: "item-comment",
  title: "Item Comment",
  group: "컴포넌트",
  figma: "node 690-10760",
  description: "가게 상세의 제보자 프로필·등급·댓글을 묶은 행이에요.",
  Component: ItemCommentStory,
};
