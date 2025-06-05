import { navigate } from "astro:transitions/client";

interface Link {
  label: string;
  href: string;
}

interface NavbarProps {
  links: Link[];
}

const Navbar = ({ links }: NavbarProps) => {
  const goTo = (path: string) => {
    navigate(path);
  };

  return (
    <div class="mx-auto max-w-screen px-4 sm:px-6 lg:px-8">
      <div class="flex h-24 items-center justify-center">
        <nav className="p-4">
          <ul className="flex gap-5">
            {links.length > 0 && (
              <li>
                <button
                  className={`bg-madRed text-white hover:bg-madEncart cursor-pointer rounded-md px-4 py-1`}
                  onClick={() => goTo(links[links.length - 1].href)}
                >
                  {links[links.length - 1].label
                    .split("/")
                    .map((part, index) => (
                      <div key={index} className="leading-5 text-sm">
                        {part}
                      </div>
                    ))}
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
