export default function SuccessPage() {
  return (
    <main style={{ padding: 24, maxWidth: 860, margin: "0 auto", color: "#eef1ff" }}>
      <h1 style={{ fontSize: 32, fontWeight: 900 }}>Paiement confirmé ✅</h1>
      <p style={{ opacity: 0.9, marginTop: 10 }}>
        Merci ! Ton paiement a bien été pris en compte.
      </p>
      <p style={{ opacity: 0.8, marginTop: 6 }}>
        Tu vas recevoir les infos par message / email selon le service.
      </p>
    </main>
  );
}
