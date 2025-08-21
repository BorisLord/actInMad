// src/components/preact/Navbar.tsx
import { useState, useEffect, useRef } from "preact/hooks";
import type { FunctionalComponent, Ref } from "preact";
import { Icon } from "@iconify/react";
import { navigate } from "astro:transitions/client";
import { useStore } from "@nanostores/preact";

import { $user, clearUser } from "../lib/stores/userStore";
import { pb } from "../lib/pocketbase";

// Interface de props unifiée et nettoyée
interface Link {
  href: string;
  label: string;
}

interface NavbarProps {
  links: Link[];
  currentPath: string;
  isHomePage: boolean;
  logoSrc?: string;
  onDashboardToggle?: () => void;
  dashboardToggleRef?: Ref<HTMLButtonElement>;
}

const Navbar: FunctionalComponent<NavbarProps> = ({
  links,
  currentPath,
  isHomePage,
  logoSrc,
  onDashboardToggle,
  dashboardToggleRef,
}) => {
  // --- STATE MANAGEMENT ---
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileToggleRef = useRef<HTMLButtonElement>(null);
  const user = useStore($user);

  // --- LOGIQUE DE DÉCONNEXION ---
  const handleLogout = () => {
    pb.authStore.clear();
    clearUser();
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  // Hook pour l'effet "sticky" via IntersectionObserver (performant)
  useEffect(() => {
    const watcher = document.querySelector("#scroll-watcher");
    if (!watcher) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      { rootMargin: "1px 0px 0px 0px" },
    );
    observer.observe(watcher);
    return () => observer.disconnect();
  }, []);

  // Hook pour fermer les menus en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileToggleRef.current &&
        !mobileToggleRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileToggleRef.current &&
        !profileToggleRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Préparation des données pour le rendu ---
  const mainLinks = links.slice(0, -1);
  const lastLink = links.length > 0 ? links[links.length - 1] : null;

  const desktopLinkClass = (linkHref: string) =>
    isHomePage
      ? "text-madBack"
      : getLinkClass(linkHref, "text-black", "text-madRed");
  const mobileLinkClass = (linkHref: string) =>
    isHomePage
      ? "text-madBack"
      : getLinkClass(linkHref, "text-madText", "text-madEncart");
  const getLinkClass = (linkHref: string, base: string, active: string) => {
    const normPath = currentPath.replace(/\/$/, "");
    const normHref = linkHref.replace(/\/$/, "");
    return normPath === normHref ? active : base;
  };

  const currentPageLabel =
    links.find(
      (link) => link.href.replace(/\/$/, "") === currentPath.replace(/\/$/, ""),
    )?.label || "";

  return (
    <div
      className={`mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 w-full transition-all duration-300 ${isScrolled ? "shadow-lg backdrop-blur-md rounded-b-xl" : ""}`}
    >
      <div className="flex h-24 items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          {onDashboardToggle && (
            <button
              ref={dashboardToggleRef}
              onClick={onDashboardToggle}
              className="p-2 rounded-md transition text-black hover:bg-black/10 cursor-pointer"
              aria-label="Tableau de bord"
            >
              <Icon icon="lucide:layout-dashboard" width="28" />
            </button>
          )}
          {logoSrc && (
            <a href="/" className="block">
              <span className="sr-only">Home</span>
              <img
                src={logoSrc}
                alt="L'arche d'Act In Mad"
                className="h-16 w-auto"
              />
            </a>
          )}
        </div>
        <div className="hidden md:flex items-center gap-4">
          <nav aria-label="Global">
            <ul className="flex items-center gap-6 text-sm">
              {mainLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`${desktopLinkClass(link.href)} transition hover:text-madRed/75 whitespace-nowrap`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center">
            {user && user.id ? (
              <div className="relative">
                <button
                  ref={profileToggleRef}
                  onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="h-8 w-8 rounded-full object-cover border-2 border-transparent group-hover:border-madRed transition"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-madRed flex items-center justify-center text-white font-bold text-base border-2 border-transparent group-hover:border-madEncart transition">
                      {user.firstName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span
                    className={`text-xs font-medium group-hover:text-madRed transition ${isHomePage ? "text-madBack" : "text-black"}`}
                  >
                    {user.firstName}
                  </span>
                </button>
                {isProfileMenuOpen && (
                  <div
                    ref={profileMenuRef}
                    className={`absolute top-full right-0 mt-2 w-48 z-50 rounded-xl shadow-2xl p-2 ${isHomePage ? "bg-black" : "bg-madBack"}`}
                  >
                    <ul className="flex flex-col gap-1">
                      <li>
                        <a
                          href="/private/Dashboard"
                          className={`block px-3 py-2 rounded-md transition ${mobileLinkClass("")} hover:text-madEncart hover:bg-white/10 w-full text-left`}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          Mon Espace
                        </a>
                      </li>
                      <li className="my-1 border-t border-gray-500/50"></li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left block px-3 py-2 rounded-md font-medium text-madRed hover:text-madEncart transition hover:bg-white/10 cursor-pointer"
                        >
                          Déconnexion
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              lastLink && (
                <button
                  className="rounded-md bg-madRed px-4 py-1 text-white shadow transition hover:bg-madEncart cursor-pointer"
                  onClick={() => navigate(lastLink.href)}
                >
                  {lastLink.label.split("/").map((part, index) => (
                    <div key={index} className="leading-5 text-sm">
                      {part}
                    </div>
                  ))}
                </button>
              )
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 md:hidden">
          {user && user.id ? (
            <a href="/private/Dashboard" className="flex items-center gap-2">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-madRed flex items-center justify-center text-white text-sm font-bold">
                  {user.firstName?.charAt(0).toUpperCase()}
                </div>
              )}
              <span
                className={`text-sm font-medium ${isHomePage ? "text-madBack" : "text-black"}`}
              >
                {user.firstName}
              </span>
            </a>
          ) : (
            <span
              className={`font-medium whitespace-nowrap ${isHomePage ? "text-madBack" : "text-madRed"}`}
            >
              {currentPageLabel}
            </span>
          )}
          <button
            ref={mobileToggleRef}
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Ouvrir/fermer le menu"
            aria-expanded={isMobileMenuOpen}
            className={`rounded p-2 ${isHomePage ? "text-madBack" : "text-black"} transition cursor-pointer`}
          >
            <Icon icon="lucide:book-open-text" width="28" />
          </button>
        </div>
      </div>
      <nav
        ref={mobileMenuRef}
        className={`absolute top-24 right-4 z-50 rounded-xl shadow-2xl p-4 ${isHomePage ? "bg-black" : "bg-madBack"} ${isMobileMenuOpen ? "block" : "hidden"}`}
      >
        <ul className="flex flex-col items-center gap-4 w-40">
          {mainLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`${mobileLinkClass(link.href)} hover:text-madEncart`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-3 mt-3 border-t border-gray-600 w-full text-center">
            {user && user.id ? (
              <button
                onClick={handleLogout}
                className="font-medium text-madRed hover:text-madEncart cursor-pointer"
              >
                Déconnexion
              </button>
            ) : (
              lastLink && (
                <a
                  href={lastLink.href}
                  className="rounded-md bg-madRed px-5 py-2.5 text-sm font-medium text-white shadow"
                >
                  {lastLink.label}
                </a>
              )
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
