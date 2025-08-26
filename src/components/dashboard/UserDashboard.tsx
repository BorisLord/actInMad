import { useStore } from "@nanostores/preact";
import { navigate } from "astro:transitions/client";
import { useEffect, useState } from "preact/hooks";

import { pb } from "../../lib/pocketbase";
import { $user, updateUser } from "../../lib/stores/userStore";
import DashboardNav from "./DashboardNav";
import UserAccount from "./user/UserAccount";
import UserCourse from "./user/UserCourse";
import UserDocument from "./user/UserDocument";
import UserSetting from "./user/UserSetting";
import UserSubscription from "./user/UserSubscription";

export default function UserDashboard() {
  const [currentPage, setCurrentPage] = useState<string>("UserAccount");
  const [isClientReady, setIsClientReady] = useState(false);
  const user = useStore($user);
  const isProfileCompleted = user.profileCompleted;

  useEffect(() => {
    setIsClientReady(true);
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
  }, []);

  useEffect(() => {
    if (isClientReady && !isProfileCompleted) {
      setCurrentPage("UserAccount");
    }
  }, [isClientReady, isProfileCompleted]);

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

  if (!isClientReady || !user.id) {
    return (
      <div class="flex h-screen items-center justify-center text-xl font-bold">
        Chargement...
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 z-20 border-b border-black/10">
        <DashboardNav currentPage={currentPage} onPageChange={setCurrentPage} />
      </header>

      <main className="mx-auto max-w-screen-xl p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </main>
    </div>
  );
}
