# African Pride

Site du concours African Pride — inscription Miss/Master avec photo, vote public
payant (100 FCFA/vote), classement en direct, et un espace admin pour définir la
durée du concours.

## Stack

- **Frontend** : React + Vite (dossier `src/`)
- **Backend** : Express (dossier `server/`) — sert l'API et le site une fois buildé
- **Données** : fichier JSON local (`server/data/db.json`) — voir la note importante
  ci-dessous avant de lancer un vrai concours

## Lancer en local

```bash
npm install
npm run dev
```

Ça démarre le serveur Express (port 3000) et Vite (port 5173, avec proxy vers
l'API) en même temps. Ouvre http://localhost:5173.

## Déployer sur Railway

1. Pousse ce dossier sur un dépôt GitHub.
2. Sur [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
   → sélectionne le dépôt.
3. Railway détecte Node automatiquement (via `railway.json` / Nixpacks) et lance :
   - Build : `npm install && npm run build`
   - Start : `npm start`
4. Dans **Variables**, ajoute :
   - `ADMIN_PASSWORD` → le mot de passe de l'espace `/admin` (sinon la valeur par
     défaut `africanpride2026` sera utilisée — à changer absolument)
5. Railway assigne automatiquement un domaine public (`*.up.railway.app`), ou tu
   peux brancher ton propre nom de domaine dans **Settings → Domains**.

### ⚠️ Persistance des données — important

Ce projet stocke les candidatures, votes et réglages dans un simple fichier JSON
(`server/data/db.json`) et les photos dans `server/uploads/`. C'est parfait pour
tester, mais **le système de fichiers de Railway est réinitialisé à chaque nouveau
déploiement** (nouveau push, redeploy).

Pour un vrai concours en production, deux options :

- **Rapide** : ajoute un [Volume Railway](https://docs.railway.app/reference/volumes)
  monté sur `/app/server/data` et `/app/server/uploads` — les données survivront
  aux redéploiements.
- **Recommandé à terme** : remplace le fichier JSON par une vraie base de données
  (Railway propose un addon Postgres en un clic). Les seules fonctions à changer
  sont `readDB()` / `writeDB()` dans `server/index.js`.

### 💳 Paiement — important

Le bouton "Payer et voter" enregistre bien le vote sur le serveur, mais **aucun
débit réel n'est effectué** : aucune passerelle Orange Money / MTN MoMo n'est
branchée. Pour encaisser réellement les votes :

1. Crée un compte marchand Orange Money (API Web Payment) et/ou MTN MoMo
   (Collections API).
2. Dans `server/index.js`, à l'endroit indiqué (`POST /api/candidates/:id/vote`),
   remplace l'incrémentation directe par : déclenchement du paiement via l'API du
   fournisseur, puis n'incrémente les votes qu'après confirmation réelle (via le
   webhook du fournisseur), pas juste parce que le client l'affirme.

## Espace admin

Accessible via l'onglet "Admin" du site, protégé par le mot de passe défini dans
`ADMIN_PASSWORD`. Permet de :
- Définir la date de début et de fin du concours (pilote le compte à rebours)
- Voir en direct : nombre d'inscrit·e·s, votes totaux, revenu total en FCFA

## Structure du projet

```
├── src/              → App React (pages, composants)
├── server/
│   ├── index.js       → API Express + service du site buildé
│   ├── data/db.json   → "base de données" JSON
│   └── uploads/        → photos uploadées
├── railway.json       → config de build/déploiement Railway
└── vite.config.js
```
