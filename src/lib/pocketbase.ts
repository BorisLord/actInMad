import { PUBLIC_PB_URL } from "astro:env/client";
import PocketBase from "pocketbase";

export const pb = new PocketBase(PUBLIC_PB_URL);

export const getFileUrl = async (
  collectionName: string,
  recordId: string,
  fieldName?: string,
): Promise<string | null> => {
  if (!collectionName || !recordId || !fieldName) {
    return null;
  }

  try {
    const record = await pb.collection(collectionName).getOne(recordId);

    const fileField = record[fieldName];

    if (!fileField) {
      return null;
    }

    let filename: string;
    if (Array.isArray(fileField)) {
      filename = fileField[0];
    } else {
      filename = fileField;
    }

    if (!filename) {
      return null;
    }

    const url = pb.files.getURL(record, filename);
    return url;
  } catch (error) {
    // Le message d'erreur inclut maintenant le contexte pour un meilleur débogage
    console.error(
      `❌ [PocketBase] Erreur lors de la récupération du fichier du champ "${fieldName}" pour l'enregistrement "${recordId}" dans la collection "${collectionName}":`,
      error,
    );
    return null;
  }
};
