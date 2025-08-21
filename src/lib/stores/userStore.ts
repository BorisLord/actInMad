import { persistentMap } from "@nanostores/persistent";

import {
  subscribeToUserChanges,
  unsubscribeFromUserChanges,
} from "../services/realTimeUserServices";

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthdate?: string;
  theaterLevel?: "Debutant" | "Intermediaire" | "Confirme" | undefined;
  verified: boolean;
  profileCompleted?: boolean;
};

export const $user = persistentMap<User>(
  "user:",
  {
    id: "",
    email: "",
    firstName: undefined,
    lastName: undefined,
    phone: undefined,
    birthdate: undefined,
    theaterLevel: undefined,
    verified: false,
    profileCompleted: false,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  },
);

export function updateUser(updatedRecord: Partial<User>) {
  const currentUser = $user.get();
  $user.set({ ...currentUser, ...updatedRecord });
}

export function setUser(authData: any) {
  const userData = {
    id: authData.record.id,
    email: authData.record.email,
    verified: authData.record.verified,
    firstName: authData.record.firstName,
    lastName: authData.record.lastName,
    phone: authData.record.phone,
    theaterLevel: authData.record.theaterLevel,
    profileCompleted: authData.record.profileCompleted,
    birthdate: authData.record.birthdate,
  };
  $user.set(userData);

  subscribeToUserChanges(userData.id);
}

export function clearUser() {
  const userId = $user.get().id;

  if (userId) {
    unsubscribeFromUserChanges(userId);
  }

  $user.set({
    id: "",
    email: "",
    verified: false,
    firstName: undefined,
    lastName: undefined,
    phone: undefined,
    theaterLevel: undefined,
    profileCompleted: false,
    birthdate: undefined,
  });
}
