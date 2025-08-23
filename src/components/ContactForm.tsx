import { useStore } from "@nanostores/preact";
import { PUBLIC_PB_URL } from "astro:env/client";
import { useEffect, useState } from "preact/hooks";

import { pb } from "../lib/pocketbase";
import { $user, updateUser } from "../lib/stores/userStore";

export default function ContactForm() {
  const user = useStore($user);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    inscription: false,
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
      inscription: form.inscription,
      message: form.message,
    };

    try {
      const response = await fetch(`${PUBLIC_PB_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSent(true);
      if (!pb.authStore.isValid) {
        setForm({
          nom: "",
          prenom: "",
          email: "",
          inscription: false,
          message: "",
        });
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
      <div class="max-w-6xl mx-auto p-4 md:p-6 mt-5 text-center">
        <h1 class="text-madRed text-2xl md:text-3xl">
          Posez-nous vos questions !
        </h1>
        <h2 class="text-lg md:text-xl">Inscrivez-vous à Act in Mag' !</h2>
        <p class="text-xs md:text-sm text-gray-500">
          Bug, suggestion ou simple message : nous sommes à l’écoute !
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        class="w-full max-w-4xl p-4 flex flex-col gap-4 text-sm md:text-base"
      >
        {sent && (
          <p class="text-green-600 font-semibold">
            Message envoyé avec succès !
          </p>
        )}

        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <label for="nom" class="block font-semibold mb-1">
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
              class="w-full p-2 rounded-xl border border-gray-300"
            />
          </div>
          <div class="flex-1">
            <label for="prenom" class="block font-semibold mb-1">
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
              class="w-full p-2 rounded-xl border border-gray-300"
            />
          </div>
        </div>

        <div>
          <label for="email" class="block font-semibold mb-1">
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
            class="w-full p-2 rounded-xl border border-gray-300"
          />
          {emailError && <p class="text-madEncart text-sm">{emailError}</p>}
        </div>

        <div>
          <label for="message" class="block font-semibold mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={form.message}
            onInput={handleChange}
            class="w-full p-2 rounded-xl border border-gray-300"
          />
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="inscription"
            name="inscription"
            checked={form.inscription}
            onInput={handleChange}
            class="w-4 h-4 rounded-md border-gray-400"
          />
          <label for="inscription" class="text-gray-700">
            Je souhaite m’inscrire à Act in Mag' (la lettre d’information Act in
            Mad)
          </label>
        </div>

        <button
          type="submit"
          class="bg-madRed text-madBack px-6 py-2 rounded-xl font-bold hover:opacity-90 transition self-start"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
