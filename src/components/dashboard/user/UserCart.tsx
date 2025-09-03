import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/preact";
import { PUBLIC_PB_URL } from "astro:env/client";
import { useState } from "preact/hooks";

import { pb } from "../../../lib/pocketbase";
import { $cart, removeCourseFromCart } from "../../../lib/stores/cartStore";
import { $user } from "../../../lib/stores/userStore";
import type { CartItem } from "../../../type";

export default function UserCart() {
  const cartItems = useStore($cart);
  const [promoCode, setPromoCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useStore($user);

  const getCoursePrice = (course: CartItem): number => {
    return course.selectedTarif || 0;
  };

  const subTotal = cartItems.reduce(
    (acc, item) => acc + getCoursePrice(item),
    0,
  );

  const total = subTotal; // Le calcul de la réduction se fera côté serveur

  // Note : Ce code suppose que tu as accès à l'instance du SDK PocketBase
  // via une variable `pb`, initialisée quelque part dans ton application.
  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    setError(null);

    if (!pb.authStore.isValid) {
      setError("Vous devez être connecté pour procéder au paiement.");
      setIsProcessing(false);
      return;
    }

    // La préparation du payload reste identique
    const checkoutItems = cartItems.map((item) => ({
      courseId: item.id,
      selectedTarif: item.selectedTarif,
      cartItemId: item.cartItemId,
      titre: item.titre,
    }));

    const payload = {
      userId: pb.authStore.record?.id,
      items: checkoutItems,
      promoCode: promoCode.trim(),
      subTotal: subTotal,
    };
    console.log(payload);
    try {
      // --- CHANGEMENT ICI : On remplace fetch par pb.send ---
      const responseData = await pb.send("/api/checkout", {
        method: "POST",
        // L'en-tête "Authorization" est ajouté automatiquement !
        headers: {
          "Content-Type": "application/json",
        },
        // pb.send s'occupe de JSON.stringify() pour nous
        body: payload,
      });

      // La réponse de pb.send est déjà le JSON parsé, pas besoin de .json()
      if (responseData.redirectUrl) {
        window.location.href = responseData.redirectUrl;
      } else {
        throw new Error("URL de paiement non reçue du serveur.");
      }
    } catch (err: any) {
      // Le SDK PocketBase renvoie des erreurs structurées, c'est plus propre
      const errorMessage =
        err.data?.message || err.message || "Une erreur est survenue.";
      console.error("Erreur lors de la tentative de paiement:", err);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div class="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <h2 class="text-2xl font-bold text-gray-800">Votre Panier</h2>

      {cartItems.length === 0 ? (
        <div class="mt-8 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p class="text-lg font-medium text-gray-700">
            Votre panier est vide.
          </p>
        </div>
      ) : (
        <div class="mt-8 space-y-6">
          <ul class="divide-y divide-gray-200">
            {cartItems.map((item) => {
              const professor = item.expand?.profID;

              return (
                <li
                  key={item.cartItemId}
                  class="flex items-center justify-between py-4"
                >
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      {item.coursType}
                    </p>
                    <p class="font-medium text-gray-900">{item.titre}</p>
                    {professor && (
                      <p class="text-sm text-gray-500">
                        Avec {professor.prenom} {professor.nom}
                      </p>
                    )}
                    <p class="mt-1 text-sm font-bold text-gray-800">
                      {getCoursePrice(item).toFixed(2)} €
                    </p>
                  </div>
                  <button
                    onClick={() => removeCourseFromCart(item.cartItemId)}
                    class="hover:text-madRed text-gray-400 transition-colors"
                    title="Supprimer l'article"
                  >
                    <Icon icon="lucide:trash-2" width="20" />
                  </button>
                </li>
              );
            })}
          </ul>

          <div class="border-t border-gray-200 pt-4">
            <div class="space-y-2">
              <div class="flex justify-between text-sm text-gray-600">
                <span>Sous-total</span>
                <span>{subTotal.toFixed(2)} €</span>
              </div>
              <div class="flex justify-between text-base font-medium text-gray-900">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>

            {/* --- CHAMP CODE PROMO AJOUTÉ --- */}
            <div class="mt-6">
              <label
                for="promo-code"
                class="block text-sm font-medium text-gray-700"
              >
                Ajouter un code promo
              </label>
              <div class="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="promo-code"
                  id="promo-code"
                  value={promoCode}
                  onInput={(e) =>
                    setPromoCode(
                      (e.target as HTMLInputElement).value.toUpperCase(),
                    )
                  }
                  class="block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="VOTRECODEPROMO"
                />
              </div>
            </div>
          </div>

          <div class="mt-6">
            {error && (
              <div class="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                <p>{error}</p>
              </div>
            )}
            <button
              onClick={handleProceedToPayment}
              disabled={isProcessing}
              class="bg-madRed flex w-full items-center justify-center rounded-md px-4 py-3 text-base font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-opacity-50"
            >
              {isProcessing ? (
                <>
                  <Icon
                    icon="lucide:loader-2"
                    class="mr-2 h-5 w-5 animate-spin"
                  />
                  Traitement...
                </>
              ) : (
                `Procéder au paiement (${total.toFixed(2)} €)`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
