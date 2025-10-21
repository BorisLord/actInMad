import { pb } from "../pocketbase";

interface BankData {
  accountHolder: string;
  iban: string;
  bic?: string; // BIC optionnel mais recommandé
}

interface OrderData {
  total: number;
  discount?: number;
  items: any[]; // Gardé pour la compatibilité avec les anciens appels
  courseIds?: string[]; // Nouveau champ pour les IDs des cours
  promoCode?: string | null;
}

interface InstallmentOptions {
  installments: number;
  frequency: string;
}

interface ProcessResult {
  success: boolean;
  customerId: string;
  mandateId: string;
  commandeId: string;
  plan: any;
  checkoutUrl?: string; // URL pour l'approbation du premier paiement
  message: string;
}

// Créer un client Mollie pour l'utilisateur connecté
export const createMollieCustomer = async (): Promise<string> => {
  try {
    console.log("🔄 Tentative de création client Mollie...");
    console.log("👤 Utilisateur connecté:", pb.authStore.record?.email);

    const response = await pb.send("/api/direct-debit/customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    console.log("✅ Client Mollie créé:", response.customer_id);
    return response.customer_id;
  } catch (error: any) {
    console.error("❌ Erreur création client:", error);
    console.error("📋 Détail erreur:", {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });

    // Si l'erreur indique que le client existe déjà
    if (
      error?.message?.includes("already exists") ||
      error?.message?.includes("déjà")
    ) {
      console.log("ℹ️ Client déjà existant, tentative de récupération...");
      // On peut essayer de récupérer l'ID depuis l'utilisateur ou une autre méthode
      throw new Error(
        "Client déjà existant - implémentation de récupération nécessaire",
      );
    }

    throw error;
  }
};

// Créer un mandat avec les informations bancaires du client
export const createMandate = async (customerId: string, bankData: BankData) => {
  try {
    console.log("🔄 Tentative de création mandat...");
    console.log("🏦 Données bancaires:", {
      customerId,
      accountHolder: bankData.accountHolder,
      iban: bankData.iban.replace(/\s/g, "").substring(0, 8) + "***", // Masquer l'IBAN dans les logs
    });

    const requestBody: any = {
      customer_id: customerId,
      consumer_name: bankData.accountHolder,
      consumer_account: bankData.iban.replace(/\s/g, ""), // Supprimer les espaces
    };

    // Ajouter le BIC s'il est fourni
    if (bankData.bic?.trim()) {
      requestBody.consumer_bic = bankData.bic.trim();
    }

    const response = await pb.send("/api/direct-debit/mandate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });

    console.log("✅ Mandat créé:", {
      mandateId: response.mandate_id,
      status: response.status,
    });

    return {
      mandateId: response.mandate_id,
      mandateRecordId: response.mandate_record_id,
      status: response.status,
    };
  } catch (error: any) {
    console.error("❌ Erreur création mandat:", error);
    console.error("📋 Détail erreur mandat:", {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

// Polling pour attendre que le mandat soit validé
export const waitForMandateValidation = async (
  customerId: string,
  mandateId: string,
  maxAttempts: number = 10, // Réduit à 10 tentatives
): Promise<boolean> => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      console.log(
        `🔄 Vérification mandat (tentative ${attempts + 1}/${maxAttempts})...`,
      );

      const response = await pb.send(
        `/api/direct-debit/mandate/status?customer_id=${customerId}&mandate_id=${mandateId}`,
        { method: "GET" },
      );

      console.log(`📊 Status: ${response.status}`);

      if (response.status === "valid") {
        console.log("✅ Mandat validé!");
        return true;
      }

      if (response.status === "invalid" || response.status === "expired") {
        throw new Error(`Mandat ${response.status}`);
      }

      // Attendre 2 secondes avant la prochaine vérification (réduit)
      if (attempts < maxAttempts - 1) {
        console.log("⏳ Attente 2 secondes...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      attempts++;
    } catch (error: any) {
      console.error("❌ Erreur vérification mandat:", error);
      throw error;
    }
  }

  throw new Error(
    "Timeout: Le mandat n'a pas été validé dans les temps impartis",
  );
};

// Créer une commande via l'API checkout existante
export const createOrder = async (orderData: OrderData): Promise<string> => {
  try {
    console.log("🔄 Tentative de création commande...");
    console.log("🛒 Données commande:", {
      total: orderData.total,
      items: orderData.items.length,
      userId: pb.authStore.record?.id,
    });

    const response = await pb.send("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        total: orderData.total,
        discount: orderData.discount || 0,
        userId: pb.authStore.record?.id,
        items: orderData.items,
        promoCode: orderData.promoCode || null,
      },
    });

    console.log("✅ Réponse checkout:", response);

    // Vérifier différents formats de réponse possibles
    const orderId =
      response.order_id ||
      response.orderId ||
      response.id ||
      response.record?.id;

    if (!orderId) {
      console.error("❌ Aucun ID de commande dans la réponse:", response);
      throw new Error("ID de commande non retourné par l'API checkout");
    }

    console.log("✅ Commande créée avec ID:", orderId);
    return orderId;
  } catch (error: any) {
    console.error("❌ Erreur création commande:", error);
    console.error("📋 Détail erreur commande:", {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

// Créer un plan de paiement échelonné avec commande intégrée
export const createInstallmentPlanWithOrder = async (
  mandateRecordId: string,
  orderData: OrderData,
  installments: number,
  frequency: string,
): Promise<{ plan: any; checkoutUrl: string; commandeId: string }> => {
  try {
    console.log("🔄 Tentative de création plan d'échéances avec commande...");
    console.log("📅 Données:", {
      mandateRecordId,
      finalAmount: orderData.total,
      installments,
      frequency,
      itemsCount: orderData.items.length,
    });

    const response = await pb.send("/api/installments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        // Données du plan d'échéances
        mandateRecordId: mandateRecordId,
        finalAmount: orderData.total,
        installments: installments,
        frequency: frequency,

        // Données de la commande (pour création en interne)
        orderData: {
          total: orderData.total,
          discount: orderData.discount || 0,
          items: orderData.items,
          promoCode: orderData.promoCode || null,
        },
      },
    });

    console.log("✅ Plan d'échéances avec commande créé:", response);
    console.log("🔗 URL de checkout reçue:", response.checkoutUrl);

    return {
      plan: response.plan,
      checkoutUrl: response.checkoutUrl,
      commandeId: response.commandeId || response.plan?.commandeId,
    };
  } catch (error: any) {
    console.error("❌ Erreur création plan avec commande:", error);
    console.error("📋 Détail erreur:", {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

// Créer un plan de paiement en plusieurs fois
export const createInstallmentPlan = async (
  commandeId: string,
  mandateRecordId: string,
  finalAmount: number,
  installments: number,
  frequency: string = "monthly",
) => {
  try {
    console.log("🔄 Tentative de création plan d'échéances...");
    console.log("📅 Données plan:", {
      commandeId,
      mandateRecordId,
      finalAmount,
      installments,
      frequency,
    });

    const response = await pb.send("/api/installments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        commandeId: commandeId,
        mandateRecordId: mandateRecordId,
        finalAmount: finalAmount,
        installments: installments,
        frequency: frequency,
      },
    });

    console.log("✅ Plan d'échéances créé:", response.plan);
    console.log("🔗 URL de checkout reçue:", response.checkoutUrl);

    return {
      plan: response.plan,
      checkoutUrl: response.checkoutUrl,
    };
  } catch (error: any) {
    console.error("❌ Erreur création plan:", error);
    console.error("📋 Détail erreur plan:", {
      status: error?.status,
      message: error?.message,
      data: error?.data,
    });
    throw error;
  }
};

// Fonction principale qui orchestre tout le processus
export const processInstallmentPayment = async (
  orderData: OrderData,
  bankData: BankData,
  installmentOptions: InstallmentOptions,
): Promise<ProcessResult> => {
  try {
    console.log("🚀 Démarrage du processus de paiement échelonné...");
    console.log("📋 Paramètres:", {
      orderTotal: orderData.total,
      installments: installmentOptions.installments,
      frequency: installmentOptions.frequency,
      accountHolder: bankData.accountHolder,
    });

    // Vérifier que l'utilisateur est connecté
    if (!pb.authStore.record?.id) {
      throw new Error("Utilisateur non connecté");
    }

    // 1. Créer le client Mollie
    console.log("👤 Étape 1: Création du client Mollie...");
    const customerId = await createMollieCustomer();

    // 2. Créer le mandat
    console.log("📝 Étape 2: Création du mandat...");
    const mandateData = await createMandate(customerId, bankData);

    // 3. Créer directement le plan de paiement échelonné (qui créera la commande en interne)
    console.log("📅 Étape 3: Création du plan d'échéances avec commande...");
    const planResult = await createInstallmentPlanWithOrder(
      mandateData.mandateRecordId,
      orderData,
      installmentOptions.installments,
      installmentOptions.frequency,
    );

    console.log("🎉 Processus terminé avec succès!");

    return {
      success: true,
      customerId: customerId,
      mandateId: mandateData.mandateId,
      commandeId: planResult.commandeId,
      plan: planResult.plan,
      checkoutUrl: planResult.checkoutUrl,
      message: `Plan de paiement créé: ${installmentOptions.installments}x ${(orderData.total / installmentOptions.installments).toFixed(2)}€`,
    };
  } catch (error: any) {
    console.error("💥 Erreur dans le processus:", error);

    // Log détaillé de l'erreur
    console.error("📋 Détail complet de l'erreur:", {
      name: error?.name,
      message: error?.message,
      status: error?.status,
      data: error?.data,
      stack: error?.stack?.substring(0, 500), // Limiter la stack trace
    });

    throw error;
  }
};

// Fonction utilitaire pour valider les données bancaires
export const validateBankData = (
  bankData: BankData,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!bankData.accountHolder?.trim()) {
    errors.push("Le nom du titulaire est requis");
  }

  if (!bankData.iban?.trim()) {
    errors.push("L'IBAN est requis");
  } else {
    // Validation IBAN européen : supprimer les espaces et vérifier le format
    const cleanIban = bankData.iban.replace(/\s/g, "");
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;

    if (
      !ibanRegex.test(cleanIban) ||
      cleanIban.length < 15 ||
      cleanIban.length > 34
    ) {
      errors.push(
        "Format IBAN invalide (format européen attendu : 2 lettres + 2 chiffres + 1-30 caractères alphanumériques)",
      );
    }
  }

  // Validation BIC optionnelle
  if (bankData.bic?.trim()) {
    const cleanBic = bankData.bic.trim().toUpperCase();
    const bicRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

    if (
      !bicRegex.test(cleanBic) ||
      (cleanBic.length !== 8 && cleanBic.length !== 11)
    ) {
      errors.push("Format BIC invalide (8 ou 11 caractères alphanumériques)");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Fonction utilitaire pour vérifier l'état de l'authentification
export const checkAuthentication = (): boolean => {
  const isAuth = pb.authStore.isValid && pb.authStore.record?.id;
  console.log("🔐 État authentification:", {
    isValid: pb.authStore.isValid,
    hasRecord: !!pb.authStore.record,
    userId: pb.authStore.record?.id,
    userEmail: pb.authStore.record?.email,
  });
  return !!isAuth;
};
