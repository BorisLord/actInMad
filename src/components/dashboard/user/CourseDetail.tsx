import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/preact";
import { useEffect, useMemo, useState } from "preact/hooks";

import { pb } from "../../../lib/pocketbase";
import { $cart, addCourseToCart } from "../../../lib/stores/cartStore";
import type { CartItem, CoursRecord, EquipeRecord } from "../../../type";

interface CourseDetailProps {
  courseId: string;
  onBack: () => void;
}

const ProfessorInfo = ({ prof }: { prof: EquipeRecord }) => {
  if (!prof) return null;

  const hasPhoto = prof.photo && prof.photo.length > 0;
  const photoUrl = hasPhoto
    ? pb.files.getURL(prof, prof.photo, { thumb: "100x100" })
    : null;

  return (
    <div class="flex items-center space-x-4 rounded-md border border-slate-200 p-3">
      <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-slate-200">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`Photo de ${prof.prenom} ${prof.nom}`}
            class="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div class="flex h-full w-full items-center justify-center">
            <Icon
              icon="lucide:user-circle"
              className="h-12 w-12 text-slate-500"
            />
          </div>
        )}
      </div>
      <div>
        <span class="text-sm font-semibold text-slate-600">Animé par</span>
        <p class="text-lg font-bold text-slate-900">
          {prof.prenom} {prof.nom}
        </p>
      </div>
    </div>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | null | undefined;
}) => {
  if (!value) return null;
  return (
    <div class="flex items-start">
      <span class="mr-3 mt-1 w-6 text-xl">{icon}</span>
      <div>
        <span class="font-semibold text-slate-700">{label}:</span>
        <p class="text-slate-600">{value}</p>
      </div>
    </div>
  );
};

export default function CourseDetail({ courseId, onBack }: CourseDetailProps) {
  const [course, setCourse] = useState<CoursRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTarif, setSelectedTarif] = useState<number | null>(null);

  const cartItems = useStore($cart);
  const countInCart = useMemo(() => {
    return cartItems.filter((item) => item.id === courseId).length;
  }, [cartItems, courseId]);

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const record = await pb.collection("cours").getOne(courseId, {
          expand: "profID",
        });
        setCourse(record as unknown as CoursRecord);
      } catch (err) {
        console.error("Erreur de récupération pour le cours:", err);
        setError("Le cours demandé n'a pas pu être trouvé.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const displayTarifs = useMemo(() => {
    if (!course?.tarif || course.tarif.length === 0) {
      return [];
    }

    if (course.coursType === `Act'Impro`) {
      const sortedTarifs = [...course.tarif].sort((a, b) => b - a);
      let runningTotal = 0;
      return sortedTarifs.map((price, index) => {
        runningTotal += price;
        return {
          label: `${index + 1} session`,
          displayPrice: `${runningTotal}€`,
          value: runningTotal,
        };
      });
    }

    if (course.coursType === "Atelier Spectacle") {
      const sortedTarifs = [...course.tarif].sort((a, b) => a - b);
      return sortedTarifs.map((price, index) => ({
        label: `Rôle ${index + 1} / an`,
        displayPrice: `${price}€`,
        value: price,
      }));
    }

    if (course.coursType === "Cours De Theatre") {
      return course.tarif.map((price) => ({
        label: "Année",
        displayPrice: `${price}€`,
        value: price,
      }));
    }

    return course.tarif.map((price) => ({
      label: "Tarif",
      displayPrice: `${price}€`,
      value: price,
    }));
  }, [course]);

  useEffect(() => {
    if (displayTarifs.length === 1) {
      setSelectedTarif(displayTarifs[0].value);
    }
  }, [displayTarifs]);

  const handleCartClick = () => {
    if (!course || selectedTarif === null) return;

    const cartItem: CartItem = {
      ...course,
      selectedTarif,
      coursId: course.id,
      cartItemId: crypto.randomUUID(),
    };
    addCourseToCart(cartItem);
  };

  if (isLoading) return <p>Chargement du cours...</p>;
  if (error)
    return (
      <div
        class="border-l-4 border-red-500 bg-red-100 p-4 text-red-700"
        role="alert"
      >
        <p class="font-bold">Erreur</p>
        <p>{error}</p>
      </div>
    );
  if (!course) return null;

  const professor = course.expand?.profID;
  const isAddToCartDisabled =
    displayTarifs.length > 0 && selectedTarif === null;

  return (
    <div>
      <div class="mb-6">
        <button
          onClick={onBack}
          class="flex items-center gap-2 rounded-md bg-slate-200 px-4 py-2 font-semibold text-slate-800 transition hover:bg-slate-300"
        >
          <Icon icon="lucide:arrow-left" width="16" />
          Retour
        </button>
      </div>

      <div class="overflow-hidden rounded-lg bg-white shadow-lg">
        <div class="bg-slate-50 p-6">
          <span class="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
            {course.coursType}
          </span>
          <h1 class="text-4xl font-bold text-slate-900">{course.titre}</h1>
          {course.pieceTheatre && (
            <p class="mt-2 text-lg italic text-slate-600">
              Pièce jouée : {course.pieceTheatre}
            </p>
          )}
        </div>
        <div class="p-6">
          <p class="mb-8 text-lg leading-relaxed text-slate-700">
            {course.description}
          </p>
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div class="space-y-4">
              {professor ? (
                <ProfessorInfo prof={professor} />
              ) : (
                <InfoItem
                  icon="🎓"
                  label="Professeur(s)"
                  value="Non spécifié"
                />
              )}
              <InfoItem icon="📍" label="Lieu" value={course.lieu} />
              <InfoItem
                icon="📅"
                label="Jour de répétition"
                value={course.jourRepetition}
              />
              <InfoItem
                icon="🎭"
                label="Dates de spectacle"
                value={course.dateJeu?.join(" et ")}
              />
            </div>
            <div class="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4">
              <InfoItem
                icon="🚀"
                label="Démarrage des cours"
                value={course.demarrage?.join(", ")}
              />
              <InfoItem
                icon="📝"
                label="Auditions"
                value={course.audition?.join(", ")}
              />
              <InfoItem
                icon="🧪"
                label="Cours d'essai"
                value={course.courEssai?.join(", ")}
              />
              <div class="flex flex-col pt-2">
                <div class="flex items-start">
                  <span class="mr-3 mt-1 w-6 text-xl">💰</span>
                  <span class="font-semibold text-slate-700">Tarif:</span>
                </div>
                <div class="mt-2 flex-grow pl-9">
                  {displayTarifs.length > 0 ? (
                    <div class="space-y-1.5">
                      {displayTarifs.map((tarifOption) => (
                        <label
                          key={tarifOption.value}
                          class="flex cursor-pointer items-center justify-between rounded-md border p-2 transition hover:bg-slate-100 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50"
                        >
                          <span class="font-medium text-slate-800">
                            {tarifOption.label}
                          </span>

                          <div class="flex items-center">
                            <span class="mr-3 font-bold text-slate-900">
                              {tarifOption.displayPrice}
                            </span>
                            <input
                              type="radio"
                              name="tarif"
                              value={tarifOption.value}
                              checked={selectedTarif === tarifOption.value}
                              onChange={() =>
                                setSelectedTarif(tarifOption.value)
                              }
                              class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p class="font-bold text-slate-800">Prix non spécifié</p>
                  )}
                  <button
                    onClick={handleCartClick}
                    disabled={isAddToCartDisabled}
                    class="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    <Icon icon="lucide:shopping-cart" width="20" />
                    <span>Ajouter au panier</span>
                    {countInCart > 0 && (
                      <span class="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-800 text-xs font-bold">
                        {countInCart}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
