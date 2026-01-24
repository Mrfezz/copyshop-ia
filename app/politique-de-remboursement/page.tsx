import LegalLayout from "@/app/_components/LegalLayout";

export const metadata = { title: "Politique de remboursement | Copyshop IA" };

export default function Page() {
  return (
    <LegalLayout
      title="Politique de remboursement"
      subtitle="Conditions et procédure de remboursement."
      lastUpdated="24/01/2026"
    >
      <h2>1. Principe</h2>
      <p>
        Les produits vendus par Copyshop IA étant principalement digitaux (accès/packs/recharges),
        un remboursement n’est généralement pas possible une fois l’accès activé ou le service commencé,
        sauf cas particulier.
      </p>

      <h2>2. Cas particuliers</h2>
      <ul>
        <li>Paiement débité à tort (double paiement) : remboursement possible après vérification.</li>
        <li>Problème technique bloquant non résolu : étude au cas par cas.</li>
      </ul>

      <h2>3. Comment demander</h2>
      <p>
        Envoie un message à <strong>copyshopp.ia@gmail.com</strong> avec : email utilisé, date, produit,
        et description du problème.
      </p>

      <h2>4. Délai</h2>
      <p>
        Si le remboursement est validé, il est traité via le moyen de paiement initial
        (délais variables selon banque).
      </p>
    </LegalLayout>
  );
}
