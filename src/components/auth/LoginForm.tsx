import { Icon } from "@iconify/react";
import { navigate } from "astro:transitions/client";
import type { ChangeEvent, FormEvent } from "preact/compat";
import { useState } from "preact/hooks";

import { pb } from "../../lib/pocketbase";
import { setUser } from "../../lib/stores/userStore";
import type { LoginForm } from "../../types/typesF";
import SignUpButton from "../google/GoogleSignButton";

interface ConnexionFormProps {
  onForgotPassword?: () => void;
}

const ConnexionForm = ({ onForgotPassword }: ConnexionFormProps) => {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [emailError, setEmailError] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
        {loginError && <p class="text-sm text-madEncart">{loginError}</p>}

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
          {emailError && <p class="text-sm text-madEncart">{emailError}</p>}
        </div>
        <div>
          <label htmlFor="password" class="mb-1 block font-semibold">
            Mot de passe *
          </label>
          <div class="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={form.password}
              onInput={handleChange}
              required
              class="w-full rounded-xl border border-gray-300 p-2 pr-10"
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
        </div>

        <button
          type="submit"
          class="cursor-pointer rounded-xl bg-madRed px-6 py-2 font-bold text-white transition hover:bg-madEncart"
        >
          Se connecter
        </button>

        {onForgotPassword && (
          <button
            type="button"
            onClick={onForgotPassword}
            class="text-center text-sm text-gray-600 underline hover:text-gray-800"
          >
            Mot de passe oublié ?
          </button>
        )}
      </form>
    </>
  );
};

export default ConnexionForm;
