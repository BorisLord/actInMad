import { Icon } from "@iconify/react";
import { navigate } from "astro:transitions/client";
import type { ChangeEvent, FormEvent } from "preact/compat";
import { useState } from "preact/hooks";

import { pb } from "../../lib/pocketbase";
import SignUpButton from "../google/GoogleSignButton";

interface FormState {
  email: string;
  password: string;
  passwordConfirm: string;
}

const InscriptionForm = () => {
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [registrationError, setRegistrationError] = useState<string>("");
  const [registered, setRegistered] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
    if (form.password.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }
    if (form.password !== form.passwordConfirm) {
      setPasswordError("Les mots de passe doivent etre identique");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegistrationError("");
    if (!validateEmail() || !validatePassword()) {
      return;
    }

    const payload = {
      email: form.email,
      password: form.password,
      passwordConfirm: form.passwordConfirm,
    };

    try {
      await pb.collection("users").create(payload);
      setRegistered(true);
      setTimeout(() => {
        navigate("/ConnexionInscription");
      }, 2000);
    } catch (error) {
      setRegistrationError("Une erreur s'est produite lors de l'inscription.");
    } finally {
      setForm({
        email: "",
        password: "",
        passwordConfirm: "",
      });
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await pb.collection("users").authWithOAuth2({ provider: "google" });
      setRegistered(true);
      setTimeout(() => {
        navigate("/ConnexionInscription");
      }, 2000);
    } catch (error) {
      setRegistrationError("Une erreur s'est produite lors de l'inscription.");
    } finally {
      setForm({
        email: "",
        password: "",
        passwordConfirm: "",
      });
    }
  };

  return (
    <div class="flex w-full max-w-sm flex-col gap-4 p-4 text-sm md:text-base">
      {registered && (
        <p class="font-semibold text-green-600">Inscription réussie !</p>
      )}
      {registrationError && (
        <p class="text-madEncart text-sm">{registrationError}</p>
      )}
      <div class="flex items-center justify-center" onClick={handleGoogleAuth}>
        <SignUpButton content="S'enregistrer avec Google" />
      </div>
      <form onSubmit={handleSubmit} class="flex flex-col gap-4">
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
          <div class="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={form.password}
              onInput={handleChange}
              onBlur={validatePassword}
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
          {passwordError && (
            <p class="text-madEncart text-sm">{passwordError}</p>
          )}
        </div>

        <div>
          <label htmlFor="passwordConfirm" class="mb-1 block font-semibold">
            Confirmation du mot de passe *
          </label>
          <div class="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="passwordConfirm"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onInput={handleChange}
              onBlur={validatePassword}
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
          {passwordError && (
            <p class="text-madEncart text-sm">{passwordError}</p>
          )}
        </div>

        <button
          type="submit"
          class="bg-madRed hover:bg-madEncart cursor-pointer rounded-xl px-6 py-2 font-bold text-white transition"
        >
          S'inscrire
        </button>
      </form>
    </div>
  );
};

export default InscriptionForm;
