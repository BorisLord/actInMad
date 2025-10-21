// src/components/preact/DashboardNav.tsx
import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/preact";
import type { FunctionalComponent } from "preact";

import { $cart } from "../../lib/stores/cartStore";
import type { NavItem } from "../../types/typesF";

type NavProps = {
  currentPage: string;
  onPageChange: (pageId: string) => void;
};

const navItems: NavItem[] = [
  { id: "UserAccount", label: "Mon Compte", icon: "lucide:person-standing" },
  { id: "UserSubscription", label: "Inscription", icon: "lucide:notebook-pen" },
  { id: "UserCourse", label: "Mes Cours", icon: "lucide:theater" },
  { id: "UserDocument", label: "Documents", icon: "lucide:file-spreadsheet" },
  { id: "UserSetting", label: "Paramètres", icon: "lucide:settings" },
];

const DashboardNav: FunctionalComponent<NavProps> = ({
  currentPage,
  onPageChange,
}) => {
  const cart = useStore($cart);

  return (
    <nav class="sticky top-24 z-40 bg-madBack shadow-md">
      <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <ul
          class="-mb-px flex flex-wrap justify-center gap-3"
          role="tablist"
          aria-label="Navigation du tableau de bord"
        >
          {navItems.map((item) => (
            <li key={item.id} role="presentation">
              <button
                onClick={() => onPageChange(item.id)}
                class={`flex shrink-0 items-center gap-0.5 rounded-t-lg p-3 text-sm font-medium transition ${
                  currentPage === item.id
                    ? "border-b-2 border-madRed bg-madRed/5 font-bold text-madRed"
                    : "border-b-2 border-transparent text-gray-600 hover:bg-black/5 hover:text-madRed"
                }`}
                role="tab"
                aria-selected={currentPage === item.id}
                title={item.label}
              >
                <Icon icon={item.icon} width="20" />
                <span class="hidden sm:inline">{item.label}</span>
              </button>
            </li>
          ))}

          <li role="presentation">
            <button
              onClick={() => onPageChange("UserCart")}
              class={`relative flex shrink-0 items-center gap-0.5 rounded-t-lg p-3 text-sm font-medium transition ${
                currentPage === "UserCart"
                  ? "border-b-2 border-madRed bg-madRed/5 font-bold text-madRed"
                  : "border-b-2 border-transparent text-gray-600 hover:bg-black/5 hover:text-madRed"
              }`}
              role="tab"
              aria-selected={currentPage === "UserCart"}
              title="Panier d'inscription"
            >
              <Icon icon="lucide:shopping-cart" width="20" />
              <span class="hidden sm:inline">Panier</span>
              {cart.length > 0 && (
                <span class="absolute top-1 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-madRed/60 text-xs font-bold text-white">
                  {cart.length}
                </span>
              )}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default DashboardNav;
