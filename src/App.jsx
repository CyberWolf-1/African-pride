import React, { useState, useEffect, useCallback } from "react";
import {
  Menu, X, Sprout, Leaf, HandHeart, Vote, Users, Mail, Phone, MapPin, ArrowRight, Check,
  ChevronRight, Image as ImageIcon, CreditCard, Smartphone, Minus, Plus, Loader2, Clock, Lock, BarChart3, Save,
} from "lucide-react";
import * as api from "./api";

const SECTORS = ["Éducation", "Environnement", "Santé", "Entrepreneuriat", "Technologie", "Culture & Art", "Agriculture"];
const VOTE_PRICE = 100; // FCFA par vote

/* ---------- Woven stripe signature element ---------- */
const Weave = ({ h = 10, opacity = 1, style = {} }) => (
  <div
    style={{
      height: h,
      width: "100%",
      opacity,
      backgroundImage:
        "repeating-linear-gradient(90deg, #C9A227 0 22px, #3C6E47 22px 34px, #F4EEDF 34px 40px, #7A2E1D 40px 52px, #171310 52px 64px)",
      ...style,
    }}
  />
);

/* ---------- Nav ---------- */
const NAV_ITEMS = [
  { key: "home", label: "Accueil" },
  { key: "concept", label: "Le Concept" },
  { key: "register", label: "S'inscrire" },
  { key: "candidates", label: "Candidat·e·s" },
  { key: "ranking", label: "Classement" },
  { key: "about", label: "À propos" },
  { key: "contact", label: "Contact" },
  { key: "admin", label: "Admin" },
];

function Header({ page, setPage }) {
  const [open, setOpen] = useState(false);
  const go = (k) => {
    setPage(k);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, background: "#171310", borderBottom: "1px solid #2C2318" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", maxWidth: 1100, margin: "0 auto" }}>
        <button onClick={() => go("home")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <span style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontStyle: "italic", fontSize: 22, color: "#F4EEDF", letterSpacing: 0.3 }}>
            African <span style={{ color: "#C9A227" }}>Pride</span>
          </span>
        </button>
        <nav className="ap-desktop-nav" style={{ display: "none" }}>
          {NAV_ITEMS.map((n) => (
            <button
              key={n.key}
              onClick={() => go(n.key)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif", fontSize: 13.5, letterSpacing: 0.4, textTransform: "uppercase",
                color: page === n.key ? "#C9A227" : "#B8AC97", padding: "8px 10px",
                borderBottom: page === n.key ? "2px solid #C9A227" : "2px solid transparent",
              }}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", color: "#F4EEDF", cursor: "pointer" }} aria-label="Menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid #2C2318", background: "#171310" }}>
          {NAV_ITEMS.map((n) => (
            <button
              key={n.key}
              onClick={() => go(n.key)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                background: "none", border: "none", borderBottom: "1px solid #241D15", cursor: "pointer",
                fontFamily: "Space Grotesk, sans-serif", fontSize: 15,
                color: page === n.key ? "#C9A227" : "#F4EEDF", padding: "16px 20px",
              }}
            >
              {n.label} <ChevronRight size={16} />
            </button>
          ))}
        </div>
      )}
      <Weave h={4} />
    </header>
  );
}

const Section = ({ children, style = {} }) => (
  <section style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 20px", ...style }}>{children}</section>
);

const Eyebrow = ({ children, color = "#C9A227" }) => (
  <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12.5, letterSpacing: 2, textTransform: "uppercase", color, marginBottom: 14 }}>
    {children}
  </div>
);

const Btn = ({ children, onClick, variant = "solid", type = "button", disabled }) => {
  const base = {
    fontFamily: "Space Grotesk, sans-serif", fontSize: 14.5, fontWeight: 600, letterSpacing: 0.3,
    padding: "13px 26px", borderRadius: 3, cursor: disabled ? "default" : "pointer",
    display: "inline-flex", alignItems: "center", gap: 8, border: "1.5px solid #C9A227",
    opacity: disabled ? 0.5 : 1,
  };
  const styles = variant === "solid" ? { ...base, background: "#C9A227", color: "#171310" } : { ...base, background: "transparent", color: "#F4EEDF" };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={styles}>
      {children}
    </button>
  );
};

const inputStyle = {
  width: "100%", background: "#1C1712", border: "1.5px solid #2C2318", borderRadius: 3,
  padding: "12px 14px", color: "#F4EEDF", fontFamily: "Space Grotesk, sans-serif", fontSize: 14.5,
  outline: "none", boxSizing: "border-box",
};
const labelStyle = {
  display: "block", fontFamily: "Space Grotesk, sans-serif", fontSize: 12.5, letterSpacing: 0.5,
  textTransform: "uppercase", color: "#B8AC97", marginBottom: 7,
};

/* ---------- Countdown ---------- */
function useNow(tick = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), tick);
    return () => clearInterval(id);
  }, [tick]);
  return now;
}

function splitDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function Countdown({ settings }) {
  const now = useNow();
  if (!settings || !settings.start) return null;

  const start = new Date(settings.start).getTime();
  const end = settings.end ? new Date(settings.end).getTime() : null;

  let label, target, phase;
  if (now < start) {
    label = "Le concours démarre dans";
    target = start;
    phase = "before";
  } else if (end && now < end) {
    label = "Fin des votes dans";
    target = end;
    phase = "during";
  } else if (end) {
    phase = "over";
  } else {
    label = "Concours en cours";
    phase = "during-noend";
  }

  if (phase === "over") {
    return (
      <div style={{ display: "inline-block", border: "1px solid #2C2318", borderRadius: 4, padding: "10px 18px", fontFamily: "Space Grotesk, sans-serif", fontSize: 13.5, color: "#B8AC97" }}>
        Le concours African Pride {new Date(start).getFullYear()} est terminé — merci à tou·te·s les votant·e·s.
      </div>
    );
  }

  const d = target ? splitDuration(target - now) : null;

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontFamily: "Space Grotesk, sans-serif", fontSize: 12.5, letterSpacing: 1, textTransform: "uppercase", color: "#C9A227" }}>
        <Clock size={14} /> {label}
      </div>
      {d && (
        <div style={{ display: "flex", gap: 14 }}>
          {[{ v: d.days, l: "Jours" }, { v: d.hours, l: "Heures" }, { v: d.minutes, l: "Min" }, { v: d.seconds, l: "Sec" }].map((u, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 30, color: "#F4EEDF", minWidth: 46 }}>{String(u.v).padStart(2, "0")}</div>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 10.5, letterSpacing: 1, color: "#7A6E58", textTransform: "uppercase" }}>{u.l}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Home ---------- */
function Home({ setPage, settings }) {
  return (
    <>
      <div style={{ background: "linear-gradient(180deg, #1C1712 0%, #171310 100%)" }}>
        <Section style={{ paddingTop: 72, paddingBottom: 60 }}>
          <Eyebrow>Concours d'engagement jeunesse — Cameroun</Eyebrow>
          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontStyle: "italic", fontSize: "clamp(38px, 7vw, 68px)", lineHeight: 1.02, color: "#F4EEDF", margin: "0 0 22px" }}>
            Ici, on couronne
            <br />
            des <span style={{ color: "#C9A227" }}>projets</span>.
            <br />
            Pas des apparences.
          </h1>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 17, color: "#B8AC97", maxWidth: 560, lineHeight: 1.6, marginBottom: 30 }}>
            African Pride finance les idées de la jeunesse camerounaise. Chaque Miss et chaque Master porte un projet
            concret pour transformer son quartier — le public vote pour le projet, pas pour un défilé.
          </p>
          <Countdown settings={settings} />
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 26 }}>
            <Btn onClick={() => setPage("register")}>S'inscrire <ArrowRight size={16} /></Btn>
            <Btn variant="outline" onClick={() => setPage("candidates")}>Voir les projets</Btn>
          </div>
        </Section>
      </div>
      <Weave h={10} />
      <Section>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 28 }}>
          {[
            { icon: <HandHeart size={22} />, title: "Pas de compétition physique", text: "Aucune note sur l'allure, le défilé ou l'éloquence. Le dossier de candidature repose entièrement sur le projet." },
            { icon: <Sprout size={22} />, title: "Un projet, un impact", text: "Chaque candidat·e présente une idée concrète pour son environnement : éducation, santé, environnement, entrepreneuriat…" },
            { icon: <Vote size={22} />, title: "Le public décide", text: "Le vote populaire est décisif. Les deux projets — Miss et Master — les plus soutenus remportent le fonds de démarrage." },
          ].map((f, i) => (
            <div key={i} style={{ borderTop: "3px solid #3C6E47", paddingTop: 18 }}>
              <div style={{ color: "#C9A227", marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 19, color: "#F4EEDF", margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 14.5, color: "#B8AC97", lineHeight: 1.6, margin: 0 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

/* ---------- Concept ---------- */
function Concept() {
  return (
    <Section>
      <Eyebrow>Le concept</Eyebrow>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: "clamp(30px,5vw,44px)", color: "#F4EEDF", margin: "0 0 24px", lineHeight: 1.1 }}>
        Un concours qui ne juge pas les corps — il finance les idées.
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 36, marginTop: 40 }}>
        <div>
          <h3 style={{ fontFamily: "Space Grotesk, sans-serif", color: "#C9A227", fontSize: 14, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Ce qu'African Pride n'est pas</h3>
          <ul style={{ fontFamily: "Space Grotesk, sans-serif", color: "#B8AC97", fontSize: 15, lineHeight: 2, paddingLeft: 18, margin: 0 }}>
            <li>Pas de défilé jugé sur la tenue ou la démarche</li>
            <li>Pas de note sur l'éloquence ou la prestance</li>
            <li>Pas de comparaison physique entre candidat·e·s</li>
          </ul>
        </div>
        <div>
          <h3 style={{ fontFamily: "Space Grotesk, sans-serif", color: "#3C6E47", fontSize: 14, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Ce qu'African Pride est</h3>
          <ul style={{ fontFamily: "Space Grotesk, sans-serif", color: "#B8AC97", fontSize: 15, lineHeight: 2, paddingLeft: 18, margin: 0 }}>
            <li>Une candidature centrée sur un projet à impact réel</li>
            <li>Une fiche projet claire : secteur, bénéficiaires, budget</li>
            <li>Un vote public décisif qui finance le projet gagnant</li>
          </ul>
        </div>
      </div>
      <Weave h={8} style={{ margin: "48px 0" }} />
      <div>
        <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 22, color: "#F4EEDF", marginBottom: 16 }}>Comment ça marche</h3>
        <ol style={{ fontFamily: "Space Grotesk, sans-serif", color: "#B8AC97", fontSize: 15, lineHeight: 2.1, paddingLeft: 20 }}>
          <li>Inscription en tant que Miss ou Master, avec présentation du projet</li>
          <li>Publication de la fiche projet sur la page Candidat·e·s</li>
          <li>Vote du public — chaque vote est payant (100 FCFA)</li>
          <li>Couronnement de la Miss et du Master ayant réuni le plus de votes</li>
          <li>Remise du fonds de démarrage pour lancer concrètement le projet</li>
        </ol>
      </div>
    </Section>
  );
}

/* ---------- Register ---------- */
function Register({ onRegistered }) {
  const [category, setCategory] = useState("miss");
  const [form, setForm] = useState({ name: "", age: "", city: "", sector: SECTORS[0], title: "", description: "", beneficiaries: "", budget: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Merci de choisir un fichier image.");
      return;
    }
    setPhotoError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.city || !form.title || !form.description) return;
    setSubmitting(true);
    setError("");
    try {
      const candidate = await api.registerCandidate({ ...form, category }, photoFile);
      onRegistered(candidate);
      setDone(true);
      setForm({ name: "", age: "", city: "", sector: SECTORS[0], title: "", description: "", beneficiaries: "", budget: "" });
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section style={{ maxWidth: 640 }}>
      <Eyebrow>Inscription</Eyebrow>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: "clamp(28px,5vw,40px)", color: "#F4EEDF", margin: "0 0 8px" }}>Présente ton projet</h1>
      <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#B8AC97", fontSize: 14.5, marginBottom: 30 }}>
        Choisis ta catégorie, puis décris le projet que tu veux porter pour African Pride.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
        {[{ k: "miss", label: "Miss African Pride" }, { k: "master", label: "Master African Pride" }].map((c) => (
          <button
            key={c.k}
            onClick={() => setCategory(c.k)}
            style={{
              flex: 1, padding: "14px 10px", borderRadius: 3, cursor: "pointer",
              fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 14,
              border: category === c.k ? "1.5px solid #C9A227" : "1.5px solid #2C2318",
              background: category === c.k ? "rgba(201,162,39,0.1)" : "transparent",
              color: category === c.k ? "#C9A227" : "#B8AC97",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {done && (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(60,110,71,0.15)", border: "1.5px solid #3C6E47", borderRadius: 3, padding: "14px 16px", marginBottom: 24 }}>
          <Check size={18} color="#3C6E47" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 14, color: "#F4EEDF", margin: 0 }}>
            Inscription enregistrée ! Ton projet est maintenant visible sur la page Candidat·e·s et peut recevoir des votes.
          </p>
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(192,101,74,0.12)", border: "1.5px solid #C0654A", borderRadius: 3, padding: "12px 16px", marginBottom: 24, fontFamily: "Space Grotesk, sans-serif", fontSize: 13.5, color: "#F4EEDF" }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>Photo</label>
          <label
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", aspectRatio: photoPreview ? "4/3" : "auto", height: photoPreview ? "auto" : 130,
              borderRadius: 4, background: "#1C1712", border: "1.5px dashed #3A2F20", overflow: "hidden",
              cursor: "pointer", position: "relative",
            }}
          >
            {photoPreview ? (
              <>
                <img src={photoPreview} alt="Aperçu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(23,19,16,0.85)", border: "1px solid #3A2F20", color: "#C9A227", fontFamily: "Space Grotesk, sans-serif", fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 20 }}>
                  Changer la photo
                </span>
              </>
            ) : (
              <>
                <ImageIcon size={26} color="#7A6E58" />
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13.5, color: "#B8AC97" }}>Ajouter une photo</span>
                <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11.5, color: "#7A6E58" }}>Galerie ou appareil photo</span>
              </>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
          </label>
          {photoError && <p style={{ color: "#C0654A", fontFamily: "Space Grotesk, sans-serif", fontSize: 12.5, marginTop: 6 }}>{photoError}</p>}
        </div>
        <div>
          <label style={labelStyle}>Nom complet</label>
          <input style={inputStyle} value={form.name} onChange={update("name")} placeholder="Ex : Marie Ngo Bakoa" required />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Âge</label>
            <input style={inputStyle} type="number" min="14" max="25" value={form.age} onChange={update("age")} placeholder="20" required />
          </div>
          <div>
            <label style={labelStyle}>Ville</label>
            <input style={inputStyle} value={form.city} onChange={update("city")} placeholder="Douala" required />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Secteur du projet</label>
          <select style={inputStyle} value={form.sector} onChange={update("sector")}>
            {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Titre du projet</label>
          <input style={inputStyle} value={form.title} onChange={update("title")} placeholder="Ex : Atelier de couture pour jeunes filles déscolarisées" required />
        </div>
        <div>
          <label style={labelStyle}>Description du projet</label>
          <textarea style={{ ...inputStyle, minHeight: 110, resize: "vertical" }} value={form.description} onChange={update("description")} placeholder="Explique le problème, ta solution, et comment tu comptes t'y prendre." required />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Bénéficiaires estimés</label>
            <input style={inputStyle} value={form.beneficiaries} onChange={update("beneficiaries")} placeholder="Ex : 50 jeunes" />
          </div>
          <div>
            <label style={labelStyle}>Budget estimé</label>
            <input style={inputStyle} value={form.budget} onChange={update("budget")} placeholder="Ex : 300 000 FCFA" />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <Btn type="submit" disabled={submitting}>{submitting ? "Envoi en cours…" : "Envoyer ma candidature"}</Btn>
        </div>
      </form>
    </Section>
  );
}

/* ---------- Payment modal ---------- */
function PaymentModal({ candidate, onClose, onConfirm }) {
  const [qty, setQty] = useState(1);
  const [method, setMethod] = useState("orange");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("idle"); // idle | processing | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const total = qty * VOTE_PRICE;

  const pay = async (e) => {
    e.preventDefault();
    if (!phone || status === "processing") return;
    setStatus("processing");
    setErrorMsg("");
    try {
      await onConfirm(candidate.id, { qty, method, phone });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,8,6,0.75)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={status !== "processing" ? onClose : undefined}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#171310", border: "1px solid #2C2318", borderRadius: 4, maxWidth: 420, width: "100%", padding: 26, maxHeight: "90vh", overflowY: "auto" }}>
        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(60,110,71,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Check size={26} color="#3C6E47" />
            </div>
            <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, color: "#F4EEDF", margin: "0 0 8px" }}>Vote confirmé</h3>
            <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 14, color: "#B8AC97", margin: "0 0 22px" }}>
              {qty} vote{qty > 1 ? "s" : ""} pour {candidate.name} ({total} FCFA).
            </p>
            <Btn onClick={onClose}>Fermer</Btn>
          </div>
        ) : (
          <form onSubmit={pay}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#C9A227", marginBottom: 4 }}>Voter pour</div>
                <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 19, color: "#F4EEDF", margin: 0 }}>{candidate.name}</h3>
              </div>
              {status !== "processing" && (
                <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#B8AC97", cursor: "pointer" }}><X size={20} /></button>
              )}
            </div>

            <label style={{ ...labelStyle, marginBottom: 8 }}>Nombre de votes — {VOTE_PRICE} FCFA / vote</label>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 38, height: 38, borderRadius: 3, border: "1.5px solid #2C2318", background: "transparent", color: "#F4EEDF", cursor: "pointer" }}><Minus size={16} /></button>
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 20, color: "#F4EEDF", minWidth: 32, textAlign: "center" }}>{qty}</span>
              <button type="button" onClick={() => setQty(qty + 1)} style={{ width: 38, height: 38, borderRadius: 3, border: "1.5px solid #2C2318", background: "transparent", color: "#F4EEDF", cursor: "pointer" }}><Plus size={16} /></button>
              <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                {[5, 10, 20].map((n) => (
                  <button key={n} type="button" onClick={() => setQty(n)} style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12, padding: "6px 10px", borderRadius: 3, border: "1px solid #2C2318", background: "transparent", color: "#B8AC97", cursor: "pointer" }}>{n}</button>
                ))}
              </div>
            </div>

            <label style={{ ...labelStyle, marginBottom: 8 }}>Moyen de paiement</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              {[{ k: "orange", label: "Orange Money" }, { k: "mtn", label: "MTN MoMo" }].map((m) => (
                <button
                  key={m.k} type="button" onClick={() => setMethod(m.k)}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 10px",
                    borderRadius: 3, cursor: "pointer", fontFamily: "Space Grotesk, sans-serif", fontSize: 13.5, fontWeight: 600,
                    border: method === m.k ? "1.5px solid #C9A227" : "1.5px solid #2C2318",
                    background: method === m.k ? "rgba(201,162,39,0.1)" : "transparent",
                    color: method === m.k ? "#C9A227" : "#B8AC97",
                  }}
                >
                  <Smartphone size={15} /> {m.label}
                </button>
              ))}
            </div>

            <label style={{ ...labelStyle, marginBottom: 8 }}>Numéro {method === "orange" ? "Orange Money" : "MTN MoMo"}</label>
            <input style={{ ...inputStyle, marginBottom: 20 }} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="6XX XX XX XX" required disabled={status === "processing"} />

            {status === "error" && (
              <p style={{ color: "#C0654A", fontFamily: "Space Grotesk, sans-serif", fontSize: 13, marginBottom: 14 }}>{errorMsg}</p>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: "1px solid #2C2318", marginBottom: 18 }}>
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, color: "#B8AC97" }}>Total</span>
              <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 22, color: "#F4EEDF" }}>{total} FCFA</span>
            </div>

            <Btn type="submit" disabled={status === "processing"}>
              {status === "processing" ? <><Loader2 size={16} className="ap-spin" /> Traitement…</> : <><CreditCard size={16} /> Payer et voter</>}
            </Btn>
            <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11.5, color: "#7A6E58", marginTop: 14, lineHeight: 1.5 }}>
              Le vote est bien enregistré sur le serveur. Le débit réel Orange Money / MTN MoMo nécessite de brancher
              une vraie passerelle de paiement (voir server/index.js) avant la mise en production.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------- Candidates ---------- */
function Candidates({ candidates, onBuyVotes, loading }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const list = candidates.filter((c) => filter === "all" || c.category === filter);

  return (
    <Section>
      <Eyebrow>Candidat·e·s</Eyebrow>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: "clamp(28px,5vw,40px)", color: "#F4EEDF", margin: "0 0 22px" }}>Les projets en lice</h1>
      <div style={{ display: "flex", gap: 10, marginBottom: 30, flexWrap: "wrap" }}>
        {[{ k: "all", label: "Tous" }, { k: "miss", label: "Miss" }, { k: "master", label: "Master" }].map((f) => (
          <button
            key={f.k} onClick={() => setFilter(f.k)}
            style={{
              padding: "8px 18px", borderRadius: 20, cursor: "pointer", fontFamily: "Space Grotesk, sans-serif", fontSize: 13, fontWeight: 600,
              border: filter === f.k ? "1.5px solid #C9A227" : "1.5px solid #2C2318",
              background: filter === f.k ? "rgba(201,162,39,0.12)" : "transparent",
              color: filter === f.k ? "#C9A227" : "#B8AC97",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#B8AC97" }}>Chargement des candidatures…</p>
      ) : list.length === 0 ? (
        <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#B8AC97" }}>Aucun·e candidat·e pour l'instant dans cette catégorie.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 22 }}>
          {list.map((c) => (
            <div key={c.id} style={{ border: "1px solid #2C2318", borderRadius: 4, overflow: "hidden", background: "#1C1712", display: "flex", flexDirection: "column" }}>
              <div style={{ width: "100%", aspectRatio: "4/3", background: "#241D15", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {c.photo ? <img src={c.photo} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={30} color="#3A2F20" />}
              </div>
              <div style={{ padding: 22, display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: c.category === "miss" ? "#C9A227" : "#3C6E47" }}>
                    {c.category === "miss" ? "Miss" : "Master"} · {c.sector}
                  </span>
                </div>
                <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 19, color: "#F4EEDF", margin: "0 0 4px" }}>{c.title}</h3>
                <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, color: "#B8AC97", margin: "0 0 12px" }}>{c.name} — {c.age} ans, {c.city}</p>
                <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 14, color: "#D8D0BE", lineHeight: 1.55, flex: 1, margin: "0 0 14px" }}>{c.description}</p>
                {(c.beneficiaries || c.budget) && (
                  <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 12.5, color: "#7A6E58", marginBottom: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {c.beneficiaries && <span>👥 {c.beneficiaries}</span>}
                    {c.budget && <span>💰 {c.budget}</span>}
                  </div>
                )}
                <Weave h={4} style={{ marginBottom: 14, borderRadius: 2 }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, color: "#F4EEDF", fontWeight: 600 }}>{c.votes} vote{c.votes !== 1 ? "s" : ""}</span>
                  <Btn onClick={() => setSelected(c)}>Voter <Vote size={15} /></Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selected && (
        <PaymentModal
          candidate={selected}
          onClose={() => setSelected(null)}
          onConfirm={async (id, payload) => { await onBuyVotes(id, payload); }}
        />
      )}
    </Section>
  );
}

/* ---------- Ranking ---------- */
function Ranking({ candidates, loading }) {
  const rank = (cat) => candidates.filter((c) => c.category === cat).sort((a, b) => b.votes - a.votes);
  const max = Math.max(1, ...candidates.map((c) => c.votes));

  const Board = ({ title, color, items }) => (
    <div style={{ flex: 1, minWidth: 260 }}>
      <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, color, marginBottom: 18 }}>{title}</h3>
      {items.length === 0 && <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#B8AC97", fontSize: 14 }}>Pas encore de candidat·e.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((c, i) => (
          <div key={c.id}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Space Grotesk, sans-serif", fontSize: 13.5, color: "#F4EEDF", marginBottom: 6 }}>
              <span>{i + 1}. {c.name}</span>
              <span style={{ color: "#B8AC97" }}>{c.votes} vote{c.votes !== 1 ? "s" : ""}</span>
            </div>
            <div style={{ height: 8, background: "#241D15", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(c.votes / max) * 100}%`, background: color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Section>
      <Eyebrow>Classement</Eyebrow>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: "clamp(28px,5vw,40px)", color: "#F4EEDF", margin: "0 0 30px" }}>En tête des votes</h1>
      {loading ? (
        <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#B8AC97" }}>Chargement…</p>
      ) : (
        <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
          <Board title="Miss African Pride" color="#C9A227" items={rank("miss")} />
          <Board title="Master African Pride" color="#3C6E47" items={rank("master")} />
        </div>
      )}
    </Section>
  );
}

/* ---------- About ---------- */
function About() {
  return (
    <Section style={{ maxWidth: 760 }}>
      <Eyebrow>À propos</Eyebrow>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: "clamp(28px,5vw,40px)", color: "#F4EEDF", margin: "0 0 24px" }}>Notre mission</h1>
      <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 16, color: "#D8D0BE", lineHeight: 1.75, marginBottom: 20 }}>
        African Pride est né d'une conviction simple : la jeunesse camerounaise déborde d'idées capables de changer
        son environnement, mais manque souvent des moyens pour les lancer. Plutôt qu'un concours de beauté classique,
        African Pride est un concours d'engagement — où l'unique mérite qui compte est celui du projet porté.
      </p>
      <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 16, color: "#D8D0BE", lineHeight: 1.75, marginBottom: 20 }}>
        Chaque édition couronne une Miss et un Master African Pride, chacun·e reparti·e avec un fonds de démarrage
        pour concrétiser son projet — qu'il touche l'éducation, la santé, l'environnement ou l'entrepreneuriat local.
      </p>
      <div style={{ display: "flex", gap: 28, marginTop: 40, flexWrap: "wrap" }}>
        {[
          { icon: <Leaf size={20} />, label: "Impact réel", text: "Chaque projet doit changer concrètement une communauté." },
          { icon: <Users size={20} />, label: "Égalité", text: "Une couronne Miss, une couronne Master, à égalité." },
          { icon: <Vote size={20} />, label: "Transparence", text: "Le vote public décide seul des gagnant·e·s." },
        ].map((v, i) => (
          <div key={i} style={{ flex: "1 1 180px" }}>
            <div style={{ color: "#C9A227", marginBottom: 8 }}>{v.icon}</div>
            <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: 14.5, color: "#F4EEDF", margin: "0 0 4px" }}>{v.label}</p>
            <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13.5, color: "#B8AC97", margin: 0, lineHeight: 1.5 }}>{v.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- Contact ---------- */
function Contact() {
  return (
    <Section style={{ maxWidth: 560 }}>
      <Eyebrow>Contact</Eyebrow>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: "clamp(28px,5vw,40px)", color: "#F4EEDF", margin: "0 0 24px" }}>Parlons-en</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {[{ icon: <Mail size={18} />, label: "contact@africanpride.cm" }, { icon: <Phone size={18} />, label: "+237 6XX XX XX XX" }, { icon: <MapPin size={18} />, label: "Douala, Cameroun" }].map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "Space Grotesk, sans-serif", color: "#D8D0BE", fontSize: 15 }}>
            <span style={{ color: "#C9A227" }}>{c.icon}</span> {c.label}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- Admin ---------- */
function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Admin({ settings, onSaveSettings, candidates, loading }) {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [start, setStart] = useState(toLocalInputValue(settings?.start));
  const [end, setEnd] = useState(toLocalInputValue(settings?.end));
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setStart(toLocalInputValue(settings?.start));
    setEnd(toLocalInputValue(settings?.end));
  }, [settings]);

  if (!authed) {
    return (
      <Section style={{ maxWidth: 380 }}>
        <Eyebrow>Espace admin</Eyebrow>
        <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 30, color: "#F4EEDF", margin: "0 0 24px" }}>Accès réservé</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api.saveSettings(settings || {}, pwd);
              setAuthed(true);
              setPwdError("");
            } catch {
              setPwdError("Mot de passe incorrect.");
            }
          }}
        >
          <label style={labelStyle}>Mot de passe</label>
          <input style={{ ...inputStyle, marginBottom: 10 }} type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} autoFocus />
          {pwdError && <p style={{ color: "#C0654A", fontFamily: "Space Grotesk, sans-serif", fontSize: 12.5, marginBottom: 10 }}>{pwdError}</p>}
          <Btn type="submit"><Lock size={15} /> Se connecter</Btn>
        </form>
        <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11.5, color: "#7A6E58", marginTop: 20, lineHeight: 1.5 }}>
          Le mot de passe est défini par la variable d'environnement <code>ADMIN_PASSWORD</code> sur le serveur.
        </p>
      </Section>
    );
  }

  const totalVotes = candidates.reduce((s, c) => s + (c.votes || 0), 0);
  const revenue = totalVotes * VOTE_PRICE;
  const missCount = candidates.filter((c) => c.category === "miss").length;
  const masterCount = candidates.filter((c) => c.category === "master").length;

  const save = async (e) => {
    e.preventDefault();
    setSaveError("");
    try {
      const next = await onSaveSettings({ start: start ? new Date(start).toISOString() : null, end: end ? new Date(end).toISOString() : null }, pwd);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err.message);
    }
  };

  return (
    <Section style={{ maxWidth: 640 }}>
      <Eyebrow>Espace admin</Eyebrow>
      <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: "clamp(28px,5vw,38px)", color: "#F4EEDF", margin: "0 0 30px" }}>Réglages du concours</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 16, marginBottom: 40 }}>
        {[
          { icon: <Users size={16} />, label: "Miss inscrites", value: missCount },
          { icon: <Users size={16} />, label: "Masters inscrits", value: masterCount },
          { icon: <Vote size={16} />, label: "Votes totaux", value: totalVotes },
          { icon: <BarChart3 size={16} />, label: "Revenu (FCFA)", value: revenue.toLocaleString("fr-FR") },
        ].map((s, i) => (
          <div key={i} style={{ border: "1px solid #2C2318", borderRadius: 4, padding: 16, background: "#1C1712" }}>
            <div style={{ color: "#C9A227", marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: "Fraunces, serif", fontWeight: 800, fontSize: 22, color: "#F4EEDF" }}>{loading ? "…" : s.value}</div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 11.5, color: "#B8AC97", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 20, color: "#F4EEDF", marginBottom: 6 }}>Durée du concours</h3>
      <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13.5, color: "#B8AC97", marginBottom: 22 }}>
        Définis la date de début (affiche un compte à rebours avant le lancement) et la date de fin (clôture les votes).
      </p>
      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 360 }}>
        <div>
          <label style={labelStyle}>Début du concours</label>
          <input style={inputStyle} type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Fin des votes</label>
          <input style={inputStyle} type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        {saveError && <p style={{ color: "#C0654A", fontFamily: "Space Grotesk, sans-serif", fontSize: 13 }}>{saveError}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Btn type="submit"><Save size={15} /> Enregistrer</Btn>
          {saved && <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 13, color: "#3C6E47", display: "flex", alignItems: "center", gap: 6 }}><Check size={15} /> Enregistré</span>}
        </div>
      </form>
    </Section>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [page, setPage] = useState("home");
  const [candidates, setCandidates] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminPwd, setAdminPwd] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [c, s] = await Promise.all([api.fetchCandidates(), api.fetchSettings()]);
        setCandidates(c);
        setSettings(s);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRegistered = useCallback((candidate) => {
    setCandidates((prev) => [...prev, candidate]);
  }, []);

  const handleBuyVotes = useCallback(async (id, payload) => {
    const updated = await api.voteCandidate(id, payload);
    setCandidates((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);

  const handleSaveSettings = useCallback(async (next, pwd) => {
    const saved = await api.saveSettings(next, pwd);
    setSettings(saved);
    setAdminPwd(pwd);
    return saved;
  }, []);

  return (
    <div style={{ background: "#171310", minHeight: "100vh" }}>
      <style>{`
        @media (min-width: 860px) { .ap-desktop-nav { display: flex !important; gap: 2px; } }
      `}</style>
      <Header page={page} setPage={setPage} />
      {page === "home" && <Home setPage={setPage} settings={settings} />}
      {page === "concept" && <Concept />}
      {page === "register" && <Register onRegistered={handleRegistered} />}
      {page === "candidates" && <Candidates candidates={candidates} onBuyVotes={handleBuyVotes} loading={loading} />}
      {page === "ranking" && <Ranking candidates={candidates} loading={loading} />}
      {page === "about" && <About />}
      {page === "contact" && <Contact />}
      {page === "admin" && <Admin settings={settings} onSaveSettings={handleSaveSettings} candidates={candidates} loading={loading} />}
      <Weave h={6} />
      <footer style={{ textAlign: "center", padding: "28px 20px", fontFamily: "Space Grotesk, sans-serif", fontSize: 12.5, color: "#7A6E58" }}>
        © 2026 African Pride — Concours d'engagement jeunesse
      </footer>
    </div>
  );
}
