import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/preact";
import { useEffect, useState } from "preact/hooks";

import { pb } from "../../../lib/pocketbase";
import {
  $cart,
  clearCart,
  removeCourseFromCart,
} from "../../../lib/stores/cartStore";
import type { CartItem, PromoData } from "../../../types/typesF";

export default function UserCart() {
  const cartItems = useStore($cart);
  const [promoCode, setPromoCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [promoData, setPromoData] = useState<PromoData | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  const getCoursePrice = (course: CartItem): number => {
    return course.selectedTarif || 0;
  };

  const subTotal = cartItems.reduce(
    (acc, item) => acc + getCoursePrice(item),
    0,
  );

  const discount = promoData?.discountAmount || 0;
  const total = subTotal - discount;

  useEffect(() => {
    if (promoCode.trim() === "") {
      setPromoData(null);
      setPromoError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsVerifyingPromo(true);
      setPromoError(null);
      setPromoData(null);

      try {
        const response = await pb.send("/api/promo/verify", {
          method: "POST",
          body: {
            code: promoCode.toLowerCase(),
            cartTotal: subTotal,
          },
        });

        if (response.isValid) {
          setPromoData(response);
        }
        if (!response.isValid) {
          setPromoError(response.message);
        }
      } catch (err: any) {
        setPromoError(err.data?.message || "Ce code est invalide.");
        setPromoData(null);
      } finally {
        setIsVerifyingPromo(false);
      }
    }, 1800);

    return () => {
      clearTimeout(timer);
    };
  }, [promoCode, subTotal]);

  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    setError(null);

    if (!pb.authStore.isValid) {
      setError("Vous devez être connecté pour procéder au paiement.");
      setIsProcessing(false);
      return;
    }

    const checkoutItems = cartItems.map((item) => ({
      courseId: item.id,
      selectedTarif: item.selectedTarif,
      cartItemId: item.cartItemId,
      titre: item.titre,
    }));

    const payload = {
      userId: pb.authStore.record?.id,
      items: checkoutItems,
      promoCode: promoData !== null ? promoCode.trim().toLowerCase() : null,
      subTotal: subTotal,
    };
    try {
      const responseData = await pb.send("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      });

      if (responseData.redirectUrl) {
        window.location.href = responseData.redirectUrl;
      } else {
        throw new Error("URL de paiement non reçue du serveur.");
      }
    } catch (err: any) {
      const errorMessage =
        err.data?.message || err.message || "Une erreur est survenue.";
      console.error("Erreur lors de la tentative de paiement:", err);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
      clearCart();
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
                  </div>
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-semibold text-gray-900">
                      {getCoursePrice(item).toFixed(2)} €
                    </p>
                    <button
                      onClick={() => removeCourseFromCart(item.cartItemId)}
                      class="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Supprimer l'article"
                    >
                      <span class="sr-only">Supprimer</span>
                      <Icon icon="lucide:trash-2" width="20" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div class="space-y-4 border-t border-gray-200 pt-4">
            <div class="space-y-1">
              <div class="flex justify-between text-sm text-gray-600">
                <span>Sous-total</span>
                <span>{subTotal.toFixed(2)} €</span>
              </div>
              {promoData && (
                <div class="flex justify-between text-sm font-medium text-green-600">
                  <span>Réduction ({promoCode})</span>
                  <span>- {discount.toFixed(2)} €</span>
                </div>
              )}
            </div>

            <div class="flex items-center justify-between border-t border-dashed pt-4">
              <span class="text-base font-medium text-gray-900">Total</span>
              <span class="text-xl font-bold text-gray-900">
                {total.toFixed(2)} €
              </span>
            </div>

            <div class="pt-2">
              <button
                type="button"
                onClick={() => setShowPromoInput(!showPromoInput)}
                class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                {showPromoInput ? "Annuler" : "Ajouter un code promo"}
              </button>

              {showPromoInput && (
                <div class="mt-2 md:max-w-xs">
                  <div class="flex items-center">
                    <div class="flex-1">
                      <label for="promo-code" class="sr-only">
                        Code Promo
                      </label>
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
                        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="VOTRECODEPROMO"
                      />
                    </div>
                    <div class="ml-2 w-5 flex-shrink-0">
                      {isVerifyingPromo && (
                        <Icon
                          icon="lucide:loader-2"
                          className="h-5 w-5 animate-spin text-gray-400"
                        />
                      )}
                      {!isVerifyingPromo && promoData && (
                        <Icon
                          icon="lucide:check-circle-2"
                          className="h-5 w-5 text-green-500"
                        />
                      )}
                    </div>
                  </div>
                  {promoError && (
                    <p class="mt-2 text-sm text-red-600">{promoError}</p>
                  )}
                </div>
              )}
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
                `Procéder au paiement`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
