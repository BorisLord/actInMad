import { persistentAtom } from "@nanostores/persistent";

import type { CartItem } from "../../type";

export const $cart = persistentAtom<CartItem[]>("userCart", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function addCourseToCart(cartItem: CartItem) {
  $cart.set([...$cart.get(), cartItem]);
}

export function removeCourseFromCart(cartItemIdToRemove: string) {
  const currentCart = $cart.get();
  const updatedCart = currentCart.filter(
    (item) => item.cartItemId !== cartItemIdToRemove,
  );
  $cart.set(updatedCart);
}

export function clearCart() {
  $cart.set([]);
}
