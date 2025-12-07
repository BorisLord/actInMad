import { Icon } from "@iconify/react";
import { navigate } from "astro:transitions/client";
import type { FormEvent } from "preact/compat";
import { useEffect, useState } from "preact/hooks";

import { pb } from "../../lib/pocketbase";

const ResetPasswordForm = () => {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    // Récupérer le token depuis l'URL
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Token manquant ou invalide");
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await pb
        .collection("users")
        .confirmPasswordReset(token, password, passwordConfirm);
      setMessage("Mot de passe réinitialisé avec succès !");

      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate("/ConnexionInscription");
      }, 2000);
    } catch (err: any) {
      setError(
        err.message || "Une erreur est survenue lors de la réinitialisation.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div class="w-full md:w-96">
        <div class="flex items-center justify-center">
          <h4 class="mb-5">Réinitialiser le mot de passe</h4>
        </div>
        <div class="px-4 py-4">
          <div class="rounded-lg bg-red-100 p-3 text-red-700">
            Token manquant ou invalide. Veuillez demander un nouveau lien de
            réinitialisation.
          </div>
          <button
            onClick={() => navigate("/ConnexionInscription")}
            class="mt-4 w-full cursor-pointer rounded-xl bg-madRed px-6 py-2 font-bold text-white transition hover:bg-madEncart"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="w-full md:w-96">
      <div class="flex items-center justify-center">
        <h4 class="mb-5">Réinitialiser votre mot de passe</h4>
      </div>
      <div class="px-4 py-4">
        <form onSubmit={handleSubmit} class="flex flex-col gap-4">
          <div>
            <label htmlFor="password" class="mb-1 block font-semibold">
              Nouveau mot de passe *
            </label>
            <div class="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onInput={(e) =>
                  setPassword((e.target as HTMLInputElement).value)
                }
                required
                minLength={8}
                class="w-full rounded-xl border border-gray-300 p-2 pr-10"
                placeholder="Minimum 8 caractères"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
              >
                {showPassword ? (
                  <Icon icon="lucide:eye" />
                ) : (
                  <Icon icon="lucide:eye-closed" />
                )}
              </button>
            </div>
          </div>{" "}
          <div>
            <label htmlFor="passwordConfirm" class="mb-1 block font-semibold">
              Confirmer le mot de passe *
            </label>
            <div class="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="passwordConfirm"
                name="passwordConfirm"
                value={passwordConfirm}
                onInput={(e) =>
                  setPasswordConfirm((e.target as HTMLInputElement).value)
                }
                required
                minLength={8}
                class="w-full rounded-xl border border-gray-300 p-2 pr-10"
                placeholder="Confirmez votre mot de passe"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
              >
                {showPassword ? (
                  <Icon icon="lucide:eye" />
                ) : (
                  <Icon icon="lucide:eye-closed" />
                )}
              </button>
            </div>
          </div>{" "}
          {message && (
            <div class="rounded-lg bg-green-100 p-3 text-green-700">
              {message}
            </div>
          )}
          {error && (
            <div class="rounded-lg bg-red-100 p-3 text-red-700">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            class="cursor-pointer rounded-xl bg-madRed px-6 py-2 font-bold text-white transition hover:bg-madEncart disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/ConnexionInscription")}
            class="text-center text-sm text-gray-600 underline hover:text-gray-800"
          >
            Retour à la connexion
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
