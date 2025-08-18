import { $user } from "../../lib/stores/userStore";

export default function Dashboard() {
  console.log("user DASHBOARD", $user.get());
}
