import { redirect } from "next/navigation";

// 홈 접근 = 닉네임 입력부터 (UT 프로토타입 진입점).
export default function Home() {
  redirect("/prototype");
}
