export default function UserDocument() {
  return (
    <div className="mx-auto max-w-md p-5 text-center md:p-10">
      <h1 className="text-madRed mb-2 font-serif text-xl font-semibold md:text-3xl">
        Vos documents bientôt accessibles en un clic
      </h1>
      <p className="mb-6 text-base text-gray-800 md:text-lg">
        Factures, mandats de prélèvement etc ...
      </p>

      <h2 className="text-madRed mb-6 font-serif text-lg font-semibold md:text-2xl">
        🎭 À vos marques, prêt·e·s, créez !
      </h2>

      <p className="mb-8 text-lg italic text-gray-800">
        Votre espace se prépare pour sa grande entrée en scène.
        <br />
        Revenez bientôt découvrir les nouvelles fonctionnalités qui feront de
        vous la star de votre apprentissage !
      </p>

      <div className="mb-6 flex justify-center gap-3">
        <div className="bg-madEncart h-4 w-4 animate-pulse rounded-full"></div>
        <div className="bg-madEncart h-4 w-4 animate-pulse rounded-full [animation-delay:0.3s]"></div>
        <div className="bg-madEncart h-4 w-4 animate-pulse rounded-full [animation-delay:0.6s]"></div>
      </div>

      <div className="mt-6 text-gray-700">
        <p className="mb-2">
          Une idée, un bug à signaler ou une fonctionnalité que vous rêvez
          d'avoir ?
        </p>
        <a
          href="/Contact"
          className="text-madRed cursor-pointer font-medium hover:underline"
        >
          Envoyez-nous un mot via le formulaire de contact
        </a>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        (En attendant, répétez vos répliques !)
      </p>
    </div>
  );
}
