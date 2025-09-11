import { PUBLIC_PB_URL } from "astro:env/client";
import PocketBase from "pocketbase";

export const pb = new PocketBase(PUBLIC_PB_URL);

export const getAvatarUrl = async (
  userId: string,
  avatarFileName: string,
): Promise<string | null> => {
  console.log("🖼️ [PocketBase] getAvatarUrl called with:", {
    userId,
    avatarFileName,
    hasUserId: !!userId,
    hasAvatarFileName: !!avatarFileName,
  });

  if (!userId || !avatarFileName) {
    console.log("⚠️ [PocketBase] Missing required parameters, returning null");
    return null;
  }

  try {
    console.log("📡 [PocketBase] Fetching user record from database...");
    const record = await pb.collection("users").getOne(userId);
    console.log("✅ [PocketBase] User record fetched successfully:", {
      recordId: record.id,
      hasAvatar: !!record.avatar,
      avatarField: record.avatar,
    });

    console.log("🔗 [PocketBase] Generating file URL...");
    const url = pb.files.getURL(record, avatarFileName);
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
