// src/components/preact/DashboardNav.tsx
import type { FunctionalComponent } from "preact";
import { Icon } from "@iconify/react";

type NavItem = {
  id: string;
  label: string;
  icon: string;
};

type NavProps = {
  currentPage: string;
  onPageChange: (pageId: string) => void;
};

const navItems: NavItem[] = [
  { id: "UserAccount", label: "Mon Compte", icon: "lucide:person-standing" },
  { id: "UserSubscription", label: "Abonnements", icon: "lucide:notebook-pen" },
  { id: "UserCourse", label: "Mes Cours", icon: "lucide:theater" },
  { id: "UserDocument", label: "Documents", icon: "lucide:file-spreadsheet" },
  { id: "UserSetting", label: "Paramètres", icon: "lucide:settings" },
];

const DashboardNav: FunctionalComponent<NavProps> = ({
  currentPage,
  onPageChange,
}) => {
  return (
    // === MODIFICATIONS ICI ===
    <nav className="sticky top-24 z-40 bg-madBack shadow-md">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <ul
          className="flex justify-center -mb-px gap-6"
          role="tablist"
          aria-label="Navigation du tableau de bord"
        >
          {navItems.map((item) => (
            <li key={item.id} role="presentation">
              <button
                onClick={() => onPageChange(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-t-lg p-3 text-sm font-medium transition
                  ${
                    currentPage === item.id
                      ? "border-b-2 border-madRed bg-madRed/5 text-madRed font-bold"
                      : "border-b-2 border-transparent text-gray-600 hover:bg-black/5 hover:text-madRed"
                  }
                `}
                role="tab"
                aria-selected={currentPage === item.id}
                title={item.label}
              >
                <Icon icon={item.icon} width="20" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default DashboardNav;
