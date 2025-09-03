import { useStore } from "@nanostores/preact";
import { PUBLIC_PB_URL } from "astro:env/client";
import { useEffect, useState } from "preact/hooks";

import { pb } from "../lib/pocketbase";
import { $user } from "../lib/stores/userStore";

export default function ContactForm() {
  const user = useStore($user);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    isSubscribed: false,
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (pb.authStore.isValid && $user) {
      setForm((prevForm) => ({
        ...prevForm,
        nom: user.firstName || "",
        prenom: user.lastName || "",
        email: user.email || "",
      }));
    }
  }, [$user]);

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value, type } = target;
    const newValue =
      type === "checkbox" && target instanceof HTMLInputElement
        ? target.checked
        : value;
    setForm({ ...form, [name]: newValue });
  };

  const validateEmail = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) {
      setEmailError("Veuillez entrer une adresse email valide.");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    const payload = {
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      inscription: form.isSubscribed,
      message: form.message,
    };

    try {
      const response = await fetch(`${PUBLIC_PB_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSent(true);
        if (!pb.authStore.isValid) {
          setForm({
            nom: "",
            prenom: "",
            email: "",
            isSubscribed: false,
            message: "",
          });
        }
      } else {
        setForm((prevForm) => ({
          ...prevForm,
          inscription: false,
          message: "",
        }));
      }
    } catch (error) {
      alert("Échec de l'envoi du message");
      console.error("Erreur lors de l'envoi :", error);
    }
  };

  return (
    <div class="flex flex-col items-center p-4">
      <div class="mx-auto mt-5 max-w-6xl p-4 text-center md:p-6">
        <h1 class="text-madRed text-2xl md:text-3xl">
          Posez-nous vos questions !
        </h1>
        <h2 class="text-lg md:text-xl">Inscrivez-vous à Act in Mag' !</h2>
        <p class="text-xs text-gray-500 md:text-sm">
          Bug, suggestion ou simple message : nous sommes à l’écoute !
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        class="flex w-full max-w-4xl flex-col gap-4 p-4 text-sm md:text-base"
      >
        {sent && (
          <p class="font-semibold text-green-600">
            Message envoyé avec succès !
          </p>
        )}

        <div class="flex flex-col gap-4 md:flex-row">
          <div class="flex-1">
            <label for="nom" class="mb-1 block font-semibold">
              Nom *
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={form.nom}
              onInput={handleChange}
              autoComplete="on"
              required
              class="w-full rounded-xl border border-gray-300 p-2"
            />
          </div>
          <div class="flex-1">
            <label for="prenom" class="mb-1 block font-semibold">
              Prénom *
            </label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={form.prenom}
              onInput={handleChange}
              autoComplete="on"
              required
              class="w-full rounded-xl border border-gray-300 p-2"
            />
          </div>
        </div>

        <div>
          <label for="email" class="mb-1 block font-semibold">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onInput={handleChange}
            onBlur={validateEmail}
            autoComplete="on"
            required
            class="w-full rounded-xl border border-gray-300 p-2"
          />
          {emailError && <p class="text-madEncart text-sm">{emailError}</p>}
        </div>

        <div>
          <label for="message" class="mb-1 block font-semibold">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={form.message}
            onInput={handleChange}
            class="w-full rounded-xl border border-gray-300 p-2"
          />
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="inscription"
            name="inscription"
            checked={form.isSubscribed}
            onInput={handleChange}
            class="h-4 w-4 rounded-md border-gray-400"
          />
          <label for="inscription" class="text-gray-700">
            Je souhaite m’inscrire à Act in Mag' (la lettre d’information Act in
            Mad)
          </label>
        </div>

        <button
          type="submit"
          class="bg-madRed text-madBack self-start rounded-xl px-6 py-2 font-bold transition hover:opacity-90"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
