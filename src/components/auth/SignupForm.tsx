import { useState } from "preact/hooks";
import { API_URL } from "astro:env/client";
import type { ChangeEvent, FormEvent } from "preact/compat";
import PocketBase from "pocketbase";
import { navigate } from "astro:transitions/client";
import SignUpButton from "../google/GoogleSignButton";
// import SignUp from "../static/google/signUp.astro";

const pb = new PocketBase(API_URL);

interface FormState {
  nom: string;
  prenom: string;
  email: string;
  password: string;
}

const InscriptionForm = () => {
  const [form, setForm] = useState<FormState>({
    nom: "",
    prenom: "",
    email: "",
    password: "",
  });
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [registrationError, setRegistrationError] = useState<string>("");
  const [registered, setRegistered] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  const validatePassword = () => {
    if (form.password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères.");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegistrationError("");

    if (!validateEmail() || !validatePassword()) {
      return;
    }

    const payload = {
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      password: form.password,
    };

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setRegistrationError(errorData.message || "Échec de l'inscription.");
        return;
      }

      setRegistered(true);
      setForm({
        nom: "",
        prenom: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      setRegistrationError("Une erreur s'est produite lors de l'inscription.");
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await pb.collection("users").authWithOAuth2({ provider: "google" });

      console.log("Authentification Google réussie !");

      console.log(pb.authStore);

      // if (pb.authStore.isValid) {
      //   navigate("/private/Dashboard");
      // }
    } catch (error) {
      console.error("Erreur lors de l'authentification Google :", error);
      // Gérer l'erreur d'authentification
    }
  };

  return (
    <div class="w-full max-w-sm p-4 flex flex-col gap-4 text-sm md:text-base">
      {/* <h2 class="text-xl font-semibold mb-4 text-center">Inscription</h2> */}
      {registered && (
        <p class="text-green-600 font-semibold">Inscription réussie !</p>
      )}
      {registrationError && (
        <p class="text-madEncart text-sm">{registrationError}</p>
      )}
      <div class="flex justify-center items-center" onClick={handleGoogleAuth}>
        <SignUpButton content="S'enregistrer avec Google" />
      </div>
      <form onSubmit={handleSubmit} class="flex flex-col gap-4">
        <div>
          <label htmlFor="nom" class="block font-semibold mb-1">
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
        <div>
          <label htmlFor="prenom" class="block font-semibold mb-1">
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
        <div>
          <label htmlFor="email" class="block font-semibold mb-1">
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
          <label htmlFor="password" class="block font-semibold mb-1">
            Mot de passe *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onInput={handleChange}
            onBlur={validatePassword}
            required
            class="w-full p-2 rounded-xl border border-gray-300"
          />
          {passwordError && (
            <p class="text-madEncart text-sm">{passwordError}</p>
          )}
        </div>

        <button
          type="submit"
          class="bg-madRed text-white px-6 py-2 rounded-xl font-bold hover:bg-madEncart transition self-start cursor-pointer"
        >
          S'inscrire
        </button>
      </form>
    </div>
  );
};

export default InscriptionForm;
