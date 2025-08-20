import { map } from "nanostores";

export type User = {
  token: string;
  id: string;
  email: string;
  verified: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  theaterLevel?: "Debutant" | "Intermediaire" | "Confirme" | undefined;
  profileCompleted?: string;
};

export const $user = map<User>({
  token: "",
  id: "",
  email: "",
  verified: "",
  firstName: undefined,
  lastName: undefined,
  phone: undefined,
  theaterLevel: undefined,
  profileCompleted: undefined,
});

export function setUser(authData: any) {
  $user.set({
    token: authData.token,
    id: authData.record.id,
    email: authData.record.email,
    verified: authData.record.verified,
    firstName: authData.record.firstName,
    lastName: authData.record.lastName,
    phone: authData.record.phone,
    theaterLevel: authData.record.theaterLevel,
    profileCompleted: authData.record.profileCompleted,
  });
}

export function clearUser() {
  $user.set({ token: "", id: "", email: "", verified: "" });
}
