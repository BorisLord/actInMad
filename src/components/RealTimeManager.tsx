import { useStore } from "@nanostores/preact";
import { useEffect, useRef } from "preact/hooks";

import {
  subscribeToUserChanges,
  unsubscribeFromUserChanges,
} from "../lib/services/realTimeUserServices";
import { $user } from "../lib/stores/userStore";

export default function RealtimeManager() {
  const user = useStore($user);
  const subscribedUserId = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId = user?.id;
    console.log("🔄 [RealtimeManager] User changed:", {
      previousUserId: subscribedUserId.current,
      currentUserId,
      hasUser: !!user
    });

    // Si l'utilisateur a changé ou s'est déconnecté
    if (subscribedUserId.current !== currentUserId) {
      // Désabonner de l'ancien utilisateur
      if (subscribedUserId.current) {
        console.log("🔌 [RealtimeManager] Unsubscribing from previous user:", subscribedUserId.current);
        unsubscribeFromUserChanges(subscribedUserId.current);
      }

      // S'abonner au nouvel utilisateur
      if (currentUserId) {
        console.log("📡 [RealtimeManager] Subscribing to new user:", currentUserId);
        subscribeToUserChanges(currentUserId);
        subscribedUserId.current = currentUserId;
      } else {
        console.log("👤 [RealtimeManager] No user logged in, clearing subscription");
        subscribedUserId.current = null;
      }
    }

    return () => {
      if (subscribedUserId.current) {
        console.log("🧹 [RealtimeManager] Cleanup: Unsubscribing from user:", subscribedUserId.current);
        unsubscribeFromUserChanges(subscribedUserId.current);
        subscribedUserId.current = null;
      }
    };
  }, [user?.id]);

  return null;
}
