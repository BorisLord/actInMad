// import { $user } from "../../lib/stores/userStore";
import UserAccount from "./user/UserAccount";
import { pb } from "../../lib/pocketbase";
import { navigate } from "astro:transitions/client";
import Sidebar from "./Sidebar";
import { useState } from "preact/hooks";

export default function UserDashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const isProfileCompleted = pb.authStore.record?.profileCompleted;

  const isValid = pb.authStore.isValid;
  if (!isValid) {
    navigate("/ConnexionInscription");
  }

  return (
    <Sidebar isOpen={isOpen} setIsOpen={setIsOpen}>
      <div>
        {!isProfileCompleted && (
          <UserAccount isProfileCompleted={isProfileCompleted} />
        )}
        {/* <div>
        <p>Bienvenue sur votre tableau de bord !</p>
        </div> */}
      </div>
    </Sidebar>
  );
}
