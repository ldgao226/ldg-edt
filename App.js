import { useState, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════
//  DONNÉES DU SYSTÈME ÉDUCATIF BURKINABÈ (MENA)
// ═══════════════════════════════════════════════════════════════════════════

const SERIES = {
  "2nde": {
    label: "Seconde (Tronc commun)", couleur: "#059669",
    volumes: { Français: 4, Maths: 5, Anglais: 3, "Histoire-Géo": 3, "Physique-Chimie": 3, SVT: 3, EPS: 2, Espagnol: 2, Informatique: 1, "Éd. Civique": 1 }
  },
  "1ère A": {
    label: "Première Littéraire", couleur: "#7c3aed",
    volumes: { Français: 6, Maths: 3, Anglais: 4, "Histoire-Géo": 4, "Physique-Chimie": 2, SVT: 2, EPS: 2, Philosophie: 3, Espagnol: 3, Informatique: 1, "Éd. Civique": 1 }
  },
  "1ère C": {
    label: "Première Scientifique", couleur: "#2563eb",
    volumes: { Français: 4, Maths: 6, Anglais: 3, "Histoire-Géo": 2, "Physique-Chimie": 5, SVT: 2, EPS: 2, Philosophie: 2, Espagnol: 2, Informatique: 2, "Éd. Civique": 1 }
  },
  "1ère D": {
    label: "Première Sciences Naturelles", couleur: "#0891b2",
    volumes: { Français: 4, Maths: 4, Anglais: 3, "Histoire-Géo": 2, "Physique-Chimie": 4, SVT: 5, EPS: 2, Philosophie: 2, Espagnol: 2, Informatique: 1, "Éd. Civique": 1 }
  },
  "Tle A": {
    label: "Terminale Littéraire", couleur: "#6d28d9",
    volumes: { Français: 7, Maths: 3, Anglais: 4, "Histoire-Géo": 5, "Physique-Chimie": 2, EPS: 2, Philosophie: 4, Espagnol: 3, Informatique: 1, "Éd. Civique": 1 }
  },
  "Tle C": {
    label: "Terminale Scientifique", couleur: "#1d4ed8",
    volumes: { Français: 4, Maths: 7, Anglais: 3, "Histoire-Géo": 2, "Physique-Chimie": 6, SVT: 2, EPS: 2, Philosophie: 3, Espagnol: 2, Informatique: 2, "Éd. Civique": 1 }
  },
  "Tle D": {
    label: "Terminale Sciences Naturelles", couleur: "#0e7490",
    volumes: { Français: 4, Maths: 5, Anglais: 3, "Histoire-Géo": 2, "Physique-Chimie": 4, SVT: 6, EPS: 2, Philosophie: 3, Espagnol: 2, Informatique: 1, "Éd. Civique": 1 }
  },
};

const MAT_META = {
  Français:          { icon: "✍", bg: "#fef3c7", border: "#f59e0b", text: "#78350f" },
  Maths:             { icon: "∑", bg: "#dbeafe", border: "#3b82f6", text: "#1e3a8a" },
  Anglais:           { icon: "🌍", bg: "#d1fae5", border: "#10b981", text: "#064e3b" },
  "Histoire-Géo":    { icon: "⏳", bg: "#ffe4e6", border: "#f43f5e", text: "#881337" },
  "Physique-Chimie": { icon: "⚗", bg: "#fce7f3", border: "#ec4899", text: "#831843" },
  SVT:               { icon: "🌿", bg: "#dcfce7", border: "#22c55e", text: "#14532d" },
  EPS:               { icon: "🏃", bg: "#ffedd5", border: "#f97316", text: "#7c2d12" },
  Philosophie:       { icon: "💭", bg: "#ede9fe", border: "#8b5cf6", text: "#4c1d95" },
  Espagnol:          { icon: "🎤", bg: "#fdf2f8", border: "#d946ef", text: "#701a75" },
  Informatique:      { icon: "💻", bg: "#e0f2fe", border: "#0ea5e9", text: "#0c4a6e" },
  "Éd. Civique":     { icon: "🏛", bg: "#f0fdf4", border: "#4ade80", text: "#166534" },
};

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const CRENEAUX_DEF = [
  { id: "c1",  label: "7h30–8h30",   heure: "7h30" },
  { id: "c2",  label: "8h30–9h30",   heure: "8h30" },
  { id: "c3",  label: "9h30–10h30",  heure: "9h30" },
  { id: "p1",  label: "Récréation",  pause: true },
  { id: "c4",  label: "11h00–12h00", heure: "11h00" },
  { id: "c5",  label: "12h00–13h00", heure: "12h00" },
  { id: "dej", label: "Déjeuner",    pause: true },
  { id: "c6",  label: "14h30–15h30", heure: "14h30" },
  { id: "c7",  label: "15h30–16h30", heure: "15h30" },
  { id: "p2",  label: "Récréation",  pause: true },
  { id: "c8",  label: "16h45–17h45", heure: "16h45" },
];
const SLOTS = CRENEAUX_DEF.filter(c => !c.pause).map(c => c.id);

// ═══════════════════════════════════════════════════════════════════════════
//  ALGORITHME DE GÉNÉRATION
// ═══════════════════════════════════════════════════════════════════════════

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function genererGrille(serie, enseignants, sallesDisp, profOccupe, salleOccupee) {
  const volumes = { ...SERIES[serie]?.volumes };
  const matieres = Object.entries(volumes)
    .filter(([, h]) => h > 0)
    .sort((a, b) => b[1] - a[1]);

  const grille = {};
  JOURS.forEach(j => { grille[j] = {}; SLOTS.forEach(s => { grille[j][s] = null; }); });

  const conflits = [];

  for (const [matiere, heures] of matieres) {
    const prof = enseignants.find(e => e.matiere === matiere);
    const profNom = prof?.nom || "À affecter";
    let placed = 0;
    const allSlots = shuffle(JOURS.flatMap(j => SLOTS.map(s => [j, s])));

    for (const [jour, slot] of allSlots) {
      if (placed >= heures) break;
      if (grille[jour][slot] !== null) continue;

      const countJour = Object.values(grille[jour]).filter(c => c?.matiere === matiere).length;
      if (countJour >= 2) continue;

      const idx = SLOTS.indexOf(slot);
      if (idx > 0 && grille[jour][SLOTS[idx - 1]]?.matiere === matiere) continue;
      if (idx < SLOTS.length - 1 && grille[jour][SLOTS[idx + 1]]?.matiere === matiere) continue;

      const cleProfSlot = `${profNom}|${jour}|${slot}`;
      if (prof && profOccupe.has(cleProfSlot)) {
        conflits.push({ matiere, jour, slot, type: "prof", prof: profNom });
        continue;
      }

      let salle = "À définir";
      if (sallesDisp.length > 0) {
        const salleLibre = sallesDisp.find(s2 => !salleOccupee.has(`${s2}|${jour}|${slot}`));
        if (salleLibre) {
          salle = salleLibre;
          salleOccupee.add(`${salleLibre}|${jour}|${slot}`);
        } else {
          conflits.push({ matiere, jour, slot, type: "salle" });
          salle = sallesDisp[0] + " ⚠";
        }
      }

      grille[jour][slot] = { matiere, prof: profNom, salle };
      if (prof) profOccupe.add(cleProfSlot);
      placed++;
    }
  }

  return { grille, conflits };
}

// ═══════════════════════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

const ETAPES = ["Établissement", "Classes", "Enseignants", "Salles", "Résultats"];

export default function App() {
  const [etape, setEtape] = useState(0);
  const [lycee, setLycee] = useState({
    nom: "Lycée Philippe Zinda Kaboré",
    ville: "Ouagadougou",
    region: "Centre",
    annee: "2025-2026",
    directeur: "",
  });
  const [classes, setClasses] = useState([
    { id: 1, serie: "Tle C",   label: "TleC1",  effectif: 48 },
    { id: 2, serie: "1ère D",  label: "1eD1",   effectif: 52 },
    { id: 3, serie: "2nde",    label: "2nde1",  effectif: 60 },
  ]);
  const [enseignants, setEnseignants] = useState([
    { id: 1,  nom: "M. Ouédraogo K.",      matiere: "Maths" },
    { id: 2,  nom: "Mme Kaboré A.",        matiere: "Français" },
    { id: 3,  nom: "M. Traoré B.",         matiere: "Physique-Chimie" },
    { id: 4,  nom: "Mme Sawadogo R.",      matiere: "SVT" },
    { id: 5,  nom: "M. Zongo P.",          matiere: "Histoire-Géo" },
    { id: 6,  nom: "Mme Diallo F.",        matiere: "Anglais" },
    { id: 7,  nom: "M. Coulibaly S.",      matiere: "Philosophie" },
    { id: 8,  nom: "Mme Compaoré N.",      matiere: "Espagnol" },
    { id: 9,  nom: "M. Barro I.",          matiere: "EPS" },
    { id: 10, nom: "M. Nikiema W.",        matiere: "Informatique" },
    { id: 11, nom: "Mme Tiendrebéogo M.", matiere: "Éd. Civique" },
  ]);
  const [salles, setSalles] = useState([
    "Salle 101", "Salle 102", "Salle 103", "Salle 201", "Salle 202",
    "Labo Sciences", "Labo Informatique", "Gymnase",
  ]);
  const [resultats, setResultats] = useState(null);
  const [classeActive, setClasseActive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newClasse, setNewClasse] = useState({ serie: "2nde", label: "", effectif: 50 });
  const [newEns, setNewEns] = useState({ nom: "", matiere: "Maths" });
  const [newSalle, setNewSalle] = useState("");
  const [menuOuvert, setMenuOuvert] = useState(false);

  const totalHeures = useMemo(() =>
    classes.reduce((acc, cl) => acc + Object.values(SERIES[cl.serie]?.volumes || {}).reduce((a, b) => a + b, 0), 0),
    [classes]
  );

  const generer = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const profOccupe = new Set();
      const salleOccupee = new Set();
      const res = {};
      let tousConflits = [];
      classes.forEach(cl => {
        const { grille, conflits } = genererGrille(cl.serie, enseignants, salles, profOccupe, salleOccupee);
        res[cl.id] = { grille, conflits };
        tousConflits = tousConflits.concat(conflits.map(c => ({ ...c, classe: cl.label })));
      });
      setResultats({ grilles: res, conflits: tousConflits });
      setClasseActive(classes[0]?.id || null);
      setEtape(4);
      setLoading(false);
    }, 700);
  }, [classes, enseignants, salles]);

  const regenererClasse = (classId) => {
    const cl = classes.find(c => c.id === classId);
    if (!cl) return;
    const profOccupe = new Set();
    const salleOccupee = new Set();
    Object.entries(resultats.grilles).forEach(([id, { grille }]) => {
      if (parseInt(id) === classId) return;
      JOURS.forEach(j => SLOTS.forEach(s => {
        const c = grille[j]?.[s];
        if (c) {
          if (c.prof !== "À affecter") profOccupe.add(`${c.prof}|${j}|${s}`);
          if (c.salle && !c.salle.includes("⚠")) salleOccupee.add(`${c.salle}|${j}|${s}`);
        }
      }));
    });
    const { grille, conflits } = genererGrille(cl.serie, enseignants, salles, profOccupe, salleOccupee);
    setResultats(prev => ({
      ...prev,
      grilles: { ...prev.grilles, [classId]: { grille, conflits } },
      conflits: prev.conflits.filter(c => c.classe !== cl.label).concat(conflits.map(c => ({ ...c, classe: cl.label }))),
    }));
  };

  const classeSelectionnee = classes.find(c => c.id === classeActive);
  const grilleActive = resultats?.grilles[classeActive]?.grille || {};

  // ─── RENDU ────────────────────────────────────────────────────────────

  return (
    <div style={S.root}>
      {/* ── TOP BAR MOBILE ── */}
      <header style={S.topbar}>
        <div style={S.topbarLogo}>
          <div style={S.logoMark}>EDT</div>
          <div>
            <div style={S.logoTitle}>PlanLycée BF</div>
            <div style={S.logoSub}>MENA · BURKINA FASO</div>
          </div>
        </div>
        <button style={S.menuBtn} onClick={() => setMenuOuvert(!menuOuvert)}>
          {menuOuvert ? "✕" : "☰"}
        </button>
      </header>

      {/* ── MENU MOBILE ── */}
      {menuOuvert && (
        <div style={S.mobileMenu}>
          {ETAPES.map((e, i) => (
            <button key={i} style={{ ...S.mobileMenuItem, ...(etape === i ? S.mobileMenuActive : {}) }}
              onClick={() => { if (i < 4 || resultats) { setEtape(i); setMenuOuvert(false); } }}
              disabled={i === 4 && !resultats}>
              <span style={S.mobileMenuNum}>{i + 1}</span>
              {e}
              {i === 4 && resultats?.conflits?.length > 0 && (
                <span style={S.badge}>{resultats.conflits.length}</span>
              )}
            </button>
          ))}
          <div style={S.mobileStats}>
            {classes.length} classes · {enseignants.length} profs · {totalHeures}h/sem.
          </div>
        </div>
      )}

      <div style={S.layout}>
        {/* ── SIDEBAR DESKTOP ── */}
        <aside style={S.sidebar}>
          <div style={S.sidebarLogo}>
            <div style={S.logoMark}>EDT</div>
            <div>
              <div style={S.logoTitle}>PlanLycée BF</div>
              <div style={S.logoSub}>MENA · BURKINA FASO</div>
            </div>
          </div>
          <nav style={S.nav}>
            {ETAPES.map((e, i) => (
              <button key={i} style={{ ...S.navItem, ...(etape === i ? S.navActive : {}) }}
                onClick={() => { if (i < 4 || resultats) setEtape(i); }}
                disabled={i === 4 && !resultats}>
                <span style={{ ...S.navNum, ...(etape === i ? S.navNumActive : {}) }}>{i + 1}</span>
                <span>{e}</span>
                {i === 4 && resultats?.conflits?.length > 0 && (
                  <span style={S.badge}>{resultats.conflits.length}</span>
                )}
              </button>
            ))}
          </nav>
          <div style={S.sidebarFooter}>
            <div style={S.statLine}><span style={S.statVal}>{classes.length}</span> classes</div>
            <div style={S.statLine}><span style={S.statVal}>{enseignants.length}</span> enseignants</div>
            <div style={S.statLine}><span style={S.statVal}>{salles.length}</span> salles</div>
            <div style={{ ...S.statLine, marginTop: 8 }}><span style={{ ...S.statVal, color: "#f59e0b" }}>{totalHeures}h</span> /semaine</div>
          </div>
        </aside>

        {/* ── CONTENU PRINCIPAL ── */}
        <main style={S.main}>

          {/* ÉTAPE 0 : ÉTABLISSEMENT */}
          {etape === 0 && (
            <div style={S.panel}>
              <PanelTitle icon="🏫" title="Informations de l'établissement"
                sub="Renseignez les informations générales du lycée" />
              <div style={S.formGrid}>
                {[
                  { label: "Nom du lycée", key: "nom", placeholder: "Ex: Lycée Philippe Zinda Kaboré" },
                  { label: "Ville", key: "ville", placeholder: "Ex: Ouagadougou" },
                  { label: "Région", key: "region", placeholder: "Ex: Centre" },
                  { label: "Année scolaire", key: "annee", placeholder: "Ex: 2025-2026" },
                  { label: "Directeur(trice)", key: "directeur", placeholder: "Optionnel" },
                ].map(({ label, key, placeholder }) => (
                  <FormField key={key} label={label}>
                    <input style={S.input} value={lycee[key]} placeholder={placeholder}
                      onChange={e => setLycee(p => ({ ...p, [key]: e.target.value }))} />
                  </FormField>
                ))}
              </div>
              <NextBtn onClick={() => setEtape(1)} />
            </div>
          )}

          {/* ÉTAPE 1 : CLASSES */}
          {etape === 1 && (
            <div style={S.panel}>
              <PanelTitle icon="📚" title="Gestion des classes"
                sub={`${classes.length} classe(s) configurée(s)`} />
              <div style={S.tableCard}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {["ID", "Série", "Effectif", "H/sem", ""].map(h => <th key={h} style={S.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map(cl => {
                      const totalH = Object.values(SERIES[cl.serie]?.volumes || {}).reduce((a, b) => a + b, 0);
                      return (
                        <tr key={cl.id} style={S.tr}>
                          <td style={S.td}>
                            <span style={{ ...S.seriePill, background: SERIES[cl.serie]?.couleur + "22", color: SERIES[cl.serie]?.couleur }}>
                              {cl.label}
                            </span>
                          </td>
                          <td style={{ ...S.td, fontSize: 11 }}>{cl.serie}</td>
                          <td style={S.td}>{cl.effectif}</td>
                          <td style={S.td}><strong>{totalH}h</strong></td>
                          <td style={S.td}>
                            <button style={S.btnDel} onClick={() => setClasses(p => p.filter(c => c.id !== cl.id))}>✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={S.addBlock}>
                <div style={S.formRow}>
                  <FormField label="Identifiant">
                    <input style={S.input} placeholder="TleC1" value={newClasse.label}
                      onChange={e => setNewClasse(p => ({ ...p, label: e.target.value }))} />
                  </FormField>
                  <FormField label="Série">
                    <select style={S.select} value={newClasse.serie}
                      onChange={e => setNewClasse(p => ({ ...p, serie: e.target.value }))}>
                      {Object.entries(SERIES).map(([k, v]) => <option key={k} value={k}>{k} – {v.label}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Effectif">
                    <input style={{ ...S.input, width: 80 }} type="number" value={newClasse.effectif}
                      onChange={e => setNewClasse(p => ({ ...p, effectif: parseInt(e.target.value) || 0 }))} />
                  </FormField>
                </div>
                <button style={S.btnAdd} onClick={() => {
                  setClasses(p => [...p, { id: Date.now(), serie: newClasse.serie, label: newClasse.label || newClasse.serie, effectif: newClasse.effectif }]);
                  setNewClasse(p => ({ ...p, label: "" }));
                }}>+ Ajouter la classe</button>
              </div>
              <NavRow onBack={() => setEtape(0)} onNext={() => setEtape(2)} />
            </div>
          )}

          {/* ÉTAPE 2 : ENSEIGNANTS */}
          {etape === 2 && (
            <div style={S.panel}>
              <PanelTitle icon="👨‍🏫" title="Corps enseignant"
                sub="Associez chaque matière à un enseignant" />
              <div style={S.matGrid}>
                {Object.keys(MAT_META).map(m => {
                  const prof = enseignants.find(e => e.matiere === m);
                  const mc = MAT_META[m];
                  return (
                    <div key={m} style={{ ...S.matCard, borderColor: mc.border, background: mc.bg }}>
                      <div style={{ fontSize: 18 }}>{mc.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: mc.text }}>{m}</div>
                      <div style={{ fontSize: 10, color: prof ? "#475569" : "#ef4444", fontStyle: prof ? "normal" : "italic" }}>
                        {prof ? prof.nom : "Non affecté"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={S.tableCard}>
                <table style={S.table}>
                  <thead>
                    <tr>{["Nom", "Matière", ""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {enseignants.map(e => (
                      <tr key={e.id} style={S.tr}>
                        <td style={S.td}>{e.nom}</td>
                        <td style={S.td}>
                          <span style={{ ...S.matPill, background: MAT_META[e.matiere]?.bg, color: MAT_META[e.matiere]?.text, borderColor: MAT_META[e.matiere]?.border }}>
                            {MAT_META[e.matiere]?.icon} {e.matiere}
                          </span>
                        </td>
                        <td style={S.td}>
                          <button style={S.btnDel} onClick={() => setEnseignants(p => p.filter(x => x.id !== e.id))}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={S.addBlock}>
                <div style={S.formRow}>
                  <FormField label="Nom complet">
                    <input style={S.input} placeholder="M. Kaboré Adama" value={newEns.nom}
                      onChange={e => setNewEns(p => ({ ...p, nom: e.target.value }))} />
                  </FormField>
                  <FormField label="Matière">
                    <select style={S.select} value={newEns.matiere}
                      onChange={e => setNewEns(p => ({ ...p, matiere: e.target.value }))}>
                      {Object.keys(MAT_META).map(m => <option key={m} value={m}>{MAT_META[m].icon} {m}</option>)}
                    </select>
                  </FormField>
                </div>
                <button style={S.btnAdd} onClick={() => {
                  if (!newEns.nom.trim()) return;
                  setEnseignants(p => [...p, { id: Date.now(), ...newEns }]);
                  setNewEns(p => ({ ...p, nom: "" }));
                }}>+ Ajouter</button>
              </div>
              <NavRow onBack={() => setEtape(1)} onNext={() => setEtape(3)} />
            </div>
          )}

          {/* ÉTAPE 3 : SALLES */}
          {etape === 3 && (
            <div style={S.panel}>
              <PanelTitle icon="🏛" title="Locaux disponibles"
                sub={`${salles.length} salle(s) configurée(s)`} />
              <div style={S.sallesGrid}>
                {salles.map(s => (
                  <div key={s} style={S.salleCard}>
                    <span style={{ fontSize: 18 }}>
                      {s.toLowerCase().includes("labo") ? "🔬" : s.toLowerCase().includes("gymn") ? "⛹" : "🏛"}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", flex: 1 }}>{s}</span>
                    <button style={S.salleX} onClick={() => setSalles(p => p.filter(x => x !== s))}>×</button>
                  </div>
                ))}
              </div>
              <div style={S.addBlock}>
                <div style={S.formRow}>
                  <FormField label="Nom de la salle">
                    <input style={S.input} placeholder="Salle 104, Amphi B, Labo Chimie…" value={newSalle}
                      onChange={e => setNewSalle(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && newSalle.trim()) { setSalles(p => [...p, newSalle.trim()]); setNewSalle(""); } }} />
                  </FormField>
                </div>
                <button style={S.btnAdd} onClick={() => {
                  if (!newSalle.trim()) return;
                  setSalles(p => [...p, newSalle.trim()]); setNewSalle("");
                }}>+ Ajouter</button>
              </div>
              <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <button style={S.btnBack} onClick={() => setEtape(2)}>← Retour</button>
                <button style={S.btnGenerer} onClick={generer} disabled={loading || classes.length === 0}>
                  {loading ? "⏳ Génération…" : `▶ Générer ${classes.length} emploi(s) du temps`}
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 4 : RÉSULTATS */}
          {etape === 4 && resultats && (
            <div style={S.panel}>
              <div style={S.resHeader}>
                <div>
                  <div style={S.lyceeName}>{lycee.nom}</div>
                  <div style={S.lyceeInfo}>{lycee.ville} · {lycee.region} · {lycee.annee}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button style={S.btnBack} onClick={() => window.print()}>🖨 Imprimer</button>
                  <button style={S.btnGenerer} onClick={generer}>↺ Tout regénérer</button>
                </div>
              </div>

              {resultats.conflits.length > 0 && (
                <div style={S.alertBox}>
                  <strong>⚠ {resultats.conflits.length} conflit(s) détecté(s)</strong>
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {resultats.conflits.slice(0, 5).map((c, i) => (
                      <span key={i} style={S.conflitPill}>
                        {c.classe} · {c.matiere} · {c.type === "prof" ? `Prof occupé` : "Salle manquante"}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={S.classesTabs}>
                {classes.map(cl => (
                  <button key={cl.id}
                    style={{
                      ...S.classeTab,
                      ...(classeActive === cl.id
                        ? { background: SERIES[cl.serie]?.couleur, color: "#fff", borderColor: SERIES[cl.serie]?.couleur }
                        : {}),
                    }}
                    onClick={() => setClasseActive(cl.id)}>
                    {cl.label}
                    {(resultats.grilles[cl.id]?.conflits?.length || 0) > 0 && (
                      <span style={{ marginLeft: 4, background: "#ef4444", borderRadius: "50%", width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "white" }}>
                        {resultats.grilles[cl.id].conflits.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {classeSelectionnee && (
                <div style={S.classeInfoBar}>
                  <div style={{ fontFamily: "sans-serif", fontSize: 13, flex: 1 }}>
                    <strong style={{ color: SERIES[classeSelectionnee.serie]?.couleur }}>{classeSelectionnee.label}</strong>
                    {" · "}{SERIES[classeSelectionnee.serie]?.label}
                    {" · "}{classeSelectionnee.effectif} élèves
                    {" · "}{Object.values(SERIES[classeSelectionnee.serie]?.volumes || {}).reduce((a, b) => a + b, 0)}h/sem.
                  </div>
                  <button style={S.btnRegen} onClick={() => regenererClasse(classeActive)}>↺ Régénérer</button>
                </div>
              )}

              <div style={{ overflowX: "auto", marginTop: 12 }}>
                <table style={{ ...S.table, minWidth: 700 }}>
                  <thead>
                    <tr>
                      <th style={{ ...S.th, width: 100, background: "#0f172a", color: "#64748b", fontSize: 10, letterSpacing: 1 }}>HORAIRE</th>
                      {JOURS.map(j => (
                        <th key={j} style={{ ...S.th, background: "#0f172a", color: "#e2e8f0", fontSize: 12 }}>{j}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CRENEAUX_DEF.map(({ id, label, pause }) => {
                      if (pause) return (
                        <tr key={id}>
                          <td colSpan={6} style={{
                            textAlign: "center", padding: "5px 0", fontSize: 10,
                            background: id === "dej" ? "#fef3c7" : "#f0fdf4",
                            color: id === "dej" ? "#92400e" : "#166534",
                            fontFamily: "sans-serif", letterSpacing: 2,
                          }}>
                            {id === "dej" ? "🍽 PAUSE DÉJEUNER (13h00–14h30)" : "☕ RÉCRÉATION"}
                          </td>
                        </tr>
                      );
                      return (
                        <tr key={id}>
                          <td style={{ ...S.td, fontSize: 10, color: "#64748b", textAlign: "center", background: "#f8fafc", fontWeight: 700, whiteSpace: "nowrap", borderRight: "2px solid #e2e8f0" }}>
                            {label}
                          </td>
                          {JOURS.map(jour => {
                            const cours = grilleActive[jour]?.[id];
                            if (!cours) return (
                              <td key={jour} style={{ ...S.td, padding: 4 }}>
                                <div style={{ height: 70, borderRadius: 6, background: "#f8fafc", border: "1px dashed #e2e8f0" }} />
                              </td>
                            );
                            const mc = MAT_META[cours.matiere] || {};
                            const hasConflict = cours.salle?.includes("⚠");
                            return (
                              <td key={jour} style={{ ...S.td, padding: 4 }}>
                                <div style={{
                                  background: mc.bg, border: `2px solid ${hasConflict ? "#ef4444" : mc.border}`,
                                  borderRadius: 8, padding: "6px 8px", height: 70,
                                  display: "flex", flexDirection: "column", justifyContent: "center",
                                  boxSizing: "border-box",
                                }}>
                                  <div style={{ fontWeight: 800, fontSize: 10, color: mc.text, marginBottom: 2 }}>
                                    {mc.icon} {cours.matiere}
                                  </div>
                                  <div style={{ fontSize: 9, color: "#475569" }}>👤 {cours.prof}</div>
                                  <div style={{ fontSize: 9, color: "#94a3b8" }}>📍 {cours.salle}</div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 28 }}>
                <h3 style={{ fontSize: 14, color: "#0f172a", marginBottom: 12, fontFamily: "sans-serif" }}>Toutes les classes</h3>
                <div style={S.statsRow}>
                  {classes.map(cl => {
                    const totalH = Object.values(SERIES[cl.serie]?.volumes || {}).reduce((a, b) => a + b, 0);
                    const nb = resultats.grilles[cl.id]?.conflits?.length || 0;
                    return (
                      <div key={cl.id} style={{ ...S.statCard, borderColor: SERIES[cl.serie]?.couleur }}
                        onClick={() => setClasseActive(cl.id)}>
                        <div style={{ color: SERIES[cl.serie]?.couleur, fontWeight: 800, fontSize: 16 }}>{cl.label}</div>
                        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>{SERIES[cl.serie]?.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{totalH}h</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>/ semaine</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{cl.effectif} élèves</div>
                        {nb > 0 && <div style={{ color: "#ef4444", fontSize: 10, marginTop: 4 }}>⚠ {nb} conflit(s)</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── COMPOSANTS UTILITAIRES ───────────────────────────────────────────────

function PanelTitle({ icon, title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
      <h2 style={{ fontSize: 20, color: "#0f172a", margin: "0 0 4px", fontFamily: "Georgia, serif", fontWeight: "normal" }}>{title}</h2>
      <p style={{ margin: 0, color: "#64748b", fontSize: 13, fontFamily: "sans-serif" }}>{sub}</p>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 180px" }}>
      <label style={{ fontSize: 10, color: "#64748b", fontFamily: "sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{label}</label>
      {children}
    </div>
  );
}

function NextBtn({ onClick }) {
  return (
    <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
      <button style={S.btnNext} onClick={onClick}>Suivant →</button>
    </div>
  );
}

function NavRow({ onBack, onNext }) {
  return (
    <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
      <button style={S.btnBack} onClick={onBack}>← Retour</button>
      <button style={S.btnNext} onClick={onNext}>Suivant →</button>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────

const S = {
  root: { minHeight: "100vh", background: "#f8fafc", fontFamily: "Georgia, serif" },
  topbar: {
    display: "none",
    "@media (max-width: 768px)": { display: "flex" },
    background: "#0f172a", padding: "12px 16px",
    alignItems: "center", justifyContent: "space-between",
    position: "sticky", top: 0, zIndex: 100,
  },
  topbarLogo: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: {
    width: 34, height: 34, borderRadius: 8,
    background: "linear-gradient(135deg, #16a34a, #0891b2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 900, fontSize: 12, color: "white",
  },
  logoTitle: { fontWeight: 800, fontSize: 13, color: "#f8fafc" },
  logoSub: { fontSize: 9, color: "#64748b", letterSpacing: 1 },
  menuBtn: {
    background: "#1e293b", color: "#94a3b8", border: "none",
    borderRadius: 6, padding: "6px 10px", fontSize: 18, cursor: "pointer",
  },
  mobileMenu: {
    background: "#0f172a", padding: "8px 12px 16px",
    display: "flex", flexDirection: "column", gap: 4,
    borderBottom: "1px solid #1e293b",
  },
  mobileMenuItem: {
    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
    borderRadius: 8, border: "none", background: "transparent",
    color: "#94a3b8", cursor: "pointer", fontSize: 14, fontFamily: "sans-serif", textAlign: "left",
  },
  mobileMenuActive: { background: "#1e293b", color: "#f1f5f9" },
  mobileMenuNum: {
    width: 22, height: 22, borderRadius: "50%", background: "#334155",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#94a3b8",
  },
  mobileStats: { color: "#475569", fontSize: 11, padding: "8px 12px", fontFamily: "sans-serif" },
  layout: { display: "flex", minHeight: "100vh" },
  sidebar: {
    width: 210, background: "#0f172a", display: "flex",
    flexDirection: "column", padding: "20px 0", flexShrink: 0,
    position: "sticky", top: 0, height: "100vh",
  },
  sidebarLogo: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "0 18px 20px", borderBottom: "1px solid #1e293b", marginBottom: 12,
  },
  nav: { display: "flex", flexDirection: "column", gap: 2, padding: "0 8px", flex: 1 },
  navItem: {
    display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
    borderRadius: 8, border: "none", background: "transparent",
    color: "#64748b", cursor: "pointer", fontSize: 13, fontFamily: "sans-serif", textAlign: "left",
  },
  navActive: { background: "#1e293b", color: "#f1f5f9" },
  navNum: {
    width: 20, height: 20, borderRadius: "50%", background: "#1e293b",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#64748b",
  },
  navNumActive: { background: "#16a34a", color: "white" },
  badge: {
    marginLeft: "auto", background: "#ef4444", color: "white",
    borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700,
  },
  sidebarFooter: { padding: "14px 18px", borderTop: "1px solid #1e293b", fontFamily: "sans-serif" },
  statLine: { fontSize: 12, color: "#475569", marginBottom: 4, display: "flex", gap: 6, alignItems: "center" },
  statVal: { color: "#94a3b8", fontWeight: 700 },
  main: { flex: 1, padding: "28px 24px", overflowY: "auto" },
  panel: { maxWidth: 900, margin: "0 auto" },
  formGrid: { display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 16 },
  formRow: { display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  input: {
    border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "9px 12px",
    fontSize: 14, fontFamily: "sans-serif", color: "#0f172a", background: "white",
    outline: "none", width: "100%",
  },
  select: {
    border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "9px 12px",
    fontSize: 14, fontFamily: "sans-serif", color: "#0f172a", background: "white",
    outline: "none", cursor: "pointer", width: "100%",
  },
  tableCard: {
    background: "white", borderRadius: 12, overflow: "hidden",
    boxShadow: "0 1px 10px rgba(0,0,0,0.06)", marginBottom: 16, overflowX: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse", fontFamily: "sans-serif" },
  th: { padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f8fafc", borderBottom: "2px solid #f1f5f9", letterSpacing: 0.5 },
  tr: { borderBottom: "1px solid #f8fafc" },
  td: { padding: "9px 12px", fontSize: 13, color: "#334155", verticalAlign: "middle" },
  seriePill: { padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontSize: 12 },
  matPill: {
    display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px",
    borderRadius: 20, border: "1.5px solid", fontSize: 12, fontWeight: 600,
  },
  addBlock: {
    background: "white", borderRadius: 12, padding: 16,
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)", marginBottom: 8,
  },
  btnAdd: {
    background: "#16a34a", color: "white", border: "none", borderRadius: 8,
    padding: "10px 18px", fontSize: 13, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 700,
  },
  btnDel: {
    background: "#fee2e2", color: "#dc2626", border: "none",
    borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer",
  },
  btnNext: {
    background: "linear-gradient(135deg, #16a34a, #0891b2)", color: "white",
    border: "none", borderRadius: 9, padding: "12px 28px", fontSize: 14,
    cursor: "pointer", fontFamily: "sans-serif", fontWeight: 700,
  },
  btnBack: {
    background: "white", color: "#475569", border: "1.5px solid #e2e8f0",
    borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer", fontFamily: "sans-serif",
  },
  btnGenerer: {
    background: "linear-gradient(135deg, #16a34a, #0891b2)", color: "white",
    border: "none", borderRadius: 9, padding: "12px 22px", fontSize: 14,
    cursor: "pointer", fontFamily: "sans-serif", fontWeight: 700,
  },
  btnRegen: {
    background: "white", color: "#0891b2", border: "1.5px solid #0891b2",
    borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 700,
  },
  matGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  matCard: {
    border: "2px solid", borderRadius: 10, padding: "10px 8px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
    minWidth: 80, textAlign: "center",
  },
  sallesGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  salleCard: {
    display: "flex", alignItems: "center", gap: 8, background: "white",
    border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "8px 12px",
  },
  salleX: { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 },
  resHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 },
  lyceeName: { fontSize: 18, color: "#0f172a", marginBottom: 2 },
  lyceeInfo: { fontSize: 12, color: "#64748b", fontFamily: "sans-serif" },
  alertBox: {
    background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10,
    padding: "12px 16px", marginBottom: 14, fontFamily: "sans-serif", fontSize: 13, color: "#7f1d1d",
  },
  conflitPill: {
    background: "#fee2e2", color: "#b91c1c", borderRadius: 20,
    padding: "2px 10px", fontSize: 10, fontFamily: "sans-serif",
  },
  classesTabs: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 },
  classeTab: {
    border: "2px solid #e2e8f0", borderRadius: 8, padding: "7px 14px",
    fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 700,
    background: "white", color: "#334155", display: "flex", alignItems: "center",
  },
  classeInfoBar: {
    background: "white", borderRadius: 10, padding: "10px 14px",
    boxShadow: "0 1px 8px rgba(0,0,0,0.06)", marginBottom: 12,
    display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
  },
  statsRow: { display: "flex", flexWrap: "wrap", gap: 10 },
  statCard: {
    background: "white", borderRadius: 12, border: "2px solid",
    padding: "14px 16px", flex: "1 1 110px", textAlign: "center",
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)", fontFamily: "sans-serif", cursor: "pointer",
  },
};
