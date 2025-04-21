import { useState } from "preact/hooks";
import { API_URL } from "astro:env/client";

export default function ContactForm() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    inscription: false,
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState("");

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
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Échec de l'envoi du message");
      }

      setSent(true);
      setForm({
        nom: "",
        prenom: "",
        email: "",
        inscription: false,
        message: "",
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error);
    }
  };

  return (
    <div class="flex flex-col items-center p-4">
      <div class="max-w-6xl p-4 md:p-6 mt-5">
        <h1 class="text-madRed text-2xl md:text-3xl text-center md:text-left">
          Posez-nous vos questions !
        </h1>
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
            required
            class="w-full p-2 rounded-xl border border-gray-300"
          />
          {emailError && <p class="text-madEncart text-sm">{emailError}</p>}
        </div>

        <div>
          <label for="message" class="block font-semibold mb-1">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={form.message}
            onInput={handleChange}
            required
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
            Je souhaite m’inscrire à Act in Mag (la lettre d’information Act in
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
