// app/qui-sommes-nous/page.tsx

export default function QuiSommesNousPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-10 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">
            À propos de Copyshop IA
          </p>
          <h1 className="text-3xl md:text-4xl font-black">
            Qui sommes-nous ?
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm md:text-base">
            Copyshop IA est un studio spécialisé dans la création de boutiques
            Shopify et d’outils IA pour aider les indépendants, infopreneurs
            et e-commerçants à lancer plus vite, avec moins de stress
            technique.
          </p>
        </section>

        {/* 3 blocs : mission / vision / approche */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 md:p-5">
            <h2 className="text-sm font-semibold text-indigo-200 mb-2">
              Notre mission
            </h2>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              Te faire gagner un temps fou sur la technique pour que tu te
              concentres enfin sur ce qui rapporte : ton offre, ton marketing
              et tes clients.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 md:p-5">
            <h2 className="text-sm font-semibold text-indigo-200 mb-2">
              Notre vision
            </h2>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              Rendre la création de boutique en ligne aussi simple que remplir
              un formulaire, grâce à l’IA et à des process ultra cadrés.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 md:p-5">
            <h2 className="text-sm font-semibold text-indigo-200 mb-2">
              Notre approche
            </h2>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              Du concret, pas de blabla : des boutiques propres,
              optimisées pour la conversion, un support humain et un suivi
              WhatsApp quand tu en as besoin.
            </p>
          </div>
        </section>

        {/* Bloc "qui est derrière" */}
        <section className="grid gap-6 md:grid-cols-[1.1fr,0.9fr] items-start">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-5 md:p-6 space-y-3">
            <h2 className="text-sm font-semibold text-indigo-200">
              Qui est derrière Copyshop IA ?
            </h2>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              Copyshop IA est porté par{" "}
              <span className="font-semibold">Mr Fez</span>, passionné par le
              e-commerce, le marketing digital et l&apos;automatisation.
              Après avoir accompagné plusieurs projets en ligne, l&apos;objectif
              est simple : te proposer un raccourci pour lancer ton business
              plus sereinement.
            </p>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              Chaque pack, chaque service et chaque formation a été pensé pour
              être actionnable, compréhensible et adapté à la réalité de
              terrain (petits budgets, contraintes de temps, besoin de résultat
              rapide).
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-5 md:p-6 space-y-3">
            <h3 className="text-sm font-semibold text-indigo-100">
              En bref
            </h3>
            <ul className="space-y-2 text-xs md:text-sm text-slate-100">
              <li>• Création et optimisation de boutiques Shopify</li>
              <li>• Packs IA pour générer des boutiques en quelques minutes</li>
              <li>• Services à la carte pour t&apos;aider là où tu bloques</li>
              <li>• Suivi et échanges via WhatsApp quand c&apos;est utile</li>
            </ul>
            <p className="text-xs md:text-sm text-slate-200 pt-1">
              Tu veux en savoir plus ou parler de ton projet ? Utilise le
              bouton WhatsApp du menu ou la page contact, on regarde ça
              ensemble.
            </p>
          </div>
        </section>

        {/* Valeurs */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-indigo-200">
            Nos 3 valeurs principales
          </h2>
          <div className="grid gap-4 md:grid-cols-3 text-xs md:text-sm text-slate-200">
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <p className="font-semibold mb-1">Transparence</p>
              <p>
                Pas de promesses magiques. Tu sais exactement ce que tu achètes
                et ce qu&apos;on met en place pour toi.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <p className="font-semibold mb-1">Simplicité</p>
              <p>
                Process guidé, peu de jargon, et un accompagnement étape par
                étape pour ne pas te perdre.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <p className="font-semibold mb-1">Résultats</p>
              <p>
                L&apos;objectif, c&apos;est que ta boutique soit en ligne,
                crédible et prête à encaisser, pas juste “jolie sur Figma”.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
