import { navigate } from "astro:transitions/client";
import { useEffect, useState } from "preact/hooks";

import { pb } from "../../lib/pocketbase";
import ForgotPasswordForm from "./ForgotPasswordForm";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function ConnexionInscription() {
  const [isConnexion, setIsConnexion] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleConnexionClick = () => {
    setIsConnexion(true);
    setIsForgotPassword(false);
  };

  const handleInscriptionClick = () => {
    setIsConnexion(false);
    setIsForgotPassword(false);
  };

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setIsConnexion(true);
  };

  useEffect(() => {
    if (pb.authStore.isValid) {
      navigate("/private/Dashboard");
    }
  }, []);

  return (
    <div className="w-full md:w-96">
      <div className="flex items-center justify-center">
        {isForgotPassword ? (
          <h4 className="mb-5">Réinitialiser votre mot de passe</h4>
        ) : isConnexion ? (
          <h4 className="mb-5">Pour selectionner un cours, connectez-vous !</h4>
        ) : (
          <h4 className="mb-5">Pour selectionner un cours, inscrivez-vous !</h4>
        )}
      </div>
      {!isForgotPassword && (
        <nav className="flex rounded-2xl">
          <button
            className={`grow cursor-pointer rounded-2xl px-4 py-2 text-center ${
              isConnexion ? "bg-madEncart text-white" : "hover:bg-gray-200"
            } focus:outline-none`}
            onClick={handleConnexionClick}
          >
            Connexion
          </button>
          <button
            className={`grow cursor-pointer rounded-2xl px-4 py-2 text-center ${
              !isConnexion ? "bg-madEncart text-white" : "hover:bg-gray-200"
            } focus:outline-none`}
            onClick={handleInscriptionClick}
          >
            Inscription
          </button>
        </nav>
      )}
      <div className="px-4 py-4">
        {isForgotPassword ? (
          <ForgotPasswordForm onBack={handleBackToLogin} />
        ) : isConnexion ? (
          <LoginForm onForgotPassword={handleForgotPasswordClick} />
        ) : (
          <SignupForm />
        )}
      </div>
    </div>
  );
}
