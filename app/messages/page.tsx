'use client';

// app/messages/page.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const COLORS = {
  bgTop: "#0b1026",
  bgMid: "#0f1635",
  bgBottom: "#171a52",
  text: "#eef1ff",
  muted: "#c9d2ff",
  cardBg: "rgba(14,18,48,0.92)",
  border: "rgba(255,255,255,0.12)",
  violet: "#6a2fd6",
  violetDeep: "#4338ca",
  pink: "#e64aa7",
};

// ✅ 3 messages par page
const PAGE_SIZE = 3;
// ✅ 4 boutiques par page
const SHOPS_PAGE_SIZE = 4;

type Msg = {
  id: string;
  direction: "outbound" | "received" | "inbound";
  subject: string | null;
  body: string;
  created_at: string;
};

type Purchase = {
  id: string;
  product_key: string | null;
  status: string | null;
  amount_total: number | null;
  currency: string | null;
  created_at: string | null;
};

type Shop = {
  id: string;
  email: string;
  product_url: string;
  pack: string;
  store_name: string | null;
  payload: any;
  created_at: string;
};

type TabKey = "inbox" | "sent" | "received" | "orders" | "shops";

function isOutbound(m: Msg) {
  return m.direction === "outbound";
}

function isInbound(m: Msg) {
  return m.direction !== "outbound";
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatMoney(
  amountCents: number | null,
  currency: string | null,
  productKey?: string | null
): string {
  if (amountCents == null || !currency) {
    if (productKey === "ia-ultime") return "149,99 €";
    return "—";
  }
  const eur = amountCents / 100;
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(eur);
  } catch {
    return `${eur.toFixed(2)} ${currency}`;
  }
}

function downloadJson(filename: string, obj: any) {
  const text = JSON.stringify(obj, null, 2);
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

async function readJsonSafe(res: Response): Promise<any> {
  try {
    const text = await res.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export default function MessagesPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  const [tab, setTab] = useState<TabKey>("inbox");

  const [messages, setMessages] = useState<Msg[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendOk, setSendOk] = useState<string | null>(null);

  const [page, setPage] = useState(0);

  const [orders, setOrders] = useState<Purchase[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [shopsError, setShopsError] = useState<string | null>(null);
  const [shopsOk, setShopsOk] = useState<string | null>(null);
  const [downloadingZipId, setDownloadingZipId] = useState<string | null>(null);
  const [shopsPage, setShopsPage] = useState(0);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!ignore) {
          setSession(data.session ?? null);
          setChecking(false);
        }
      } catch {
        if (!ignore) setChecking(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userEmail = session?.user?.email ?? "";
  const isMsgTab = tab === "inbox" || tab === "sent" || tab === "received";

  const sentCount = useMemo(() => messages.filter((m) => isOutbound(m)).length, [messages]);
  const receivedCount = useMemo(() => messages.filter((m) => isInbound(m)).length, [messages]);

  const filteredMessages = useMemo(() => {
    if (tab === "sent") return messages.filter((m) => isOutbound(m));
    if (tab === "received") return messages.filter((m) => isInbound(m));
    return messages;
  }, [messages, tab]);

  const pageCount = useMemo(() => {
    const total = filteredMessages.length;
    return Math.max(1, Math.ceil(total / PAGE_SIZE));
  }, [filteredMessages.length]);

  const pagedMessages = useMemo(() => {
    const safePage = Math.min(page, pageCount - 1);
    const start = safePage * PAGE_SIZE;
    return filteredMessages.slice(start, start + PAGE_SIZE);
  }, [filteredMessages, page, pageCount]);

  const shopsPageCount = useMemo(() => {
    return Math.max(1, Math.ceil(shops.length / SHOPS_PAGE_SIZE));
  }, [shops.length]);

  const pagedShops = useMemo(() => {
    const safePage = Math.min(shopsPage, shopsPageCount - 1);
    const start = safePage * SHOPS_PAGE_SIZE;
    return shops.slice(start, start + SHOPS_PAGE_SIZE);
  }, [shops, shopsPage, shopsPageCount]);

  useEffect(() => {
    setPage(0);
    setShopsPage(0);
  }, [tab]);

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  useEffect(() => {
    setShopsPage((p) => Math.min(p, Math.max(0, shopsPageCount - 1)));
  }, [shopsPageCount]);

  async function fetchMessages() {
    if (!session?.access_token) return;

    setMsgLoading(true);
    setMsgError(null);

    try {
      const res = await fetch("/api/me/messages", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await readJsonSafe(res);
      if (!res.ok) {
        throw new Error(json?.error ?? `Erreur API messages (HTTP ${res.status})`);
      }
      setMessages(json.messages ?? []);
    } catch (e: any) {
      setMsgError(e?.message ?? "Erreur chargement messages");
    } finally {
      setMsgLoading(false);
    }
  }

  async function fetchOrders() {
    if (!session?.access_token) return;

    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const res = await fetch("/api/me/purchases", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await readJsonSafe(res);
      if (!res.ok) {
        throw new Error(json?.error ?? `Erreur API achats (HTTP ${res.status})`);
      }
      setOrders(json.purchases ?? json.orders ?? []);
    } catch (e: any) {
      setOrdersError(e?.message ?? "Erreur chargement commandes");
    } finally {
      setOrdersLoading(false);
    }
  }

  async function fetchShops() {
    if (!session?.access_token) return;

    setShopsLoading(true);
    setShopsError(null);
    setShopsOk(null);

    try {
      const res = await fetch("/api/me/shops", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await readJsonSafe(res);
      if (!res.ok) {
        throw new Error(json?.error ?? `Erreur API shops (HTTP ${res.status})`);
      }
      setShops(json.shops ?? []);
    } catch (e: any) {
      setShopsError(e?.message ?? "Erreur chargement boutiques");
    } finally {
      setShopsLoading(false);
    }
  }

  useEffect(() => {
    if (!checking && session) fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking, session]);

  useEffect(() => {
    if (!session) return;
    if (tab === "orders") fetchOrders();
    if (tab === "shops") fetchShops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, session]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.access_token) return;

    setSending(true);
    setSendOk(null);
    setMsgError(null);

    try {
      const res = await fetch("/api/me/messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, body }),
      });

      const json = await readJsonSafe(res);
      if (!res.ok) {
        const detailed =
          json?.resendError?.message ||
          json?.openai_message ||
          json?.error ||
          `Erreur envoi (HTTP ${res.status})`;
        throw new Error(detailed);
      }

      if (json?.message) setMessages((prev) => [json.message as Msg, ...prev]);

      setSubject("");
      setBody("");
      setSendOk("✅ Message envoyé au support.");
      setTab("sent");
    } catch (e: any) {
      setMsgError(e?.message ?? "Erreur envoi");
    } finally {
      setSending(false);
    }
  }

  async function downloadThemeZip(shop: Shop) {
    if (!session?.access_token) {
      setShopsError("Session invalide. Reconnecte-toi puis réessaie.");
      return;
    }

    setDownloadingZipId(shop.id);
    setShopsError(null);
    setShopsOk(null);

    try {
      const res = await fetch("/api/theme-export", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          savedShopId: shop.id,
        }),
      });

      if (!res.ok) {
        let message = "Erreur export ZIP";
        try {
          const json = await res.json();
          message = json?.error ?? message;
        } catch {
          const text = await res.text();
          if (text) message = text;
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const baseName =
        safeFileName(shop.store_name || shop.payload?.themeAi?.brand?.storeName || "theme-copyshop") ||
        "theme-copyshop";
      const filename = `${baseName}-${shop.id}.zip`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setShopsOk("✅ Thème ZIP téléchargé.");
      setTimeout(() => setShopsOk(null), 2500);
    } catch (e: any) {
      setShopsError(e?.message ?? "Erreur téléchargement ZIP");
    } finally {
      setDownloadingZipId(null);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/compte-client";
  }

  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section className="m-container" style={styles.container}>
        <header style={styles.header}>
          <div style={styles.topRow}>
            <div>
              <p style={styles.kicker}>Compte client</p>
              <h1 style={styles.title}>Messagerie</h1>
              <p style={styles.sub}>
                Écris au support depuis <strong>{userEmail || "ton compte"}</strong>.
              </p>
            </div>

            {session && (
              <button onClick={signOut} style={styles.logoutBtn}>
                Se déconnecter
              </button>
            )}
          </div>
        </header>

        {checking && <div style={styles.loadingBox}>Chargement...</div>}

        {!checking && !session && (
          <div style={styles.loadingBox}>
            Tu dois être connecté pour accéder à la messagerie.
            <div style={{ marginTop: 10 }}>
              <a href="/compte-client" style={styles.linkBtn}>
                Aller à la connexion
              </a>
            </div>
          </div>
        )}

        {!checking && session && (
          <div className="m-layout" style={styles.layout}>
            <aside className="m-sidebar" style={styles.sidebar}>
              <button
                onClick={() => setTab("inbox")}
                style={{ ...styles.sideBtn, ...(tab === "inbox" ? styles.sideBtnActive : {}) }}
              >
                Tous les messages
                <span style={styles.badge}>{messages.length}</span>
              </button>

              <button
                onClick={() => setTab("sent")}
                style={{ ...styles.sideBtn, ...(tab === "sent" ? styles.sideBtnActive : {}) }}
              >
                Envoyés
                <span style={styles.badge}>{sentCount}</span>
              </button>

              <button
                onClick={() => setTab("received")}
                style={{ ...styles.sideBtn, ...(tab === "received" ? styles.sideBtnActive : {}) }}
              >
                Reçus
                <span style={styles.badge}>{receivedCount}</span>
              </button>

              <div style={styles.sep} />

              <button
                onClick={() => setTab("orders")}
                style={{ ...styles.sideBtn, ...(tab === "orders" ? styles.sideBtnActive : {}) }}
              >
                Commandes (en cours)
              </button>

              <button
                onClick={() => setTab("shops")}
                style={{ ...styles.sideBtn, ...(tab === "shops" ? styles.sideBtnActive : {}) }}
              >
                Mes boutiques
                <span style={styles.badge}>{shops.length}</span>
              </button>

              <div style={styles.sep} />
              <a href="/compte-client" style={styles.sideLink}>
                ← Retour espace client
              </a>
            </aside>

            {isMsgTab && (
              <form className="m-topRight" onSubmit={sendMessage} style={styles.composer}>
                <div style={styles.composerTitle}>Nouveau message</div>

                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Sujet (optionnel)"
                  style={styles.input}
                  maxLength={120}
                />

                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Écris ton message ici..."
                  style={styles.textarea}
                  rows={6}
                />

                {sendOk && <div style={styles.okBox}>{sendOk}</div>}
                {msgError && <div style={styles.errBox}>{msgError}</div>}

                <div style={styles.actions}>
                  <button disabled={sending} type="submit" style={styles.primaryBtn}>
                    {sending ? "Envoi..." : "Envoyer au support"}
                  </button>

                  <button
                    type="button"
                    onClick={() => fetchMessages()}
                    style={styles.secondaryBtn}
                    disabled={msgLoading}
                  >
                    {msgLoading ? "Actualisation..." : "Actualiser"}
                  </button>
                </div>
              </form>
            )}

            {tab === "orders" && (
              <div className="m-topRight" style={styles.panel}>
                <div style={styles.panelTitle}>Commandes / achats</div>

                {ordersError && <div style={styles.errBox}>{ordersError}</div>}
                {ordersLoading && <div style={styles.loadingInline}>Chargement des commandes…</div>}

                {!ordersLoading && orders.length === 0 && (
                  <div style={styles.empty}>Aucune commande trouvée pour le moment.</div>
                )}

                {!ordersLoading && orders.length > 0 && (
                  <div style={styles.table}>
                    <div style={styles.tableHead}>
                      <span>Produit</span>
                      <span>Statut</span>
                      <span>Montant</span>
                      <span>Date</span>
                    </div>

                    {orders.map((o) => (
                      <div key={o.id} style={styles.tableRow}>
                        <span style={styles.mono}>{o.product_key ?? "—"}</span>
                        <span>{o.status ?? "—"}</span>
                        <span>{formatMoney(o.amount_total, o.currency, o.product_key)}</span>
                        <span>{formatDate(o.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "shops" && (
              <div className="m-topRight" style={styles.panel}>
                <div style={styles.panelTitle}>Mes boutiques</div>
                <div style={styles.small}>
                  Ici tu retrouves toutes les boutiques générées. Tu peux télécharger directement le thème ZIP prêt à importer dans Shopify.
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => fetchShops()}
                    style={styles.secondaryBtn}
                    disabled={shopsLoading}
                  >
                    {shopsLoading ? "Chargement..." : "Actualiser"}
                  </button>
                </div>

                {shopsOk && <div style={{ ...styles.okBox, marginTop: 10 }}>{shopsOk}</div>}
                {shopsError && <div style={{ ...styles.errBox, marginTop: 10 }}>{shopsError}</div>}
                {shopsLoading && <div style={styles.loadingInline}>Chargement des boutiques…</div>}

                {!shopsLoading && shops.length === 0 && (
                  <div style={styles.empty}>Aucune boutique enregistrée pour le moment.</div>
                )}

                {!shopsLoading && shops.length > 0 && (
                  <>
                    <div style={styles.shopsList}>
                      {pagedShops.map((s) => {
                        const storeName =
                          s.store_name ||
                          s.payload?.storeName ||
                          s.payload?.themeAi?.brand?.storeName ||
                          "Boutique sans nom";
                        const pack = s.pack || s.payload?.meta?.pack || "—";
                        const createdAt = s.created_at;
                        const productUrl = s.product_url;
                        const shopifyAdminUrl = s.payload?.meta?.shopify?.product?.adminUrl || null;
                        const isDownloading = downloadingZipId === s.id;

                        return (
                          <div key={s.id} style={styles.shopCard}>
                            <div style={styles.shopTop}>
                              <div style={{ minWidth: 0 }}>
                                <div style={styles.shopName}>{storeName}</div>
                                <div style={styles.shopMetaLine}>
                                  <span style={styles.shopPill}>{pack}</span>
                                  <span style={styles.shopMeta}>{formatDate(createdAt)}</span>
                                </div>
                                {productUrl && (
                                  <a
                                    href={productUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={styles.shopLink}
                                    title={productUrl}
                                  >
                                    Voir le lien produit
                                  </a>
                                )}
                              </div>
                            </div>

                            <div style={styles.shopActions}>
                              <button
                                type="button"
                                style={styles.primaryBtn}
                                onClick={() => downloadThemeZip(s)}
                                disabled={isDownloading}
                              >
                                {isDownloading ? "Téléchargement..." : "Télécharger le thème ZIP"}
                              </button>

                              <button
                                type="button"
                                style={styles.secondaryBtn}
                                onClick={() => {
                                  const filename = `${safeFileName(storeName) || "boutique"}_${s.id}.json`;
                                  downloadJson(filename, s.payload ?? {});
                                  setShopsOk("✅ Fichier JSON téléchargé.");
                                  setTimeout(() => setShopsOk(null), 2500);
                                }}
                              >
                                Télécharger JSON
                              </button>

                              {shopifyAdminUrl && (
                                <a
                                  href={shopifyAdminUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={styles.shopifyBtn}
                                >
                                  Voir sur Shopify
                                </a>
                              )}
                            </div>

                            <div style={styles.shopIdLine}>
                              ID: <span style={styles.mono}>{s.id}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {shops.length > SHOPS_PAGE_SIZE && (
                      <div style={styles.pager}>
                        <button
                          type="button"
                          onClick={() => setShopsPage((p) => Math.max(0, p - 1))}
                          disabled={shopsPage <= 0}
                          style={{
                            ...styles.pagerBtn,
                            ...(shopsPage <= 0 ? styles.pagerBtnDisabled : {}),
                          }}
                        >
                          ← Page précédente
                        </button>

                        <div style={styles.pagerInfo}>
                          Page <strong>{Math.min(shopsPage + 1, shopsPageCount)}</strong> / {shopsPageCount}
                        </div>

                        <button
                          type="button"
                          onClick={() => setShopsPage((p) => Math.min(shopsPageCount - 1, p + 1))}
                          disabled={shopsPage >= shopsPageCount - 1}
                          style={{
                            ...styles.pagerBtn,
                            ...(shopsPage >= shopsPageCount - 1 ? styles.pagerBtnDisabled : {}),
                          }}
                        >
                          Page suivante →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {isMsgTab && (
              <div className="m-history" style={styles.listWrap}>
                <div className="msg-list-head" style={styles.listHeader}>
                  <span>Type</span>
                  <span>Sujet / Message</span>
                  <span className="msg-date">Date</span>
                </div>

                {msgLoading && <div style={styles.loadingInline}>Chargement des messages…</div>}

                {!msgLoading && filteredMessages.length === 0 && (
                  <div style={styles.empty}>
                    Aucun message {tab === "sent" ? "envoyé" : tab === "received" ? "reçu" : ""} pour le moment.
                  </div>
                )}

                {!msgLoading &&
                  pagedMessages.map((m) => (
                    <div key={m.id} className="msg-row" style={styles.row}>
                      <div>
                        <span
                          style={{
                            ...styles.pill,
                            ...(isOutbound(m) ? styles.pillOut : styles.pillIn),
                          }}
                        >
                          {isOutbound(m) ? "Envoyé" : "Reçu"}
                        </span>
                      </div>

                      <div style={styles.cell2}>
                        <div style={styles.subjectLine}>
                          {m.subject ? m.subject : <span style={{ color: COLORS.muted }}>Sans sujet</span>}
                        </div>
                        <div style={styles.snippet}>
                          {m.body.length > 140 ? m.body.slice(0, 140) + "…" : m.body}
                        </div>

                        <div className="msg-date-inline" style={styles.dateInline}>
                          {formatDate(m.created_at)}
                        </div>
                      </div>

                      <div className="msg-date" style={styles.cell3}>
                        {formatDate(m.created_at)}
                      </div>
                    </div>
                  ))}

                {!msgLoading && filteredMessages.length > PAGE_SIZE && (
                  <div style={styles.pager}>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page <= 0}
                      style={{ ...styles.pagerBtn, ...(page <= 0 ? styles.pagerBtnDisabled : {}) }}
                    >
                      ← Page précédente
                    </button>

                    <div style={styles.pagerInfo}>
                      Page <strong>{Math.min(page + 1, pageCount)}</strong> / {pageCount}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                      disabled={page >= pageCount - 1}
                      style={{
                        ...styles.pagerBtn,
                        ...(page >= pageCount - 1 ? styles.pagerBtnDisabled : {}),
                      }}
                    >
                      Page suivante →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <style>{`
        @media (max-width: 980px) {
          .m-container{
            padding-left: 6px !important;
            padding-right: 6px !important;
          }

          .m-layout{
            grid-template-columns: 1fr !important;
            grid-template-rows: auto auto auto !important;
            width: 100% !important;
          }

          .m-sidebar{
            position: relative !important;
            top: auto !important;
            grid-column: 1 / -1 !important;
            grid-row: 1 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            justify-self: center !important;
          }

          .m-topRight{
            grid-column: 1 / -1 !important;
            grid-row: 2 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            justify-self: center !important;
          }

          .m-history{
            grid-column: 1 / -1 !important;
            grid-row: 3 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            justify-self: center !important;
          }

          .msg-date{ display:none !important; }
          .msg-date-inline{ display:block !important; }

          .msg-list-head{
            grid-template-columns: 120px 1fr !important;
          }

          .msg-row{
            grid-template-columns: 120px 1fr !important;
          }
        }

        .msg-date-inline{ display:none; }
      `}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    padding: "2.2rem 1.25rem 3rem",
    color: COLORS.text,
    overflow: "hidden",
  },
  bgGradient: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(1200px circle at 10% -10%, #3a6bff33, transparent 50%)," +
      "radial-gradient(900px circle at 90% 10%, #8b5cf633, transparent 45%)," +
      `linear-gradient(180deg, ${COLORS.bgTop} 0%, ${COLORS.bgMid} 45%, ${COLORS.bgBottom} 100%)`,
    zIndex: -2,
  },
  bgDots: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at 8% 12%, #6aa2ff66 0 2px, transparent 3px)," +
      "radial-gradient(circle at 12% 18%, #6aa2ff44 0 1.5px, transparent 3px)," +
      "radial-gradient(circle at 16% 8%, #6aa2ff55 0 2px, transparent 4px)",
    backgroundRepeat: "repeat",
    backgroundSize: "32px 32px",
    opacity: 0.7,
    zIndex: -1,
    pointerEvents: "none",
  },
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 10px 28px",
    position: "relative",
    zIndex: 1,
  },
  header: { marginBottom: 18 },
  topRow: {
    display: "flex",
    gap: 14,
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  kicker: {
    fontSize: "0.8rem",
    color: COLORS.muted,
    fontWeight: 800,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    margin: 0,
  },
  title: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: 900,
    margin: "8px 0 8px",
    letterSpacing: "-0.02em",
  },
  sub: { fontSize: "1rem", color: COLORS.muted, margin: 0, lineHeight: 1.5 },
  logoutBtn: {
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.06)",
    color: COLORS.text,
    cursor: "pointer",
  },
  loadingBox: {
    textAlign: "center",
    color: COLORS.muted,
    padding: "22px",
    background: "rgba(255,255,255,0.04)",
    border: `1px dashed ${COLORS.border}`,
    borderRadius: 12,
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gridTemplateRows: "auto auto",
    gap: 16,
    alignItems: "start",
  },

  sidebar: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    position: "sticky",
    top: 14,
    height: "fit-content",
    gridColumn: "1",
    gridRow: "1 / span 2",
  },
  sideBtn: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.04)",
    color: COLORS.text,
    fontWeight: 900,
    cursor: "pointer",
    marginBottom: 8,
  },
  sideBtnActive: {
    border: "none",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    boxShadow: "0 10px 30px rgba(106,47,214,0.25)",
  },
  badge: {
    background: "rgba(0,0,0,0.25)",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 999,
    padding: "2px 8px",
    fontSize: "0.85rem",
    fontWeight: 900,
  },
  sep: {
    height: 1,
    background: "rgba(255,255,255,0.08)",
    margin: "10px 0",
  },
  sideLink: {
    display: "block",
    color: "rgba(201,210,255,0.95)",
    fontWeight: 900,
    textDecoration: "underline",
    padding: "6px 6px",
  },

  composer: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    display: "grid",
    gap: 10,
    gridColumn: "2",
    gridRow: "1",
  },
  composerTitle: { fontWeight: 900, fontSize: "1.1rem" },
  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(9,12,33,0.9)",
    color: COLORS.text,
    outline: "none",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(9,12,33,0.9)",
    color: COLORS.text,
    outline: "none",
    fontSize: "1rem",
    boxSizing: "border-box",
    resize: "vertical",
  },
  actions: { display: "flex", gap: 10, flexWrap: "wrap" },
  primaryBtn: {
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
    color: "#fff",
    border: "none",
    cursor: "pointer",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    boxShadow: "0 8px 20px rgba(106,47,214,0.35)",
  },
  secondaryBtn: {
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    cursor: "pointer",
    background: "rgba(255,255,255,0.06)",
  },
  okBox: {
    background: "rgba(64, 255, 141, 0.1)",
    border: "1px solid rgba(64, 255, 141, 0.35)",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 800,
    color: "#b7ffd9",
    fontSize: "0.95rem",
  },
  errBox: {
    background: "rgba(255, 77, 77, 0.12)",
    border: "1px solid rgba(255, 77, 77, 0.35)",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 800,
    color: "#ffb3b3",
    fontSize: "0.95rem",
  },

  listWrap: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    gridColumn: "2",
    gridRow: "2",
  },
  listHeader: {
    display: "grid",
    gridTemplateColumns: "120px 1fr 180px",
    gap: 10,
    padding: "10px 12px",
    background: "rgba(255,255,255,0.04)",
    borderBottom: `1px solid ${COLORS.border}`,
    fontWeight: 900,
    color: COLORS.muted,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "120px 1fr 180px",
    gap: 10,
    padding: "12px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  cell2: { minWidth: 0 },
  cell3: { textAlign: "right", color: COLORS.muted, fontWeight: 800 },
  dateInline: {
    marginTop: 8,
    color: "rgba(201,210,255,0.85)",
    fontWeight: 800,
    fontSize: "0.92rem",
  },

  subjectLine: { fontWeight: 900, marginBottom: 4 },
  snippet: { color: "rgba(255,255,255,0.75)", fontWeight: 700, fontSize: "0.95rem" },

  pill: {
    display: "inline-flex",
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: "0.85rem",
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.06)",
  },
  pillOut: { color: "#d5ccff" },
  pillIn: { color: "#b7ffd9" },

  empty: { padding: "16px 12px", color: COLORS.muted, fontWeight: 800 },
  loadingInline: { padding: "16px 12px", color: COLORS.muted, fontWeight: 800 },

  pager: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: "12px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(0,0,0,0.10)",
    flexWrap: "wrap",
  },
  pagerBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 900,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    cursor: "pointer",
    background: "rgba(255,255,255,0.06)",
  },
  pagerBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  pagerInfo: { color: COLORS.muted, fontWeight: 900 },

  panel: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    gridColumn: "2",
    gridRow: "1",
  },
  panelTitle: { fontWeight: 900, fontSize: "1.15rem", marginBottom: 10 },

  table: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHead: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr 0.8fr 1fr",
    gap: 10,
    padding: "10px 12px",
    background: "rgba(255,255,255,0.04)",
    color: COLORS.muted,
    fontWeight: 900,
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr 0.8fr 1fr",
    gap: 10,
    padding: "10px 12px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    fontWeight: 800,
  },
  mono: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  small: { color: COLORS.muted, fontWeight: 800, lineHeight: 1.5 },

  linkBtn: {
    display: "inline-flex",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: "#fff",
    textDecoration: "none",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
  },

  shopsList: { display: "grid", gap: 12, marginTop: 14 },
  shopCard: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: 12,
    background: "rgba(255,255,255,0.04)",
  },
  shopTop: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" },
  shopName: { fontWeight: 950 as any, fontSize: "1.05rem", marginBottom: 6 },
  shopMetaLine: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  shopPill: {
    display: "inline-flex",
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: "0.82rem",
    border: `1px solid ${COLORS.border}`,
    background: "rgba(0,0,0,0.25)",
  },
  shopMeta: { color: COLORS.muted, fontWeight: 800, fontSize: "0.92rem" },
  shopLink: {
    display: "inline-block",
    marginTop: 8,
    color: "rgba(201,210,255,0.95)",
    fontWeight: 900,
    textDecoration: "underline",
  },
  shopActions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 },
  shopifyBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
    color: "#ffffff",
    textDecoration: "none",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 8px 20px rgba(106,47,214,0.22)",
  },
  shopIdLine: { marginTop: 10, color: "rgba(201,210,255,0.85)", fontWeight: 800, fontSize: "0.9rem" },
};
