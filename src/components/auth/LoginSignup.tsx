import { useState } from "preact/hooks";
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

  return (
    <div className="w-full md:w-96">
      <div className="flex justify-center items-center">
        {isConnexion ? (
          <h4 className="mb-5">Pour selectionner un cours, connectez vous !</h4>
        ) : (
          <h4 className="mb-5">Pour selectionner un cours, inscrivez vous !</h4>
        )}
      </div>
      <nav className="flex rounded-2xl">
        <button
          className={`flex-grow py-2 px-4 text-center rounded-2xl cursor-pointer ${
            isConnexion ? "bg-madEncart text-white" : "hover:bg-gray-200"
          } focus:outline-none`}
          onClick={handleConnexionClick}
        >
          Connexion
        </button>
        <button
          className={`flex-grow py-2 px-4 text-center rounded-2xl cursor-pointer ${
            !isConnexion ? "bg-madEncart text-white" : "hover:bg-gray-200"
          } focus:outline-none`}
          onClick={handleInscriptionClick}
        >
          Inscription
        </button>
      </nav>
      <div className="py-4 px-4">
        {isConnexion ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
}
