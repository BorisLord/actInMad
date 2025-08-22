export default function UserCourse() {
  return (
    <div class="text-center p-5 md:p-10 max-w-md mx-auto">
      <h2 class="text-2xl md:text-3xl font-serif font-semibold text-madRed mb-4">
        🎭 À vos marques, prêt·e·s, créez !
      </h2>
      <p class="text-lg text-gray-800 mb-8 italic">
        Votre espace se prépare pour son grand entrée en scène. Revenez bientôt
        découvrir les nouvelles fonctionnalités qui feront de vous la star de
        votre apprentissage !
      </p>
      <div class="flex justify-center gap-3">
        <div class="w-4 h-4 bg-madEncart rounded-full animate-pulse"></div>
        <div class="w-4 h-4 bg-madEncart rounded-full animate-pulse [animation-delay:0.3s]"></div>
        <div class="w-4 h-4 bg-madEncart rounded-full animate-pulse [animation-delay:0.6s]"></div>
      </div>
      <p class="mt-6 text-sm text-gray-500">
        (En attendant, répétez vos répliques !)
      </p>
    </div>
  );
}
