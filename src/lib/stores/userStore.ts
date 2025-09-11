import { persistentMap } from "@nanostores/persistent";

import type { User } from "../../type";
import { getAvatarUrl } from "../pocketbase";
import {
  subscribeToUserChanges,
  unsubscribeFromUserChanges,
} from "../services/realTimeUserServices";

export const $user = persistentMap<User>(
  "user:",
  {
    id: undefined,
    email: undefined,
    profileCompleted: undefined,
    verified: undefined,
    firstName: undefined,
    lastName: undefined,
    phone: undefined,
    birthdate: undefined,
    theaterLevel: undefined,
    avatarUrl: undefined,
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
    avatarUrl: undefined,
  };

  $user.set(userData);

  subscribeToUserChanges(userData.id);

  (async () => {
    const avatar = await getAvatarUrl(
      authData.record.id,
      authData.record.avatar,
    );
    if (avatar) {
      $user.setKey("avatarUrl", avatar);
    }
  })();
}

export function clearUser() {
  const userId = $user.get().id;

  if (userId) {
    unsubscribeFromUserChanges(userId);
  }

  $user.set({
    id: undefined,
    email: undefined,
    verified: undefined,
    profileCompleted: undefined,
    firstName: undefined,
    lastName: undefined,
    phone: undefined,
    theaterLevel: undefined,
    birthdate: undefined,
    avatarUrl: undefined,
  });
}
