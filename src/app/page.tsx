import { redirect } from "next/navigation";
import { DEMO_MODE } from "@/demo/demo-config";

export default function HomePage() {
  redirect(DEMO_MODE ? "/seller/home" : "/seller");
}
