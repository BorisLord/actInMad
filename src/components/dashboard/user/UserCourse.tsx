export default function UserCourse() {
  return (
    <div class="mx-auto max-w-md p-5 text-center md:p-10">
      <h2 class="text-madRed mb-4 font-serif text-2xl font-semibold md:text-3xl">
        🎭 À vos marques, prêt·e·s, créez !
      </h2>
      <p class="mb-8 text-lg italic text-gray-800">
        Votre espace se prépare pour son grand entrée en scène. Revenez bientôt
        découvrir les nouvelles fonctionnalités qui feront de vous la star de
        votre apprentissage !
      </p>
      <div class="flex justify-center gap-3">
        <div class="bg-madEncart h-4 w-4 animate-pulse rounded-full"></div>
        <div class="bg-madEncart h-4 w-4 animate-pulse rounded-full [animation-delay:0.3s]"></div>
        <div class="bg-madEncart h-4 w-4 animate-pulse rounded-full [animation-delay:0.6s]"></div>
      </div>
      <p class="mt-6 text-sm text-gray-500">
        (En attendant, répétez vos répliques !)
      </p>
      <p class="mt-4 text-gray-700">
        Une idée, un bug à signaler ou une fonctionnalité que vous rêvez d’avoir
        ?
        <br />
        <a
          href="/Contact"
          class="text-madRed cursor-pointer font-medium hover:underline"
        >
          Envoyez-nous un mot via le formulaire de contact
        </a>
      </p>
    </div>
  );
}
