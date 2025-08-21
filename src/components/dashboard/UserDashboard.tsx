// UserDashboard.tsx
import { navigate } from "astro:transitions/client";
import { useEffect, useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";

import { pb } from "../../lib/pocketbase";
import { $user, updateUser } from "../../lib/stores/userStore";

import Sidebar from "./Sidebar";
import UserAccount from "./user/UserAccount";
import UserSubscription from "./user/UserSubscription";
import UserSetting from "./user/UserSetting";
import UserDocument from "./user/UserDocument";
import UserCourse from "./user/UserCourse";

export default function UserDashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<string>("UserAccount");
  const [isClientReady, setIsClientReady] = useState(false);

  const user = useStore($user);
  const isProfileCompleted = user.profileCompleted;

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  // --- EFFET N°1 : Vérification de l'authentification (ne change pas) ---
  useEffect(() => {
    const isValid = pb.authStore.isValid;
    if (!isValid) {
      navigate("/ConnexionInscription");
    }
  }, []);

  useEffect(() => {
    const confirmEmailVerification = async () => {
      const token = window.location.search.substring(1);

      if (token) {
        try {
          await pb.collection("users").confirmVerification(token);

          const resAuthRefresh = await pb.collection("users").authRefresh();

          updateUser(resAuthRefresh.record);
        } catch (error) {
          console.error("La vérification de l'email a échoué:", error);
          alert(
            "La vérification de l'email a échoué. Le lien est peut-être invalide ou a expiré.",
          );
        } finally {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }
      }
    };

    confirmEmailVerification();
  }, []); // Le tableau vide [] assure que ce code ne s'exécute qu'une seule fois au chargement.

  if (!isClientReady || !user.id) {
    return (
      <div class="flex justify-center items-center h-screen font-bold text-xl">
        Chargement...
      </div>
    );
  }
  const renderPage = () => {
    switch (currentPage) {
      case "UserAccount":
        return <UserAccount user={user} />;
      case "UserSubscription":
        return <UserSubscription />;
      case "UserDocument":
        return <UserDocument />;
      case "UserCourse":
        return <UserCourse />;
      case "UserSetting":
        return <UserSetting />;
      default:
        return <UserAccount user={user} />;
    }
  };

  // --- EFFET N°3 : Gestion de la page par défaut (ne change pas) ---
  useEffect(() => {
    if (!isProfileCompleted) {
      setCurrentPage("UserAccount");
    }
  }, [isProfileCompleted]);

  return (
    <Sidebar
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onPageChange={setCurrentPage}
    >
      {renderPage()}
    </Sidebar>
  );
}
