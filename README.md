# 📅 PlanLycée BF — Emploi du Temps Lycée Burkina Faso

Application web PWA pour générer les emplois du temps des lycées d'enseignement général au Burkina Faso (conforme aux programmes MENA).

---

## 🚀 Déploiement sur Vercel (recommandé)

### Étapes :

1. **Créer un compte gratuit** sur [vercel.com](https://vercel.com)
2. **Créer un compte GitHub** sur [github.com](https://github.com) (si vous n'en avez pas)
3. **Créer un nouveau dépôt GitHub** et y déposer tous les fichiers du projet
4. Sur Vercel, cliquer **"New Project"** → importer le dépôt GitHub
5. Vercel détecte automatiquement que c'est un projet React
6. Cliquer **"Deploy"** — l'application sera en ligne en 2 minutes !

### Votre application sera accessible à une URL du type :
`https://planlycee-bf.vercel.app`

---

## 📱 Installer comme application sur téléphone

### Sur Android (Chrome) :
1. Ouvrir l'URL de votre application dans Chrome
2. Appuyer sur les **3 points** en haut à droite
3. Sélectionner **"Ajouter à l'écran d'accueil"**
4. L'icône apparaît comme une vraie application !

### Sur iPhone/iPad (Safari) :
1. Ouvrir l'URL dans Safari
2. Appuyer sur le bouton **Partager** (carré avec flèche)
3. Sélectionner **"Sur l'écran d'accueil"**
4. Appuyer **"Ajouter"**

---

## 🔧 Lancer en local (développement)

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start

# Ouvrir http://localhost:3000
```

## 📦 Construire pour la production

```bash
npm run build
```

---

## 📚 Fonctionnalités

- ✅ 7 séries officielles MENA (2nde, 1ère A/C/D, Tle A/C/D)
- ✅ Volumes horaires officiels par matière et par série
- ✅ Gestion des enseignants et salles
- ✅ Génération automatique avec contraintes pédagogiques
- ✅ Détection des conflits (enseignant doublement affecté, salles insuffisantes)
- ✅ Régénération par classe
- ✅ Mode impression
- ✅ Installable comme app mobile (PWA)
- ✅ Fonctionne hors ligne après la première visite

---

## 🏫 Séries supportées

| Série | Libellé | Total heures/sem. |
|-------|---------|-------------------|
| 2nde | Tronc commun | 27h |
| 1ère A | Littéraire | 31h |
| 1ère C | Scientifique | 31h |
| 1ère D | Sciences Naturelles | 30h |
| Tle A | Littéraire | 32h |
| Tle C | Scientifique | 34h |
| Tle D | Sciences Naturelles | 33h |

---

Développé pour les établissements du Burkina Faso · MENA
