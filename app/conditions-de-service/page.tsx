import LegalLayout from "@/app/_components/LegalLayout";

export const metadata = { title: "Conditions de service | Copyshop IA" };

export default function Page() {
  return (
    <LegalLayout
      title="Conditions de service"
      subtitle="Règles d’utilisation de la plateforme et des services Copyshop IA."
      lastUpdated="24/01/2026"
    >
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions définissent les règles d’accès et d’utilisation des services proposés par Copyshop IA
        (packs IA, recharges, services digitaux, messagerie support, etc.).
      </p>

      <h2>2. Accès au service</h2>
      <ul>
        <li>Le service est accessible via le site copyshop-ia.com.</li>
        <li>Un compte peut être nécessaire pour accéder à certaines fonctionnalités (outil IA, historique, messagerie).</li>
      </ul>

      <h2>3. Compte & sécurité</h2>
      <ul>
        <li>Tu es responsable de la confidentialité de tes identifiants.</li>
        <li>En cas de suspicion d’accès non autorisé, contacte le support.</li>
      </ul>

      <h2>4. Packs, crédits & recharges</h2>
      <ul>
        <li>Selon le pack, tu disposes d’un nombre de créations (crédits) ou d’un accès illimité.</li>
        <li>Les recharges ajoutent des crédits selon les conditions affichées au moment de l’achat.</li>
      </ul>

      <h2>5. Usage autorisé</h2>
      <ul>
        <li>Tu t’engages à ne pas utiliser le service à des fins illégales, frauduleuses ou abusives.</li>
        <li>Interdiction de tenter de contourner les limitations techniques, d’attaquer ou de perturber la plateforme.</li>
      </ul>

      <h2>6. Disponibilité</h2>
      <p>
        Le service peut être interrompu ponctuellement (maintenance, mise à jour, incident). Copyshop IA met en œuvre des
        moyens raisonnables pour assurer la continuité, sans garantie d’absence d’interruption.
      </p>

      <h2>7. Responsabilité</h2>
      <p>
        Copyshop IA fournit un service digital d’accompagnement et d’automatisation. La performance commerciale finale
        d’une boutique dépend de nombreux facteurs externes (produit, prix, publicité, concurrence, etc.).
      </p>

      <h2>8. Support</h2>
      <p>
        Support : Lun–Sam 9h–18h — WhatsApp : +33 7 45 21 49 22 — Email : copyshopp.ia@gmail.com
      </p>

      <h2>9. Modifications</h2>
      <p>
        Ces conditions peuvent évoluer. La version en ligne fait foi. En cas de modification majeure, une information
        pourra être affichée sur le site.
      </p>

      <h2>10. Droit applicable</h2>
      <p>Ces conditions sont soumises au droit français.</p>
    </LegalLayout>
  );
}
