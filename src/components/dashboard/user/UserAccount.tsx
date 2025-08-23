import { useEffect, useRef, useState } from "preact/hooks";

import { pb } from "../../../lib/pocketbase";
import { type User, updateUser } from "../../../lib/stores/userStore";
import Calendar from "../../Calendar";

export default function UserAccount({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const formatBirthdate = (date: string) => {
    return date ? date.split(" ")[0] : "";
  };

  const [formData, setFormData] = useState<User>({
    id: user.id || "",
    email: user.email || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    birthdate: formatBirthdate(user.birthdate || ""),
    phone: user.phone || "",
    theaterLevel: user.theaterLevel || undefined,
    verified: user.verified || false,
    profileCompleted: user.profileCompleted || false,
    avatarUrl: user.avatarUrl || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id || "",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        birthdate: user.birthdate ? user.birthdate.split(" ")[0] : "",
        phone: user.phone || "",
        theaterLevel: user.theaterLevel || undefined,
        verified: user.verified || false,
        profileCompleted: user.profileCompleted || false,
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user]);

  const handleSendVerification = async () => {
    try {
      await pb.collection("users").requestVerification(formData.email);

      alert("Un email de vérification a été envoyé !");
    } catch (err) {
      alert("Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
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
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "id" && key !== "avatar" && key !== "profileCompleted") {
          data.append(key, value as string);
        }
      });
      data.append("profileCompleted", String(isProfileComplete));

      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const updatedRecord = await pb
        .collection("users")
        .update(formData.id, data);

      updateUser(updatedRecord);

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

  return (
    <div class="w-full max-w-sm md:max-w-md lg:max-w-xl mx-auto p-4 mt-4">
      {!user.profileCompleted && (
        <p class="text-justify m-4">
          Avant de commencer cette aventure théâtrale ensemble, nous aimerions
          en savoir un peu plus sur vous !{" "}
        </p>
      )}
      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          class="flex flex-col gap-4 text-sm md:text-base"
        >
          <div>
            <label htmlFor="firstName" class="block font-semibold mb-1">
              Prénom *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              class="w-full p-2 rounded-xl border border-gray-300"
            />
          </div>
          <div>
            <label htmlFor="lastName" class="block font-semibold mb-1">
              Nom *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              class="w-full p-2 rounded-xl border border-gray-300"
            />
          </div>
          <div>
            <label htmlFor="birthdate" class="block font-semibold mb-1">
              Date de naissance *
            </label>
            <Calendar value={formData.birthdate} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="phone" class="block font-semibold mb-1">
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
              class="w-full p-2 rounded-xl border border-gray-300"
            />
          </div>
          <div>
            <label htmlFor="theaterLevel" class="block font-semibold mb-1">
              Niveau de théâtre *
            </label>
            <select
              id="theaterLevel"
              name="theaterLevel"
              value={formData.theaterLevel}
              onChange={handleChange}
              required
              class="w-full p-2 rounded-xl border border-gray-300"
            >
              <option value="">Sélectionnez un niveau</option>
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Confirmé">Confirmé</option>
            </select>
          </div>
          <div>
            <label htmlFor="avatarUrl" className="block font-semibold mb-1">
              Photo de profil
            </label>
            <div className="flex items-center gap-4">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt="Avatar actuel"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <input
                type="file"
                id="avatarUrl"
                name="avatar"
                ref={avatarInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-madRed/10 file:text-madRed hover:file:bg-madRed/20 cursor-pointer"
              />
            </div>
          </div>
          <button
            type="submit"
            class="bg-madRed text-white px-6 py-2 rounded-xl font-bold hover:bg-madEncart transition cursor-pointer"
          >
            Enregistrer les modifications
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            class="bg-gray-300 text-gray-800 px-6 py-2 rounded-xl font-bold hover:bg-gray-400 transition cursor-pointer"
          >
            Annuler
          </button>
        </form>
      ) : (
        <div class="flex flex-col gap-4 text-sm md:text-base">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <dl class="divide-y divide-gray-200">
              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="font-medium text-gray-600">Nom complet</dt>
                <dd class="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                  {[formData.firstName, formData.lastName]
                    .filter(Boolean)
                    .join(" ") || "Non renseigné"}{" "}
                </dd>
              </div>

              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="font-medium text-gray-600">Date de naissance</dt>
                <dd class="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.birthdate || "Non renseignée"}
                </dd>
              </div>

              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="font-medium text-gray-600">Téléphone</dt>
                <dd class="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.phone || "Non renseigné"}
                </dd>
              </div>

              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="font-medium text-gray-600">Email</dt>
                <dd class="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.email}
                </dd>
              </div>

              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="font-medium text-gray-600">Niveau de théâtre</dt>
                <dd class="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.theaterLevel || "Non renseigné"}
                </dd>
              </div>

              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-gray-600">Photo de profil</dt>
                <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    "Aucune photo"
                  )}
                </dd>
              </div>

              <div class="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt class="font-medium text-gray-600">Statut du compte</dt>
                <dd class="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.verified ? (
                    <span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      Vérifié
                    </span>
                  ) : (
                    <div class="flex items-center gap-4">
                      <span class="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                        Non vérifié
                      </span>
                      <button
                        onClick={handleSendVerification}
                        class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Envoyer l'email de vérification
                      </button>
                    </div>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            class="bg-madRed text-white px-6 py-2 rounded-xl font-bold hover:bg-madEncart transition cursor-pointer"
          >
            Modifier mon profil
          </button>
        </div>
      )}
    </div>
  );
}
