import LegalLayout from "@/app/_components/LegalLayout";

export const metadata = { title: "Conditions de vente | Copyshop IA" };

export default function Page() {
  return (
    <LegalLayout
      title="Conditions de vente"
      subtitle="Informations relatives aux achats (packs, recharges, services digitaux)."
      lastUpdated="24/01/2026"
    >
      <h2>1. Produits & services</h2>
      <p>
        Copyshop IA propose des produits et services digitaux : packs IA, recharges, et prestations associées (selon
        l’offre affichée).
      </p>

      <h2>2. Prix</h2>
      <ul>
        <li>Les prix sont indiqués en euros (EUR) et affichés sur le site.</li>
        <li>Copyshop IA peut modifier ses prix à tout moment ; le prix facturé est celui au moment de l’achat.</li>
      </ul>

      <h2>3. Paiement</h2>
      <p>Le paiement est réalisé via un prestataire sécurisé (ex : Stripe). La commande est confirmée après paiement validé.</p>

      <h2>4. Exécution / livraison</h2>
      <p>
        L’accès est généralement activé automatiquement (produit digital). Pour les services personnalisés, l’exécution
        suit les modalités convenues avec le support.
      </p>

      <h2>5. Facturation</h2>
      <p>Un email de confirmation peut être envoyé et un historique d’achat est disponible dans l’espace client.</p>

      <h2>6. Droit de rétractation (résumé)</h2>
      <p>
        Aucun droit de rétractation pour chacun des produits Copyshop IA! Pour certains contenus/services numériques, le droit de rétractation peut ne pas s’appliquer lorsque l’exécution
        a commencé avec ton accord (ex : accès digital immédiat).
      </p>

      <h2>7. Support</h2>
      <p>Contact : copyshopp.ia@gmail.com — WhatsApp : +33 7 45 21 49 22</p>
    </LegalLayout>
  );
}
