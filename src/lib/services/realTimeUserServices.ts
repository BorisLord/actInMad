import { pb } from "../pocketbase";
import { updateUser } from "../stores/userStore";

export const subscribeToUserChanges = (userId: string) => {
  pb.collection("users").subscribe(userId, (e) => {
    if (e.action === "update") {
      updateUser(e.record);
    }
  });
};

export const unsubscribeFromUserChanges = (userId: string) => {
  pb.collection("users").unsubscribe(userId);
};
