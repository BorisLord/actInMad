import { useState } from "preact/hooks";
import { pb } from "../../../lib/pocketbase";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  phone: string;
  theaterLevel: "Débutant" | "Intermédiaire" | "Confirmé";
  verified: boolean;
};

export default function UserAccount({
  isProfileCompleted,
}: {
  isProfileCompleted: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const formatBirthdate = (date: string) => {
    return date ? date.split(" ")[0] : "";
  };

  const [formData, setFormData] = useState<User>({
    id: pb.authStore.record?.id || "",
    email: pb.authStore.record?.email,
    firstName: pb.authStore.record?.firstName || "",
    lastName: pb.authStore.record?.lastName || "",
    birthdate: formatBirthdate(pb.authStore.record?.birthdate || ""),
    phone: pb.authStore.record?.phone || "",
    theaterLevel: pb.authStore.record?.theaterLevel || "",
    verified: pb.authStore.record?.verified,
  });

  const handleChange = (e: Event) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    try {
      await pb.collection("users").update(formData.id, formData);
      setIsEditing(false);
      alert("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
      alert("Échec de la mise à jour du profil.");
    }
  };

  return (
    <div class="w-full max-w-sm md:max-w-md lg:max-w-xl mx-auto p-4 mt-4">
      {!isProfileCompleted && (
        <p class="text-justify">
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
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              required
              class="w-full p-2 rounded-xl border border-gray-300"
            />
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
          <h2 class="text-xl font-bold text-center">Mon Profil</h2>
          <div class="p-4 bg-gray-100 rounded-xl">
            <p>
              <span class="font-semibold">Prénom</span> :{" "}
              {formData.firstName || "Non renseigné"}
            </p>
            <p>
              <span class="font-semibold">Nom</span> :{" "}
              {formData.lastName || "Non renseigné"}
            </p>
            <p>
              <span class="font-semibold">Date de naissance</span> :{" "}
              {formData.birthdate || "Non renseignée"}
            </p>
            <p>
              <span class="font-semibold">Téléphone</span> :{" "}
              {formData.phone || "Non renseigné"}
            </p>
            <p>
              <span class="font-semibold">Niveau de théâtre</span> :{" "}
              {formData.theaterLevel || "Non renseigné"}
            </p>
            <p>
              <span class="font-semibold">Email</span> : {formData.email}
            </p>
            <p>
              <span class="font-semibold">Compte vérifié</span> :{" "}
              {formData.verified ? "Oui" : "Non"}
            </p>
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
