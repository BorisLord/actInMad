import { useStore } from "@nanostores/preact";
import { useEffect } from "preact/hooks";

import {
  subscribeToUserChanges,
  unsubscribeFromUserChanges,
} from "../lib/services/realTimeUserServices";
import { $user } from "../lib/stores/userStore";

export default function RealtimeManager() {
  const user = useStore($user);

  useEffect(() => {
    if (user && user.id) {
      subscribeToUserChanges(user.id);
    }

    return () => {
      if (user && user.id) {
        unsubscribeFromUserChanges(user.id);
      }
    };
  }, [user?.id]);

  return null;
}
