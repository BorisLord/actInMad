import type { ChangeEvent, FormEvent } from "preact/compat";

import { useState } from "preact/hooks";
import { navigate } from "astro:transitions/client";

import { pb } from "../../lib/pocketbase";
import { setUser } from "../../lib/stores/userStore";
import SignUpButton from "../google/GoogleSignButton";

interface FormState {
  email: string;
  password: string;
}

const ConnexionForm = () => {
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
  });
  const [emailError, setEmailError] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");

    if (!validateEmail()) {
      return;
    }

    const payload = {
      email: form.email,
      password: form.password,
    };

    try {
      const res = await pb
        .collection("users")
        .authWithPassword(payload.email, payload.password);
      setLoggedIn(true);
      setUser(res);
      navigate("/private/Dashboard");
    } catch (error) {
      setLoginError("Une erreur s'est produite lors de la connexion.");
    } finally {
      setForm({ email: "", password: "" });
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const res = await pb
        .collection("users")
        .authWithOAuth2({ provider: "google" });
      setLoggedIn(true);
      setUser(res);
      navigate("/private/Dashboard");
    } catch (error) {
      setLoginError("Une erreur s'est produite lors de la connexion.");
    } finally {
      setForm({ email: "", password: "" });
    }
  };

  return (
    <>
      <div
        class="flex justify-center items-center mt-4"
        onClick={handleGoogleAuth}
      >
        <SignUpButton content="Se connecter avec Google" />
      </div>
      <form
        onSubmit={handleSubmit}
        class="w-full max-w-sm p-4 flex flex-col gap-4 text-sm md:text-base"
      >
        {loggedIn && (
          <p class="text-green-600 font-semibold">Connecté avec succès !</p>
        )}
        {loginError && <p class="text-madEncart text-sm">{loginError}</p>}

        <div>
          <label htmlFor="email" class="block font-semibold mb-1">
            Email *
          </label>
          <input
            autocomplete="email"
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
            required
            class="w-full p-2 rounded-xl border border-gray-300"
          />
        </div>

        <button
          type="submit"
          class="bg-madRed text-white px-6 py-2 rounded-xl font-bold hover:bg-madEncart transition cursor-pointer"
        >
          Se connecter
        </button>
      </form>
    </>
  );
};

export default ConnexionForm;
