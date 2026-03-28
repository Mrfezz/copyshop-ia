import LegalLayout from "@/app/_components/LegalLayout";

export const metadata = { title: "Mentions légales | Copyshop IA" };

export default function Page() {
  return (
    <LegalLayout title="Mentions légales" subtitle="Informations légales sur l’éditeur du site." lastUpdated="24/01/2026">
      <h2>Éditeur</h2>
      <ul>
        <li><strong>Nom commercial :</strong> Copyshop IA</li>
        <li><strong>Site :</strong> copyshop-ia.com</li>
        <li><strong>Email :</strong> copyshopp.ia@gmail.com</li>
        <li><strong>WhatsApp :</strong> +33 7 45 21 49 22</li>
      </ul>

      <h2>Informations légales (à compléter)</h2>
      <p>
        ⚠️ Remplace ces champs par tes infos officielles :
      </p>
      <ul>
        <li><strong>Raison sociale :</strong> [À compléter]</li>
        <li><strong>Statut juridique :</strong> [À compléter]</li>
        <li><strong>SIRET :</strong> [À compléter]</li>
        <li><strong>Adresse du siège :</strong> [À compléter]</li>
        <li><strong>Directeur de publication :</strong> [À compléter]</li>
      </ul>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par un prestataire d’hébergement. Les informations exactes de l’hébergeur
        peuvent être communiquées sur demande.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le contenu du site (textes, visuels, marque, éléments graphiques) est protégé. Toute reproduction non autorisée
        est interdite.
      </p>

      <h2>Contact</h2>
      <p>
        Support : Lun–Sam 9h–18h — Email : copyshopp.ia@gmail.com — WhatsApp : +33 7 45 21 49 22
      </p>
    </LegalLayout>
  );
}
