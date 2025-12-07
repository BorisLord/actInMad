import type { FormEvent } from "preact/compat";
import { useState } from "preact/hooks";

import { pb } from "../../lib/pocketbase";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await pb.collection("users").requestPasswordReset(email);
      setMessage("Un email de réinitialisation a été envoyé à votre adresse.");
      setEmail("");
    } catch (err: any) {
      setError(
        err.message || "Une erreur est survenue lors de l'envoi de l'email.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      class="flex w-full max-w-sm flex-col gap-4 p-4 text-sm md:text-base"
    >
      <div>
        <label htmlFor="email" class="mb-1 block font-semibold">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
          required
          class="w-full rounded-xl border border-gray-300 p-2"
          placeholder="Entrez votre adresse email"
        />
      </div>

      {message && (
        <div class="rounded-lg bg-green-100 p-3 text-green-700">{message}</div>
      )}

      {error && (
        <div class="rounded-lg bg-red-100 p-3 text-red-700">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        class="cursor-pointer rounded-xl bg-madRed px-6 py-2 font-bold text-white transition hover:bg-madEncart disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
      </button>

      <button
        type="button"
        onClick={onBack}
        class="text-center text-sm text-gray-600 underline hover:text-gray-800"
      >
        Retour à la connexion
      </button>
    </form>
  );
};

export default ForgotPasswordForm;
