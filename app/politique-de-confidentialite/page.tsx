import LegalLayout from "@/app/_components/LegalLayout";

export const metadata = { title: "Politique de confidentialité | Copyshop IA" };

export default function Page() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      subtitle="Comment Copyshop IA collecte et utilise tes données."
      lastUpdated="24/01/2026"
    >
      <h2>1. Données collectées</h2>
      <ul>
        <li>Données de compte : email, identifiants techniques.</li>
        <li>Achats : produit, statut, montant, identifiants de transaction.</li>
        <li>Messagerie support : sujet, contenu des messages.</li>
      </ul>

      <h2>2. Finalités</h2>
      <ul>
        <li>Fournir le service (accès, activation, historique).</li>
        <li>Support client et échanges.</li>
        <li>Sécurité, prévention de fraude et amélioration du service.</li>
      </ul>

      <h2>3. Prestataires</h2>
      <p>
        Certaines données peuvent être traitées via des prestataires techniques (hébergement, email, paiement, base de
        données) uniquement pour fournir le service.
      </p>

      <h2>4. Durée de conservation</h2>
      <p>Les données sont conservées le temps nécessaire au fonctionnement du service et au respect des obligations légales.</p>

      <h2>5. Tes droits</h2>
      <p>
        Tu peux demander l’accès, la rectification ou la suppression de tes données en contactant :
        <strong> copyshopp.ia@gmail.com</strong>
      </p>
    </LegalLayout>
  );
}
