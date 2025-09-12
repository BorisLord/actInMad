import { Icon } from "@iconify/react";
import { useEffect, useState } from "preact/hooks";

import { pb } from "../../../lib/pocketbase";
import { $user } from "../../../lib/stores/userStore";
// Assurez-vous que vos types sont corrects, surtout pour Commande et Tarif
import type { Commande, CoursRecord } from "../../../type";

// Sous-composant pour les items d'information (icône, label, valeur)
function InfoItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string | string[] | null;
}) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const displayValue = Array.isArray(value) ? value.join(" et ") : value;

  // Vérifier si c'est un emoji (caractère unique non-ASCII) ou une icône Lucide
  const isEmoji = icon.length <= 2 && icon.charCodeAt(0) > 127;

  return (
    <div class="flex items-start">
      {isEmoji ? (
        <span class="mr-3 mt-1 text-lg">{icon}</span>
      ) : (
        <Icon
          icon={`lucide:${icon}`}
          class="mr-3 mt-1 h-5 w-5 text-slate-500"
        />
      )}
      <div>
        <span class="font-semibold text-slate-700">{label}:</span>
        <p class="text-slate-800">{displayValue}</p>
      </div>
    </div>
  );
}

// L'item enrichi qui combine le cours et le tarif payé
type EnrichedItem = {
  cours: CoursRecord;
  tarif: number; // Le tarif spécifique de l'item de la commande
};

// Le composant d'affichage utilise maintenant l'item enrichi
function PurchasedCourseDetails({ item }: { item: EnrichedItem }) {
  const { cours, tarif } = item;

  return (
    <li class="overflow-hidden rounded-lg bg-slate-50 shadow-md">
      {/* En-tête du cours */}
      <div class="bg-slate-100 p-4">
        <span class="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
          {cours.coursType}
        </span>
        <h4 class="text-2xl font-bold text-slate-900">{cours.titre}</h4>
        {cours.pieceTheatre && (
          <p class="mt-1 text-base italic text-slate-600">
            Pièce jouée : {cours.pieceTheatre}
          </p>
        )}
      </div>

      {/* Corps avec les détails */}
      <div class="p-4">
        <p class="mb-6 text-base leading-relaxed text-slate-700">
          {cours.description}
        </p>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Colonne de gauche: Infos principales */}
          <div class="space-y-4">
            <InfoItem icon="📍" label="Lieu" value={cours.lieu} />
            <InfoItem
              icon="📅"
              label="Jour de répétition"
              value={cours.jourRepetition}
            />
            <InfoItem
              icon="⭐"
              label="Dates de spectacle"
              value={cours.dateJeu}
            />
          </div>
          {/* Colonne de droite: Infos logistiques */}
          <div class="space-y-4">
            <InfoItem
              icon="🚀"
              label="Démarrage des cours"
              value={cours.demarrage}
            />
            <InfoItem icon="🎤" label="Auditions" value={cours.audition} />
            <InfoItem icon="🧪" label="Cours d'essai" value={cours.courEssai} />
            {/* AFFICHE LE TARIF PAYÉ */}
            <div class="flex items-start">
              {/* <Icon
                icon="lucide:tag"
                class="mr-3 mt-1 h-5 w-5 text-slate-500"
              /> */}
              💰
              <div class="ml-3.5">
                <span class="font-semibold text-slate-700">Tarif Payé:</span>
                {tarif ? (
                  <p class="font-bold text-slate-800">{tarif}€</p>
                ) : (
                  <p class="text-slate-800">Non spécifié</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

// Type pour la commande complète avec les items enrichis
type CommandeEnrichie = Commande & {
  enrichedItems: EnrichedItem[];
};

// Composant principal
export default function CommandesList() {
  const [commandes, setCommandes] = useState<CommandeEnrichie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = $user.get();

  useEffect(() => {
    if (!user) {
      setError("Utilisateur non connecté.");
      setLoading(false);
      return;
    }

    const fetchCommandesEtCours = async () => {
      try {
        setLoading(true);

        const commandesRecords = await pb
          .collection("commandes")
          .getFullList<Commande>({
            filter: `userId = "${user.id}"`,
            sort: "-created",
          });

        if (commandesRecords.length === 0) {
          setLoading(false);
          return;
        }

        const courseIds = new Set<string>();
        commandesRecords.forEach((commande) => {
          commande.items.forEach((item) => courseIds.add(item.courseId));
        });

        if (courseIds.size === 0) {
          setCommandes(
            commandesRecords.map((c) => ({ ...c, enrichedItems: [] })),
          );
          setLoading(false);
          return;
        }

        const filterString = Array.from(courseIds)
          .map((id) => `id = "${id}"`)
          .join(" || ");
        const coursRecords = await pb
          .collection("cours")
          .getFullList<CoursRecord>({ filter: filterString });

        const coursMap = new Map<string, CoursRecord>();
        coursRecords.forEach((cours) => coursMap.set(cours.id, cours));

        // **MODIFICATION PRINCIPALE ICI**
        // On construit la liste d'items enrichis pour chaque commande
        const commandesEnrichies = commandesRecords.map((commande) => {
          const enrichedItems = commande.items
            .map((item) => {
              const cours = coursMap.get(item.courseId);
              if (!cours) return null;

              return {
                cours,
                tarif: item.tarif, // On récupère le tarif de l'item de la commande
              };
            })
            .filter((item): item is EnrichedItem => item !== null);

          return { ...commande, enrichedItems };
        });

        setCommandes(commandesEnrichies);
      } catch (err: any) {
        setError("Erreur lors de la récupération des données.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommandesEtCours();
  }, [user]);

  if (loading) {
    return <p class="text-center text-lg">Chargement des commandes...</p>;
  }

  if (error) {
    return <p class="text-center text-lg text-red-500">{error}</p>;
  }

  return (
    <div class="space-y-8">
      {commandes.length > 0 ? (
        commandes.map((commande) => (
          <div
            key={commande.id}
            class="overflow-hidden rounded-lg bg-white shadow-lg"
          >
            <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 p-4 sm:p-6">
              <div>
                <h2 class="text-xl font-bold text-slate-900">
                  Commande du {new Date(commande.created).toLocaleDateString()}
                </h2>
              </div>
              <span
                class={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                  commande.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {commande.status}
              </span>
            </div>

            <div class="p-4 sm:p-6">
              <ul class="space-y-6">
                {commande.enrichedItems.length > 0 ? (
                  // On itère sur les items enrichis
                  commande.enrichedItems.map((item, index) => (
                    <PurchasedCourseDetails
                      key={`${item.cours.id}-${index}`}
                      item={item}
                    />
                  ))
                ) : (
                  <p class="text-center text-slate-500">
                    Aucun détail de cours à afficher pour cette commande.
                  </p>
                )}
              </ul>
            </div>
          </div>
        ))
      ) : (
        <div class="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <h3 class="text-xl font-medium text-slate-900">
            Aucune commande trouvée
          </h3>
          <p class="mt-1 text-slate-500">
            Vous n'avez pas encore passé de commande.
          </p>
        </div>
      )}
    </div>
  );
}
