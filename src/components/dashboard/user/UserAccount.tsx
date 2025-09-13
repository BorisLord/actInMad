import { useEffect, useRef, useState } from "preact/hooks";

import { getAvatarUrl, pb } from "../../../lib/pocketbase";
import { updateUser } from "../../../lib/stores/userStore";
import type { User } from "../../../types/typesF";
import Calendar from "../../Calendar";

export default function UserAccount({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(!user.profileCompleted);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<User>({
    ...user,
    birthdate: user.birthdate ? user.birthdate.split(" ")[0] : "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        birthdate: user.birthdate ? user.birthdate.split(" ")[0] : "",
      });
      if (!user.profileCompleted) {
        setIsEditing(true);
      }
    }
  }, [user]);

  const handleSendVerification = async () => {
    try {
      await pb
        .collection("users")
        .requestVerification(formData.email as string);
      alert("Un email de vérification a été envoyé !");
    } catch (err) {
      alert("Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files?.[0]) {
      setAvatarFile(target.files[0]);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    try {
      const isProfileComplete = !!(
        formData.firstName &&
        formData.lastName &&
        formData.birthdate &&
        formData.phone &&
        formData.theaterLevel
      );

      const data = new FormData();
      const fieldsToUpdate: (keyof User)[] = [
        "firstName",
        "lastName",
        "birthdate",
        "phone",
        "theaterLevel",
      ];
      fieldsToUpdate.forEach((key) => {
        if (formData[key]) data.append(String(key), formData[key] as string);
      });
      data.append("profileCompleted", String(isProfileComplete));

      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const updatedRecord = await pb
        .collection("users")
        .update(formData.id as string, data);
      const avatarUrl = await getAvatarUrl(
        user.id as string,
        // updatedRecord.avatar,
      );
      const updatedRecordUrl = {
        ...updatedRecord,
        avatarUrl: avatarUrl ?? undefined,
      };
      updateUser(updatedRecordUrl);

      setIsEditing(false);
      setAvatarFile(null);
      alert("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
      alert("Échec de la mise à jour du profil.");
    }
  };

  if (!formData.id) {
    return <div>Chargement du profil...</div>;
  }

  const ActionsRequis = () => (
    <div class="mb-6 space-y-4 rounded-xl border border-yellow-300 bg-yellow-50 p-4">
      <h3 class="font-bold text-yellow-800">Finalisez votre inscription</h3>
      {!user.profileCompleted && (
        <p class="text-sm text-yellow-700">
          Pour accéder à toutes les fonctionnalités, veuillez compléter les
          champs obligatoires (*) de votre profil.
        </p>
      )}
      {!user.verified && (
        <div class="flex items-center gap-4 rounded-lg bg-yellow-100 p-3">
          <p class="flex-1 text-sm text-yellow-800">
            Votre adresse email n'est pas encore vérifiée.
          </p>
          <button
            onClick={handleSendVerification}
            class="bg-madEncart hover:bg-madRed whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-white transition"
          >
            Envoyer l'email
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div class="mx-auto mt-4 w-full max-w-sm p-4 md:max-w-md lg:max-w-xl">
      {(!user.profileCompleted || !user.verified) && <ActionsRequis />}

      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          class="flex flex-col gap-4 text-sm md:text-base"
        >
          <div>
            <label htmlFor="firstName" class="mb-1 block font-semibold">
              Prénom *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              class="w-full rounded-xl border border-gray-300 p-2"
            />
          </div>
          <div>
            <label htmlFor="lastName" class="mb-1 block font-semibold">
              Nom *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              class="w-full rounded-xl border border-gray-300 p-2"
            />
          </div>
          <div>
            <label htmlFor="birthdate" class="mb-1 block font-semibold">
              Date de naissance *
            </label>
            <Calendar
              key="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="phone" class="mb-1 block font-semibold">
              Téléphone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="on"
              required
              class="w-full rounded-xl border border-gray-300 p-2"
            />
          </div>
          <div>
            <label htmlFor="theaterLevel" class="mb-1 block font-semibold">
              Niveau de théâtre *
            </label>
            <select
              id="theaterLevel"
              name="theaterLevel"
              value={formData.theaterLevel}
              onChange={handleChange}
              required
              class="w-full rounded-xl border border-gray-300 p-2"
            >
              <option value="">Sélectionnez un niveau</option>
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Confirmé">Confirmé</option>
            </select>
          </div>
          <div>
            <label htmlFor="avatarUrl" className="mb-1 block font-semibold">
              Photo de profil
            </label>
            <div className="flex items-center gap-4">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt="Avatar actuel"
                  className="h-16 w-16 rounded-full object-cover"
                />
              )}
              <input
                type="file"
                id="avatarUrl"
                name="avatar"
                ref={avatarInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="file:bg-madRed/10 file:text-madRed hover:file:bg-madRed/20 block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold"
              />
            </div>
          </div>
          <button
            type="submit"
            class="bg-madRed hover:bg-madEncart cursor-pointer rounded-xl px-6 py-2 font-bold text-white transition"
          >
            Enregistrer les modifications
          </button>
          {user.profileCompleted && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              class="cursor-pointer rounded-xl bg-gray-300 px-6 py-2 font-bold text-gray-800 transition hover:bg-gray-400"
            >
              Annuler
            </button>
          )}
        </form>
      ) : (
        <div class="flex flex-col gap-4 text-sm md:text-base">
          <div class="rounded-xl border border-gray-200 bg-white shadow-sm">
            <dl class="divide-y divide-gray-200">
              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="font-medium text-gray-600">Nom complet</dt>
                <dd class="mt-1 text-gray-900 sm:col-span-2 sm:mt-0">
                  {[formData.firstName, formData.lastName]
                    .filter(Boolean)
                    .join(" ") || "Non renseigné"}
                </dd>
              </div>
              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="font-medium text-gray-600">Date de naissance</dt>
                <dd class="mt-1 text-gray-900 sm:col-span-2 sm:mt-0">
                  {formData.birthdate || "Non renseignée"}
                </dd>
              </div>
              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="font-medium text-gray-600">Téléphone</dt>
                <dd class="mt-1 text-gray-900 sm:col-span-2 sm:mt-0">
                  {formData.phone || "Non renseigné"}
                </dd>
              </div>
              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="font-medium text-gray-600">Email</dt>
                <dd class="mt-1 text-gray-900 sm:col-span-2 sm:mt-0">
                  {formData.email}
                </dd>
              </div>
              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="font-medium text-gray-600">Niveau de théâtre</dt>
                <dd class="mt-1 text-gray-900 sm:col-span-2 sm:mt-0">
                  {formData.theaterLevel || "Non renseigné"}
                </dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-600">Photo de profil</dt>
                <dd className="mt-1 text-gray-900 sm:col-span-2 sm:mt-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    "Aucune photo"
                  )}
                </dd>
              </div>
              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="font-medium text-gray-600">Statut du compte</dt>
                <dd class="mt-1 text-gray-900 sm:col-span-2 sm:mt-0">
                  {formData.verified ? (
                    <span class="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                      Vérifié
                    </span>
                  ) : (
                    <span class="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                      Non vérifié
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            class="bg-madRed hover:bg-madEncart cursor-pointer rounded-xl px-6 py-2 font-bold text-white transition"
          >
            Modifier mon profil
          </button>
        </div>
      )}
    </div>
  );
}
