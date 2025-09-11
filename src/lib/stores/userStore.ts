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
  console.log("🔄 [UserStore] updateUser called with:", updatedRecord);
  const currentUser = $user.get();
  const newUserData = { ...currentUser, ...updatedRecord };
  console.log("📊 [UserStore] Current user:", currentUser);
  console.log("📊 [UserStore] New user data:", newUserData);
  $user.set(newUserData);
}

export function setUser(authData: any) {
  console.log("🔧 [UserStore] setUser function called with:", {
    userId: authData?.record?.id,
    email: authData?.record?.email,
    hasAvatar: !!authData?.record?.avatar,
    avatarFilename: authData?.record?.avatar,
  });

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
    avatarUrl: undefined, // Sera récupéré plus tard sur le dashboard
  };

  console.log("✅ [UserStore] Setting user data in store");
  $user.set(userData);

  console.log("📡 [UserStore] Subscribing to user changes");
  subscribeToUserChanges(userData.id);

  console.log(
    "ℹ️ [UserStore] Avatar will be fetched later when dashboard loads",
  );
}

export async function fetchUserAvatar() {
  console.log("🖼️ [UserStore] fetchUserAvatar called");
  const user = $user.get();

  if (!user.id) {
    console.log("⚠️ [UserStore] No user ID, skipping avatar fetch");
    return;
  }

  if (user.avatarUrl) {
    console.log("ℹ️ [UserStore] Avatar already loaded, skipping fetch");
    return;
  }

  try {
    console.log("🔍 [UserStore] Fetching avatar for user:", user.id);
    const avatarUrl = await getAvatarUrl(user.id);

    console.log("✅ [UserStore] Avatar URL fetched:", avatarUrl);

    if (avatarUrl) {
      $user.setKey("avatarUrl", avatarUrl);
      console.log("🎯 [UserStore] Avatar URL set in store");
    } else {
      console.log("⚠️ [UserStore] No avatar URL returned");
    }
  } catch (error) {
    console.error("❌ [UserStore] Failed to fetch avatar:", error);
  }
}

export function clearUser() {
  console.log("🧹 [UserStore] clearUser called");
  const userId = $user.get().id;
  console.log("👤 [UserStore] Current user ID to unsubscribe:", userId);

  if (userId) {
    console.log("🔌 [UserStore] Unsubscribing from user changes");
    unsubscribeFromUserChanges(userId);
  }

  console.log("🗑️ [UserStore] Clearing user data from store");
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
