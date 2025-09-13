import { useEffect, useState } from "preact/hooks";

import { pb } from "../../../lib/pocketbase";
import type { CoursRecord } from "../../../types/typesF";

interface UserSubscriptionProps {
  onSelectCourse: (id: string) => void;
}

export default function UserSubscription({
  onSelectCourse,
}: UserSubscriptionProps) {
  const [courses, setCourses] = useState<CoursRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const records = await pb.collection("cours").getFullList({
          filter: "isActive = true",
          sort: "-created",
        });

        setCourses(records as unknown as CoursRecord[]);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des cours:", err);
        setError(
          "Impossible de charger les cours. Veuillez réessayer plus tard.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (isLoading) {
    return <p>Chargement des cours...</p>;
  }

  if (error) {
    return (
      <div
        class="border-l-4 border-red-500 bg-red-100 p-4 text-red-700"
        role="alert"
      >
        <p class="font-bold">Erreur</p>
        <p>{error}</p>
      </div>
    );
  }

  const formatTarif = (tarif: number[]) => {
    if (!tarif || tarif.length === 0) return "Prix non spécifié";
    if (tarif.length === 1) return `${tarif[0]}€`;
    const minPrice = Math.min(...tarif.filter((t) => t > 0));
    return `À partir de ${minPrice}€`;
  };

  return (
    <div>
      {courses.length === 0 ? (
        <p>Aucun cours disponible pour le moment.</p>
      ) : (
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              class="flex flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-md"
            >
              <div class="flex-grow">
                <span class="mr-2 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-blue-800">
                  {course.coursType}
                </span>
                <h2 class="my-2 text-2xl font-bold text-slate-800">
                  {course.titre}
                </h2>
                <p class="mb-4 text-slate-600">{course.description}</p>
                {course.pieceTheatre && (
                  <p class="mb-4 text-sm italic text-slate-500">
                    Pièce : {course.pieceTheatre}
                  </p>
                )}

                <div class="space-y-2 text-sm text-slate-700">
                  <div class="flex items-center">
                    <span class="w-6">📍</span>
                    <span>{course.adressePreInscription}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="w-6">📅</span>
                    <span>{course.jourRepetition}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="w-6">🚀</span>
                    <span>Démarrage : {course.demarrage.join(", ")}</span>
                  </div>
                  {course.courEssai && course.courEssai.length > 0 && (
                    <div class="flex items-center">
                      <span class="w-6">🧪</span>
                      <span>
                        Un cours d'essai au choix :{" "}
                        {course.courEssai.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div class="mt-6 flex items-center justify-between">
                <p class="text-xl font-bold text-slate-900">
                  {course.coursType === "Act'Impro"
                    ? "À partir de 220€"
                    : formatTarif(course.tarif)}
                </p>
                <button
                  onClick={() => onSelectCourse(course.id)}
                  class="bg-madRed hover:bg-madEncart rounded-md px-4 py-2 font-bold text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  Détails
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
