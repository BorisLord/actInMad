import { PUBLIC_PB_URL } from "astro:env/client";
import PocketBase from "pocketbase";

export const pb = new PocketBase(PUBLIC_PB_URL);

export const getAvatarUrl = async (
  userId: string,
  avatarFileName?: string,
): Promise<string | null> => {
  console.log("🖼️ [PocketBase] getAvatarUrl called with:", {
    userId,
    avatarFileName,
    hasUserId: !!userId,
    hasAvatarFileName: !!avatarFileName,
  });

  if (!userId) {
    console.log("⚠️ [PocketBase] Missing userId, returning null");
    return null;
  }

  try {
    console.log("📡 [PocketBase] Fetching user record from database...");
    const record = await pb.collection("users").getOne(userId);
    console.log("✅ [PocketBase] User record fetched successfully:", {
      recordId: record.id,
      hasAvatar: !!record.avatar,
      avatarField: record.avatar,
      avatarFieldType: Array.isArray(record.avatar)
        ? "array"
        : typeof record.avatar,
    });

    if (!record.avatar) {
      console.log("⚠️ [PocketBase] No avatar in record, returning null");
      return null;
    }

    // Utiliser record.avatar directement (comme dans la documentation PocketBase)
    let filename: string;
    if (Array.isArray(record.avatar)) {
      console.log(
        "📁 [PocketBase] Avatar field is an array, taking first element",
      );
      filename = record.avatar[0];
    } else {
      console.log(
        "📁 [PocketBase] Avatar field is a string, using it directly",
      );
      filename = record.avatar;
    }

    if (!filename) {
      console.log("⚠️ [PocketBase] Empty filename, returning null");
      return null;
    }

    console.log("🔗 [PocketBase] Generating file URL with filename:", filename);
    const url = pb.files.getURL(record, filename);
    console.log("✅ [PocketBase] Avatar URL generated:", url);

    return url;
  } catch (error) {
    console.error("❌ [PocketBase] Error fetching avatar URL:");
    console.error("👤 User ID:", userId);
    console.error("📁 Avatar filename:", avatarFileName);
    console.error("🔍 Error details:", error);
    return null;
  }
};
