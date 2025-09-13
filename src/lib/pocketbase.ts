import { PUBLIC_PB_URL } from "astro:env/client";
import PocketBase from "pocketbase";

export const pb = new PocketBase(PUBLIC_PB_URL);

export const getFileUrl = async (
  collectionName: string,
  recordId: string,
): Promise<string | null> => {
  console.log("in getFilUrl");
  if (!collectionName || !recordId) {
    return null;
  }

  try {
    const record = await pb.collection(collectionName).getOne(recordId);

    const { avatar, photo } = record;

    if (collectionName === "users") {
      return pb.files.getURL(record, avatar);
    } else {
      return pb.files.getURL(record, photo);
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération du fichier FilUrl":`, error);
    return null;
  }
};
