import { pb } from "../pocketbase";
import { updateUser } from "../stores/userStore";

export const subscribeToUserChanges = async (userId: string) => {
  try {
    await pb.collection("users").subscribe(userId, (e) => {
      if (e.action === "update") {
        updateUser(e.record);
      }
    });
  } catch (error) {
    console.error("Failed to subscribe to user changes:", error);
  }
};

export const unsubscribeFromUserChanges = async (userId: string) => {
  try {
    await pb.collection("users").unsubscribe(userId);
  } catch (error) {
    console.error("Failed to unsubscribe from user changes:", error);
  }
};
