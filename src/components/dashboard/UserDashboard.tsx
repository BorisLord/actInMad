import { useStore } from "@nanostores/preact";
import { navigate } from "astro:transitions/client";
import { useEffect, useState } from "preact/hooks";

import { pb } from "../../lib/pocketbase";
import { $user, updateUser } from "../../lib/stores/userStore";
import DashboardNav from "./DashboardNav";
import CourseDetail from "./user/CourseDetail";
import UserAccount from "./user/UserAccount";
import UserCart from "./user/UserCart";
import UserCourse from "./user/UserCourse";
import UserDocument from "./user/UserDocument";
import UserSetting from "./user/UserSetting";
import UserSubscription from "./user/UserSubscription";


export default function UserDashboard() {
  const [currentPage, setCurrentPage] = useState<string>("UserAccount");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const user = useStore($user);

  const isLocked = !user.profileCompleted || !user.verified;

  useEffect(() => {
    setIsClientReady(true);
    if (!pb.authStore.isValid) {
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
    if (isClientReady && isLocked) {
      setCurrentPage("UserAccount");
    }
  }, [isClientReady, isLocked]);

  const handleSelectCourse = (id: string) => {
    setSelectedCourseId(id);
  };

  const handleBackToList = () => {
    setSelectedCourseId(null);
  };

  const renderPage = () => {
    if (selectedCourseId) {
      return (
        <CourseDetail courseId={selectedCourseId} onBack={handleBackToList} />
      );
    }

    switch (currentPage) {
      case "UserAccount":
        return <UserAccount user={user} />;
      case "UserSubscription":
        return <UserSubscription onSelectCourse={handleSelectCourse} />;
      case "UserDocument":
        return <UserDocument />;
      case "UserCourse":
        return <UserCourse />;
      case "UserSetting":
        return <UserSetting />;
      case "UserCart":
        return <UserCart />;
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
        <DashboardNav
          currentPage={currentPage}
          onPageChange={(page) => {
            if (isLocked) {
              setCurrentPage("UserAccount");
            } else {
              setCurrentPage(page);
            }
            setSelectedCourseId(null);
          }}
        />
      </header>

      <main className="mx-auto max-w-screen-xl p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </main>
    </div>
  );
}
