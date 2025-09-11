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

    if (subscribedUserId.current !== currentUserId) {
      if (subscribedUserId.current) {
        unsubscribeFromUserChanges(subscribedUserId.current);
      }

      if (currentUserId) {
        subscribeToUserChanges(currentUserId);
        subscribedUserId.current = currentUserId;
      } else {
        subscribedUserId.current = null;
      }
    }

    return () => {
      if (subscribedUserId.current) {
        unsubscribeFromUserChanges(subscribedUserId.current);
        subscribedUserId.current = null;
      }
    };
  }, [user?.id]);

  return null;
}
