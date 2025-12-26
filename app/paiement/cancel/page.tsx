import Link from "next/link";

export default function CancelPage() {
  return (
    <main style={{ padding: 24, maxWidth: 860, margin: "0 auto", color: "#eef1ff" }}>
      <h1 style={{ fontSize: 32, fontWeight: 900 }}>Paiement annulé</h1>
      <p style={{ opacity: 0.9, marginTop: 10 }}>
        Aucun débit n’a été effectué. Tu peux réessayer quand tu veux.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <Link
          href="/panier"
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 999,
            fontWeight: 900,
            color: "white",
            textDecoration: "none",
            background: "linear-gradient(90deg, #6a2fd6, #e64aa7)",
          }}
        >
          Retour au panier
        </Link>

        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 999,
            fontWeight: 900,
            color: "white",
            textDecoration: "none",
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          Accueil
        </Link>
      </div>
    </main>
  );
}
