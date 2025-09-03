import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/preact";
import { navigate } from "astro:transitions/client";
import type { FunctionalComponent } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

import { pb } from "../lib/pocketbase";
import { $user, clearUser } from "../lib/stores/userStore";
import type { NavbarProps } from "../type";

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
      className={`mx-auto w-full max-w-screen-xl px-4 transition-all duration-300 sm:px-6 lg:px-8 ${isScrolled ? "rounded-b-xl shadow-lg backdrop-blur-md" : ""}`}
    >
      <div className="flex h-24 items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          {onDashboardToggle && (
            <button
              ref={dashboardToggleRef}
              onClick={onDashboardToggle}
              className="cursor-pointer rounded-md p-2 text-black transition hover:bg-black/10"
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
        <div className="hidden items-center gap-4 md:flex">
          <nav aria-label="Global">
            <ul className="flex items-center gap-6 text-sm">
              {mainLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`${desktopLinkClass(link.href)} hover:text-madRed/75 whitespace-nowrap transition`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <a
                href="/Planning"
                class="bg-madRed hover:bg-madEncart mx-auto flex w-full max-w-xs items-center justify-center rounded px-3 py-1 text-center text-white"
              >
                Planning 2025/2026
              </a>
            </ul>
          </nav>
          <div className="flex items-center">
            {user && user.id ? (
              <div className="relative">
                <button
                  ref={profileToggleRef}
                  onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                  className="group flex cursor-pointer flex-col items-center gap-1"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="group-hover:border-madRed h-8 w-8 rounded-full border-2 border-transparent object-cover transition"
                    />
                  ) : (
                    <div className="bg-madRed group-hover:border-madEncart flex h-8 w-8 items-center justify-center rounded-full border-2 border-transparent text-base font-bold text-white transition">
                      {user.firstName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span
                    className={`group-hover:text-madRed text-xs font-medium transition ${isHomePage ? "text-madBack" : "text-black"}`}
                  >
                    {user.firstName}
                  </span>
                </button>
                {isProfileMenuOpen && (
                  <div
                    ref={profileMenuRef}
                    className={`absolute right-0 top-full z-50 mt-2 w-48 rounded-xl p-2 shadow-2xl ${isHomePage ? "bg-black" : "bg-madBack"}`}
                  >
                    <ul className="flex flex-col gap-1">
                      <li>
                        <a
                          href="/private/Dashboard"
                          className={`block rounded-md px-3 py-2 transition ${mobileLinkClass("")} hover:text-madEncart w-full text-left hover:bg-white/10`}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          Mon Espace
                        </a>
                      </li>
                      <li className="my-1 border-t border-gray-500/50"></li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="text-madRed hover:text-madEncart block w-full cursor-pointer rounded-md px-3 py-2 text-left font-medium transition hover:bg-white/10"
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
                  className="bg-madRed hover:bg-madEncart cursor-pointer rounded-md px-4 py-1 text-white shadow transition"
                  onClick={() => navigate(lastLink.href)}
                >
                  {lastLink.label.split("/").map((part, index) => (
                    <div key={index} className="text-sm leading-5">
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
                <div className="bg-madRed flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
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
              className={`whitespace-nowrap font-medium ${isHomePage ? "text-madBack" : "text-madRed"}`}
            >
              {currentPageLabel}
            </span>
          )}
          <button
            ref={mobileToggleRef}
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Ouvrir/fermer le menu"
            aria-expanded={isMobileMenuOpen}
            className={`rounded p-2 ${isHomePage ? "text-madBack" : "text-black"} cursor-pointer transition`}
          >
            <Icon icon="lucide:book-open-text" width="28" />
          </button>
        </div>
      </div>
      <nav
        ref={mobileMenuRef}
        className={`absolute right-4 top-24 z-50 rounded-xl p-4 shadow-2xl ${isHomePage ? "bg-black" : "bg-madBack"} ${isMobileMenuOpen ? "block" : "hidden"}`}
      >
        <ul className="flex w-40 flex-col items-center gap-4">
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
          <li className="w-full border-t border-gray-600 pt-3 text-center">
            {user && user.id ? (
              <button
                onClick={handleLogout}
                className="text-madRed hover:text-madEncart cursor-pointer font-medium"
              >
                Déconnexion
              </button>
            ) : (
              lastLink && (
                <a
                  href={lastLink.href}
                  className="bg-madRed rounded-md px-2 py-2 text-sm font-medium text-white shadow"
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
