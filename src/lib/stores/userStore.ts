import { persistentMap } from "@nanostores/persistent";

export type User = {
  token: string;
  id: string;
  email: string;
  verified: string;
};

export const $user = persistentMap<User>("user:", {
  token: "",
  id: "",
  email: "",
  verified: "",
});

export function setUser(authData: any) {
  // type pocketbase
  $user.set({
    token: authData.token,
    id: authData.record.id,
    email: authData.record.email,
    verified: authData.record.verified,
  });
}

export function clearUser() {
  $user.set({ token: "", id: "", email: "", verified: "" });
}
