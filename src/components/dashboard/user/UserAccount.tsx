import { useEffect, useState } from "preact/hooks";

import { pb } from "../../../lib/pocketbase";
import { type User } from "../../../lib/stores/userStore";

import Calendar from "../../Calendar";

export default function UserAccount({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false);

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
  });

  useEffect(() => {
    if (user) {
      // On met à jour l'état local pour qu'il corresponde toujours aux données du store global.
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

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    try {
      const dataToUpdate = {
        ...formData,
        profileCompleted: true,
      };
      await pb.collection("users").update(formData.id, dataToUpdate);
      setIsEditing(false);
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
                <dt class="font-medium text-gray-600">Statut du compte</dt>
                <dd class="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                  {formData.verified ? (
                    <span class="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      Vérifié
                    </span>
                  ) : (
                    // 👇 On utilise un conteneur flex pour aligner le badge et le bouton
                    <div class="flex items-center gap-4">
                      <span class="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                        Non vérifié
                      </span>
                      <button
                        onClick={handleSendVerification} // Fonction à créer
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
