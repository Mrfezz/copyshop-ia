import LegalLayout from "@/app/_components/LegalLayout";

export const metadata = { title: "Politique d’expédition | Copyshop IA" };

export default function Page() {
  return (
    <LegalLayout
      title="Politique d’expédition"
      subtitle="Copyshop IA vend des produits et services digitaux (pas de livraison physique)."
      lastUpdated="24/01/2026"
    >
      <h2>1. Livraison des produits digitaux</h2>
      <p>
        Les packs IA, recharges et accès digitaux sont livrés de manière dématérialisée : activation sur ton compte,
        email de confirmation, et/ou accès aux fonctionnalités correspondantes.
      </p>

      <h2>2. Délais</h2>
      <ul>
        <li>En général : activation immédiate après validation du paiement.</li>
        <li>Dans certains cas : quelques minutes peuvent être nécessaires (traitement technique).</li>
      </ul>

      <h2>3. Services “sur-mesure”</h2>
      <p>
        Si tu commandes un service personnalisé (ex : boutique/site en cours), les délais sont indiqués au moment de la
        commande ou confirmés par message avec le support.
      </p>

      <h2>4. Aucun envoi postal</h2>
      <p>Copyshop IA ne vend pas de produits physiques : aucune livraison par transporteur n’est réalisée.</p>

      <h2>5. Problèmes d’accès</h2>
      <p>
        Si tu ne vois pas l’activation sur ton compte, contacte le support en précisant ton email et la date d’achat :
        copyshopp.ia@gmail.com
      </p>
    </LegalLayout>
  );
}
