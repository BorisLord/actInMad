export default function UserSetting() {
  return (
    <div class="mx-auto max-w-md p-5 text-center md:p-10">
      <h2 class="mb-4 font-serif text-2xl font-semibold text-madRed md:text-3xl">
        🎭 À vos marques, prêt·e·s, créez !
      </h2>
      <p class="mb-8 text-lg text-gray-800 italic">
        Votre espace se prépare pour son grand entrée en scène. Revenez bientôt
        découvrir les nouvelles fonctionnalités qui feront de vous la star de
        votre apprentissage !
      </p>
      <div class="flex justify-center gap-3">
        <div class="h-4 w-4 animate-pulse rounded-full bg-madEncart"></div>
        <div class="h-4 w-4 animate-pulse rounded-full bg-madEncart [animation-delay:0.3s]"></div>
        <div class="h-4 w-4 animate-pulse rounded-full bg-madEncart [animation-delay:0.6s]"></div>
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
          class="cursor-pointer font-medium text-madRed hover:underline"
        >
          Envoyez-nous un mot via le formulaire de contact
        </a>
      </p>
    </div>
  );
}
