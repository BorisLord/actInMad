import { pb } from "../pocketbase";
import { updateUser } from "../stores/userStore";

export const subscribeToUserChanges = async (userId: string) => {
  console.log("📡 [RealTime] Attempting to subscribe to user changes for userId:", userId);
  
  try {
    await pb.collection("users").subscribe(userId, (e) => {
      console.log("🔄 [RealTime] Received event:", {
        action: e.action,
        recordId: e.record?.id,
        record: e.record
      });
      
      if (e.action === "update") {
        console.log("✅ [RealTime] Updating user store with new data");
        updateUser(e.record);
      } else {
        console.log("ℹ️ [RealTime] Ignoring action:", e.action);
      }
    });
    
    console.log("✅ [RealTime] Successfully subscribed to user changes for userId:", userId);
  } catch (error) {
    console.error("❌ [RealTime] Failed to subscribe to user changes:", error);
  }
};

export const unsubscribeFromUserChanges = async (userId: string) => {
  console.log("🔌 [RealTime] Attempting to unsubscribe from user changes for userId:", userId);
  
  try {
    await pb.collection("users").unsubscribe(userId);
    console.log("✅ [RealTime] Successfully unsubscribed from user changes for userId:", userId);
  } catch (error) {
    console.error("❌ [RealTime] Failed to unsubscribe from user changes:", error);
  }
};
