import { Icon } from "@iconify/react";
import { useState } from "preact/hooks";

interface BankData {
  accountHolder: string;
  iban: string;
  bic?: string; // BIC optionnel mais recommandé
}

interface InstallmentOptions {
  installments: number;
  frequency: string;
}

interface InstallmentPaymentFormProps {
  orderTotal: number;
  onSuccess: (result: any) => void;
  onCancel: () => void;
  isProcessing: boolean;
  onSubmit: (
    bankData: BankData,
    installmentOptions: InstallmentOptions,
  ) => Promise<void>;
}

export default function InstallmentPaymentForm({
  orderTotal,
  onSuccess,
  onCancel,
  isProcessing,
  onSubmit,
}: InstallmentPaymentFormProps) {
  const [bankData, setBankData] = useState<BankData>({
    accountHolder: "",
    iban: "",
    bic: "",
  });
  const [installments, setInstallments] = useState(2);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  console.log("The error", submitError);

  const validateIban = (iban: string): boolean => {
    // Supprimer tous les espaces pour la validation
    const cleanIban = iban.replace(/\s/g, "");

    // Validation IBAN européen : 2 lettres (pays) + 2 chiffres (clé) + 1-30 caractères alphanumériques
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;

    return (
      ibanRegex.test(cleanIban) &&
      cleanIban.length >= 15 &&
      cleanIban.length <= 34
    );
  };

  const validateBic = (bic: string): boolean => {
    if (!bic.trim()) return true; // BIC optionnel

    const cleanBic = bic.trim().toUpperCase();
    const bicRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

    return (
      bicRegex.test(cleanBic) &&
      (cleanBic.length === 8 || cleanBic.length === 11)
    );
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!bankData.accountHolder.trim()) {
      newErrors.accountHolder = "Le nom du titulaire est requis";
    }

    if (!bankData.iban.trim()) {
      newErrors.iban = "L'IBAN est requis";
    } else if (!validateIban(bankData.iban)) {
      newErrors.iban = "IBAN invalide (format européen attendu)";
    }

    if (bankData.bic?.trim() && !validateBic(bankData.bic)) {
      newErrors.bic = "BIC invalide (8 ou 11 caractères alphanumériques)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    console.log("🔵 Début handleSubmit");
    console.log("🔵 Données bancaires:", bankData);

    // Réinitialiser l'erreur de soumission
    setSubmitError(null);

    if (!validateForm()) {
      console.log("❌ Validation échouée");
      return;
    }

    console.log("✅ Validation réussie");

    const installmentOptions = {
      installments,
      frequency: "monthly",
    };

    console.log("🔵 Options d'échéances:", installmentOptions);

    try {
      console.log("🔵 Appel de onSubmit...");
      await onSubmit(bankData, installmentOptions);
      console.log("✅ onSubmit terminé");
    } catch (error: any) {
      console.error("❌ Erreur dans handleSubmit:", error);
      setSubmitError("Un problème s'est glissé dans vos informations");
    }
  };

  const handleButtonClick = async () => {
    console.log("🔵 Début handleButtonClick");
    console.log("🔵 Données bancaires:", bankData);

    // Réinitialiser l'erreur de soumission
    setSubmitError(null);

    if (!validateForm()) {
      console.log("❌ Validation échouée");
      return;
    }

    console.log("✅ Validation réussie");

    const installmentOptions = {
      installments,
      frequency: "monthly",
    };

    console.log("🔵 Options d'échéances:", installmentOptions);

    try {
      console.log("🔵 Appel de onSubmit...");
      await onSubmit(bankData, installmentOptions);
      console.log("✅ onSubmit terminé");
    } catch (error: any) {
      console.error("❌ Erreur dans handleButtonClick:", error);
      setSubmitError("Un problème s'est glissé dans vos informations");
    }
  };

  const amountPerInstallment = (orderTotal / installments).toFixed(2);

  return (
    <div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div class="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Paiement en {installments} fois
          </h3>
          <button onClick={onCancel} class="text-gray-400 hover:text-gray-600">
            <Icon icon="lucide:x" width="24" />
          </button>
        </div>

        <div class="mb-4 rounded-md bg-blue-50 p-3">
          <p class="text-sm text-blue-800">
            <strong>{amountPerInstallment}€</strong> par mois pendant{" "}
            {installments} mois
          </p>
          <p class="text-xs text-blue-600">Total: {orderTotal.toFixed(2)}€</p>
        </div>

        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label
              for="accountHolder"
              class="block text-sm font-medium text-gray-700"
            >
              Nom du titulaire du compte
            </label>
            <input
              type="text"
              id="accountHolder"
              value={bankData.accountHolder}
              onInput={(e) =>
                setBankData({
                  ...bankData,
                  accountHolder: (e.target as HTMLInputElement).value,
                })
              }
              class={`mt-1 block w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.accountHolder ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Jean Dupont"
              required
            />
            {errors.accountHolder && (
              <p class="mt-1 text-sm text-red-600">{errors.accountHolder}</p>
            )}
          </div>

          <div>
            <label for="iban" class="block text-sm font-medium text-gray-700">
              IBAN
            </label>
            <input
              type="text"
              id="iban"
              value={bankData.iban}
              onInput={(e) =>
                setBankData({
                  ...bankData,
                  iban: (e.target as HTMLInputElement).value.toUpperCase(),
                })
              }
              class={`mt-1 block w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.iban ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="FR76 3000 1007 9412 3456 7890 185"
              required
            />
            {errors.iban && (
              <p class="mt-1 text-sm text-red-600">{errors.iban}</p>
            )}
          </div>

          <div>
            <label for="bic" class="block text-sm font-medium text-gray-700">
              BIC / SWIFT{" "}
              <span class="text-sm text-gray-500">
                (optionnel mais recommandé)
              </span>
            </label>
            <input
              type="text"
              id="bic"
              value={bankData.bic || ""}
              onInput={(e) =>
                setBankData({
                  ...bankData,
                  bic: (e.target as HTMLInputElement).value.toUpperCase(),
                })
              }
              class={`mt-1 block w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                errors.bic ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="BNPAFRPP ou BNPAFRPPXXX"
              maxLength={11}
            />
            {errors.bic && (
              <p class="mt-1 text-sm text-red-600">{errors.bic}</p>
            )}
            <p class="mt-1 text-xs text-gray-500">
              Le BIC facilite le traitement des prélèvements SEPA
            </p>
          </div>

          <div>
            <label
              for="installments"
              class="block text-sm font-medium text-gray-700"
            >
              Nombre d'échéances
            </label>
            <select
              id="installments"
              value={installments}
              onChange={(e) =>
                setInstallments(parseInt((e.target as HTMLSelectElement).value))
              }
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value={2}>
                2 fois ({(orderTotal / 2).toFixed(2)}€/mois)
              </option>
              <option value={3}>
                3 fois ({(orderTotal / 3).toFixed(2)}€/mois)
              </option>
              <option value={4}>
                4 fois ({(orderTotal / 4).toFixed(2)}€/mois)
              </option>
              <option value={5}>
                5 fois ({(orderTotal / 5).toFixed(2)}€/mois)
              </option>
              <option value={6}>
                6 fois ({(orderTotal / 6).toFixed(2)}€/mois)
              </option>
            </select>
          </div>

          {submitError && (
            <div class="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
              <div class="flex items-center">
                <Icon
                  icon="lucide:alert-triangle"
                  class="mr-2 h-5 w-5 text-red-400"
                />
                <p class="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          )}

          <div class="mt-6 flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              class="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={isProcessing}
              class="disabled:bg-opacity-50 flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Icon
                    icon="lucide:loader-2"
                    class="mr-2 inline h-4 w-4 animate-spin"
                  />
                  Configuration...
                </>
              ) : (
                "Configurer le paiement"
              )}
            </button>
          </div>
        </form>

        <div class="mt-4 text-xs text-gray-500">
          <p>• Le premier prélèvement aura lieu immédiatement</p>
          <p>• Les suivants auront lieu chaque mois à la même date</p>
        </div>
      </div>
    </div>
  );
}
