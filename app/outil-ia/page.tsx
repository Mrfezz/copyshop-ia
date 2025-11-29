// app/outil-ia/page.tsx
"use client";

import React, { FormEvent, useState, ChangeEvent } from "react";

type GeneratedBoutique = {
  storeName: string;
  tagline: string;
  homepageSections: string[];
  productPageBlocks: string[];
  brandTone: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "0.75rem",
  border: "1px solid rgba(148,163,184,0.6)",
  backgroundColor: "#020617",
  color: "#f9fafb",
  padding: "0.55rem 0.7rem",
  fontSize: "0.85rem",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.82rem",
  color: "#cbd5f5",
  marginBottom: "0.3rem",
  display: "block",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#020617",
  borderRadius: "1.5rem",
  border: "1px solid rgba(148,163,184,0.7)",
  padding: "1.6rem 1.5rem",
};

export default function OutilIAPage() {
  const [productUrl, setProductUrl] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedBoutique | null>(null);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setImageBase64(null);
      setImageName(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string; // data:image/...;base64,...
      setImageBase64(base64);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();

    if (!imageBase64 && !productUrl) {
      alert("Ajoute au moins une image ou un lien produit.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/outil-ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productUrl,
          imageBase64,
        }),
      });

      if (!res.ok) {
        console.error("Erreur API /api/outil-ia :", await res.text());
        alert(
          "Erreur lors de la génération avec l'IA. Réessaie dans un instant."
        );
        return;
      }

      const data = (await res.json()) as GeneratedBoutique;
      setResult(data);
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Erreur réseau pendant l'appel à l'IA.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "3.5rem 1.5rem 3rem",
        background:
          "radial-gradient(circle at top left, #1d4ed8 0, #020617 55%, #020617 100%)",
        color: "#f9fafb",
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            marginBottom: "2.3rem",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#a5b4fc",
              marginBottom: "0.5rem",
            }}
          >
            Outil IA • Boutiques Shopify
          </p>
          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              marginBottom: "0.3rem",
            }}
          >
            Génère une boutique à partir d&apos;une seule image.
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#e5e7eb",
              maxWidth: "620px",
            }}
          >
            Ton client téléverse l&apos;image du produit (ou colle un lien
            AliExpress), l&apos;IA s&apos;occupe du reste : nom, slogan,
            sections, page produit.
          </p>
        </header>

        {/* GRID : EXPLICATION + FORMULAIRE */}
        <section
          style={{
            display: "grid",
            gap: "1.6rem",
            gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)",
            alignItems: "flex-start",
          }}
        >
          {/* COLONNE GAUCHE : EXPLICATION */}
          <div style={cardStyle}>
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                marginBottom: "0.7rem",
              }}
            >
              Pensé pour les débutants.
            </h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: "0.9rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <li style={{ display: "flex", gap: "0.45rem" }}>
                <span
                  style={{
                    marginTop: "0.4rem",
                    width: "7px",
                    height: "7px",
                    borderRadius: "999px",
                    backgroundColor: "#22c55e",
                    flexShrink: 0,
                  }}
                />
                <span>
                  1 seule action : le client envoie une image de son produit
                  (capture écran, photo, visuel fournisseur...).
                </span>
              </li>
              <li style={{ display: "flex", gap: "0.45rem" }}>
                <span
                  style={{
                    marginTop: "0.4rem",
                    width: "7px",
                    height: "7px",
                    borderRadius: "999px",
                    backgroundColor: "#22c55e",
                    flexShrink: 0,
                  }}
                />
                <span>
                  Optionnel : il peut coller un lien produit (AliExpress, 1688,
                  fournisseur privé).
                </span>
              </li>
              <li style={{ display: "flex", gap: "0.45rem" }}>
                <span
                  style={{
                    marginTop: "0.4rem",
                    width: "7px",
                    height: "7px",
                    borderRadius: "999px",
                    backgroundColor: "#22c55e",
                    flexShrink: 0,
                  }}
                />
                <span>
                  L&apos;IA analyse l&apos;image et propose une boutique clé en
                  main : structure, sections, arguments de vente.
                </span>
              </li>
            </ul>

            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.8rem",
                color: "#9ca3af",
              }}
            >
              ⚠️ Outil réservé aux clients de tes packs IA. Ne pas mettre ce
              lien public sur le site vitrine.
            </p>
          </div>

          {/* COLONNE DROITE : FORMULAIRE SUPER SIMPLE */}
          <form onSubmit={handleGenerate} style={cardStyle}>
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                marginBottom: "0.9rem",
              }}
            >
              Envoie ton produit à l&apos;IA
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div>
                <label style={labelStyle}>Image du produit</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    ...inputStyle,
                    padding: "0.4rem 0.7rem",
                    cursor: "pointer",
                  }}
                />
                {imageName && (
                  <p
                    style={{
                      marginTop: "0.35rem",
                      fontSize: "0.78rem",
                      color: "#9ca3af",
                    }}
                  >
                    Image sélectionnée : {imageName}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>
                  (Optionnel) Lien produit AliExpress / fournisseur
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "0.6rem",
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "999px",
                  border: "none",
                  background:
                    "linear-gradient(to right, #22c55e, #a3e635, #facc15)",
                  color: "#022c22",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: loading ? "wait" : "pointer",
                  opacity: loading ? 0.8 : 1,
                }}
              >
                {loading
                  ? "Génération de la boutique..."
                  : "Générer ma boutique"}
              </button>
            </div>
          </form>
        </section>

        {/* RÉSULTAT */}
        {result && (
          <section
            style={{
              marginTop: "2rem",
              ...cardStyle,
            }}
          >
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                marginBottom: "0.4rem",
              }}
            >
              Boutique générée à partir de ton produit
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#a5b4fc",
                marginBottom: "1rem",
              }}
            >
              À adapter ensuite directement dans Shopify (ou à me déléguer pour
              la mise en place).
            </p>

            <div
              style={{
                display: "grid",
                gap: "1.2rem",
                gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: "0.3rem",
                  }}
                >
                  Nom de la boutique
                </h3>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "0.6rem",
                  }}
                >
                  {result.storeName}
                </p>

                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    marginBottom: "0.3rem",
                  }}
                >
                  Slogan
                </h3>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#e5e7eb",
                    marginBottom: "0.8rem",
                  }}
                >
                  {result.tagline}
                </p>

                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    marginBottom: "0.3rem",
                  }}
                >
                  Ton de la marque
                </h3>
                <p
                  style={{
                    fontSize: "0.86rem",
                    color: "#cbd5f5",
                  }}
                >
                  {result.brandTone}
                </p>
              </div>

              <div>
                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    marginBottom: "0.4rem",
                  }}
                >
                  Sections de la page d&apos;accueil
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: "0.86rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem",
                    marginBottom: "0.9rem",
                  }}
                >
                  {result.homepageSections?.map((s) => (
                    <li key={s} style={{ display: "flex", gap: "0.4rem" }}>
                      <span
                        style={{
                          marginTop: "0.4rem",
                          width: "6px",
                          height: "6px",
                          borderRadius: "999px",
                          backgroundColor: "#38bdf8",
                          flexShrink: 0,
                        }}
                      />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>

                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    marginBottom: "0.4rem",
                  }}
                >
                  Blocs clés pour la page produit
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: "0.86rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem",
                  }}
                >
                  {result.productPageBlocks?.map((b) => (
                    <li key={b} style={{ display: "flex", gap: "0.4rem" }}>
                      <span
                        style={{
                          marginTop: "0.4rem",
                          width: "6px",
                          height: "6px",
                          borderRadius: "999px",
                          backgroundColor: "#f97316",
                          flexShrink: 0,
                        }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
