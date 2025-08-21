import { useEffect } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $user } from "../lib/stores/userStore";
import {
  subscribeToUserChanges,
  unsubscribeFromUserChanges,
} from "../lib/services/realTimeUserServices";

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
