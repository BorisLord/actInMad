import { PUBLIC_PB_URL } from "astro:env/client";
import PocketBase from "pocketbase";

export const pb = new PocketBase(PUBLIC_PB_URL);

export const getAvatarUrl = async (
  userId: string,
  avatarFileName?: string,
): Promise<string | null> => {
  if (!userId) {
    return null;
  }

  try {
    const record = await pb.collection("users").getOne(userId);

    if (!record.avatar) {
      return null;
    }

    // Utiliser record.avatar directement (comme dans la documentation PocketBase)
    let filename: string;
    if (Array.isArray(record.avatar)) {
      filename = record.avatar[0];
    } else {
      filename = record.avatar;
    }

    if (!filename) {
      return null;
    }

    const url = pb.files.getURL(record, filename);
    console.log("✅ [PocketBase] Avatar URL generated for user:", userId);

    return url;
  } catch (error) {
    console.error(
      "❌ [PocketBase] Error fetching avatar URL for user:",
      userId,
      error,
    );
    return null;
  }
};
