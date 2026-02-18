import { redirect } from "next/navigation";

export default function HomePage() {
  // ルートにアクセスしたら /user にリダイレクト
  redirect("/user");
}
