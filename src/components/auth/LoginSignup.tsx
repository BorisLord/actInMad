import { navigate } from "astro:transitions/client";
import { useState } from "preact/hooks";

import { pb } from "../../lib/pocketbase";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function ConnexionInscription() {
  const [isConnexion, setIsConnexion] = useState(true);

  const handleConnexionClick = () => {
    setIsConnexion(true);
  };

  const handleInscriptionClick = () => {
    setIsConnexion(false);
  };

  if (pb.authStore.isValid) {
    navigate("/private/Dashboard");
    return;
  }

  return (
    <div className="w-full md:w-96">
      <div className="flex items-center justify-center">
        {isConnexion ? (
          <h4 className="mb-5">Pour selectionner un cours, connectez-vous !</h4>
        ) : (
          <h4 className="mb-5">Pour selectionner un cours, inscrivez-vous !</h4>
        )}
      </div>
      <nav className="flex rounded-2xl">
        <button
          className={`flex-grow cursor-pointer rounded-2xl px-4 py-2 text-center ${
            isConnexion ? "bg-madEncart text-white" : "hover:bg-gray-200"
          } focus:outline-none`}
          onClick={handleConnexionClick}
        >
          Connexion
        </button>
        <button
          className={`flex-grow cursor-pointer rounded-2xl px-4 py-2 text-center ${
            !isConnexion ? "bg-madEncart text-white" : "hover:bg-gray-200"
          } focus:outline-none`}
          onClick={handleInscriptionClick}
        >
          Inscription
        </button>
      </nav>
      <div className="px-4 py-4">
        {isConnexion ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
}
