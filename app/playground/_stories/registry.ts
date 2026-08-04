import { colorStory } from "./color";
import { radiusStory } from "./radius";
import type { Story } from "./types";
import { typographyStory } from "./typography";

// 스토리 등록부 — 규격(컴포넌트·토큰) 하나 = _stories/ 파일 하나 = 여기 한 줄.
// 디자이너가 새 규격을 작업하면 파일을 추가하고 여기 등록한다 (design-guide.md 플레이그라운드 규약)
//
// 2026-08-05: 컴포넌트 스토리 7종(CTA·CTA Small·CTA Insta·Text Field·Text Field Set·
// Survey Button·Indicator Bar)과 그 구현을 삭제했다. 전신 프로젝트(Looky) Figma 파일에서 온
// 규격이라 현 Design Library(node 126-1092·171-3737)에 원본이 없었다 — §1-1 "Figma에 있는 규격만".
// 지금 Figma에 있는 건 토큰 3종(Color · Typography · Radius)뿐이므로 이게 전부가 맞다.
// 디자이너가 컴포넌트를 Figma에 올리면 그때 하나씩 추가한다.
export const stories: Story[] = [colorStory, typographyStory, radiusStory];
