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
    avatarUrl: undefined,
  };

  console.log("✅ [UserStore] Setting user data in store");
  $user.set(userData);

  console.log("📡 [UserStore] Subscribing to user changes");
  subscribeToUserChanges(userData.id);

  console.log("🖼️ [UserStore] Starting avatar fetch process...");

  // Utiliser setTimeout pour s'assurer que la fonction s'exécute
  setTimeout(async () => {
    console.log("⏰ [UserStore] Avatar fetch timeout triggered");
    try {
      console.log("🔍 [UserStore] Attempting to fetch avatar for user:", {
        userId: authData.record.id,
        avatarFilename: authData.record.avatar,
      });

      if (!authData.record.avatar) {
        console.log(
          "⚠️ [UserStore] No avatar filename provided, skipping avatar fetch",
        );
        return;
      }

      const avatarUrl = await getAvatarUrl(
        authData.record.id,
        authData.record.avatar,
      );

      console.log("✅ [UserStore] Avatar URL fetched successfully:", avatarUrl);

      if (avatarUrl) {
        $user.setKey("avatarUrl", avatarUrl);
        console.log("🎯 [UserStore] Avatar URL has been set in the user store");
      } else {
        console.log(
          "⚠️ [UserStore] No avatar URL returned, skipping store update",
        );
      }
    } catch (error) {
      console.error("❌ [UserStore] ERROR: Failed to fetch or set avatar");
      console.error("👤 User ID:", authData.record.id);
      console.error("📁 Avatar filename:", authData.record.avatar);
      console.error("🔍 Error details:", error);
      console.error(
        "📊 Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );
    }
  }, 100); // Délai de 100ms pour s'assurer que l'exécution se fait
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
