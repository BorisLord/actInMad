import { navigate } from "astro:transitions/client";
import type { ChangeEvent, FormEvent } from "preact/compat";
import { useState } from "preact/hooks";

import { pb } from "../../lib/pocketbase";
import { setUser } from "../../lib/stores/userStore";
import type { LoginForm } from "../../types/typesF";
import SignUpButton from "../google/GoogleSignButton";

const ConnexionForm = () => {
  const [form, setForm] = useState<LoginForm>({
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
      setUser(res);
      setLoggedIn(true);
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
      setUser(res);
      setLoggedIn(true);
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
        class="mt-4 flex items-center justify-center"
        onClick={handleGoogleAuth}
      >
        <SignUpButton content="Se connecter avec Google" />
      </div>
      <form
        onSubmit={handleSubmit}
        class="flex w-full max-w-sm flex-col gap-4 p-4 text-sm md:text-base"
      >
        {loggedIn && (
          <p class="font-semibold text-green-600">Connecté avec succès !</p>
        )}
        {loginError && <p class="text-madEncart text-sm">{loginError}</p>}

        <div>
          <label htmlFor="email" class="mb-1 block font-semibold">
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
            class="w-full rounded-xl border border-gray-300 p-2"
          />
          {emailError && <p class="text-madEncart text-sm">{emailError}</p>}
        </div>
        <div>
          <label htmlFor="password" class="mb-1 block font-semibold">
            Mot de passe *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onInput={handleChange}
            required
            class="w-full rounded-xl border border-gray-300 p-2"
          />
        </div>

        <button
          type="submit"
          class="bg-madRed hover:bg-madEncart cursor-pointer rounded-xl px-6 py-2 font-bold text-white transition"
        >
          Se connecter
        </button>
      </form>
    </>
  );
};

export default ConnexionForm;
