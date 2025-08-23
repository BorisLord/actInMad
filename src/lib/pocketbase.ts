import { PUBLIC_PB_URL } from "astro:env/client";
import PocketBase from "pocketbase";

import type { User } from "./stores/userStore";

export const pb = new PocketBase(PUBLIC_PB_URL);

export const getAvatarUrl = async (
  userId: string,
  avatarFileName: string,
): Promise<string | null> => {
  if (!userId || !avatarFileName) {
    return null;
  }

  try {
    const record = await pb.collection("users").getOne(userId);
    return pb.files.getURL(record, avatarFileName);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'URL de l'avatar:",
      error,
    );
    return null;
  }
};
