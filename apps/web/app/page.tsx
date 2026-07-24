import { redirect } from "next/navigation";

// 홈 접근 = 야채 시세 프로토타입 진입점.
export default function Home() {
  redirect("/prototype");
}
