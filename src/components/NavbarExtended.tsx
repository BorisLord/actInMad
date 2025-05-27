import { navigate } from "astro:transitions/client";

import beigeFullLogo from "../assets/logo/actInMadBeigeFullLogo.svg";
import actInMadRed from "../assets/logo/actInMadRedFullLogo.svg";

interface Link {
  label: string;
  href: string;
}

interface NavbarProps {
  links: Link[];
  isHomePage: boolean;
  currentPath: string;
}

const Navbar = ({ links, isHomePage, currentPath }: NavbarProps) => {
  console.log(isHomePage);
  console.log(currentPath);

  const goTo = (path: string) => {
    navigate(path);
  };

  return (
    <div class="mx-auto max-w-screen px-4 sm:px-6 lg:px-8">
      <div class="flex h-24 items-center justify-center">
        {/* <img
          src={isHomePage ? beigeFullLogo.src : actInMadRed.src}
          alt="L'arche d'Act In Mad"
          class="h-16 w-auto sm:mr-8"
        /> */}

        <nav className="p-4 hidden md:block">
          <ul className="flex gap-5">
            {/* {links.slice(0, -1).map((link) => (
              <li key={link.href} className='mt-4'>
                <a
                  className={`${
                    isHomePage
                      ? "text-madBack"
                      : currentPage === link.href
                        ? "text-madRed"
                        : "text-black"
                  } hover:text-madRed cursor-pointer`}
                  onClick={() => goTo(link.href)}
                >
                  {link.label}
                </a>
              </li>
            ))} */}
            {links.length > 0 && (
              <li>
                <button
                  className={`${
                    isHomePage
                      ? "bg-madBack"
                      : currentPath === links[links.length - 1].href
                        ? "bg-madRed text-white"
                        : "bg-madRed text-white"
                  } hover:bg-madEncart hover:text-white cursor-pointer rounded-md px-4 py-2`}
                  onClick={() => goTo(links[links.length - 1].href)}
                >
                  {links[links.length - 1].label
                    .split("/")
                    .map((part, index) => (
                      <div key={index} className="leading-5">
                        {part}
                      </div>
                    ))}{" "}
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
