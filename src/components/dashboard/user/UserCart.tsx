import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/preact";

import { $cart, removeCourseFromCart } from "../../../lib/stores/cartStore";
import type { CartItem } from "../../../type";

export default function UserCart() {
  const cartItems = useStore($cart);

  const getCoursePrice = (course: CartItem): number => {
    return course.selectedTarif || 0;
  };

  const subTotal = cartItems.reduce(
    (acc, item) => acc + getCoursePrice(item),
    0,
  );

  const total = subTotal;

  const handleProceedToPayment = async () => {
    console.log("Proceeding to payment with total:", total.toFixed(2));
    alert(
      "La logique de paiement est à connecter ici. Redirection vers Mollie...",
    );
  };

  return (
    <div class="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <h2 class="text-2xl font-bold text-gray-800">Votre Panier</h2>

      {cartItems.length === 0 ? (
        <div class="mt-8 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center"></div>
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

          <div class="space-y-2 border-t border-gray-200 pt-4">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Sous-total</span>
              <span>{subTotal.toFixed(2)} €</span>
            </div>
            <div class="flex justify-between text-base font-medium text-gray-900">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>

          <div class="mt-6">
            <button
              onClick={handleProceedToPayment}
              class="bg-madRed w-full rounded-md px-4 py-3 text-base font-medium text-white shadow-sm transition hover:bg-red-700"
            >
              Procéder au paiement ({total.toFixed(2)} €)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
