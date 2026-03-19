# 🌐 invK Frontend - Application Web

Application web React + TypeScript pour la gestion de boutiques multi-tenant.

## 🚀 Démarrage Rapide

### Installation
```bash
npm install
```

### Développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Build Production
```bash
npm run build
npm run preview
```

## 📱 Pages Disponibles

### Pages Publiques
- **/** - Landing Page
- **/login** - Connexion
- **/register** - Inscription

### Dashboard Admin Général
- **/admin** - Vue d'ensemble
- **/admin/tenants** - Gestion des commerçants
- **/admin/subscriptions** - Gestion des abonnements
- **/admin/users** - Gestion des utilisateurs

### Dashboard Commerçant
- **/dashboard** - Tableau de bord
- **/dashboard/products** - Gestion des produits
- **/dashboard/sales** - Historique des ventes
- **/dashboard/stats** - Statistiques
- **/dashboard/team** - Gestion de l'équipe

### Point de Vente (Employé/Commerçant)
- **/pos** - Interface de caisse

## 🔑 Comptes de Test

**Mot de passe universel** : `Password123!`

### Admin Général
- Email : `admin@invk.sn`
- Accès : Dashboard admin

### Commerçant
- Email : `fatou@boutique.sn`
- Téléphone : `+221771234567`
- Accès : Dashboard commerçant + POS

### Employé
- Téléphone : `+221772345678`
- Accès : POS uniquement

## 🛠️ Technologies

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **React Router** - Routing
- **TanStack Query** - Gestion des données
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 📁 Structure

```
src/
├── lib/
│   └── api.ts              # Client API
├── store/
│   └── authStore.ts        # Store d'authentification
├── types/
│   └── index.ts            # Types TypeScript
├── pages/
│   ├── LandingPage.tsx     # Page d'accueil
│   ├── LoginPage.tsx       # Connexion
│   ├── RegisterPage.tsx    # Inscription
│   ├── admin/
│   │   └── AdminDashboard.tsx
│   ├── dashboard/
│   │   └── Dashboard.tsx
│   └── pos/
│       └── POSPage.tsx
├── App.tsx                 # Router principal
└── main.tsx               # Point d'entrée
```

## 🔐 Authentification

L'application utilise JWT pour l'authentification :
- Token stocké dans localStorage
- Redirection automatique selon le rôle
- Refresh token pour renouvellement

### Flux d'authentification
1. Utilisateur se connecte
2. Backend retourne accessToken + refreshToken
3. Token stocké dans Zustand + localStorage
4. Redirection selon le rôle :
   - ADMIN_GENERAL → /admin
   - ADMIN_COMMERCANT → /dashboard
   - EMPLOYE → /pos

## 🎨 Personnalisation

### Couleurs (tailwind.config.js)
```js
colors: {
  primary: {
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  }
}
```

### API URL (.env)
```
VITE_API_URL=http://localhost:3000
```

## 📦 Scripts NPM

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run preview      # Preview du build
npm run lint         # Linter ESLint
```

## 🔄 Intégration Backend

L'application communique avec le backend NestJS via l'API REST :

```typescript
// Exemple d'appel API
import { authAPI } from './lib/api';

const { data } = await authAPI.login(identifier, password);
```

Tous les endpoints sont définis dans `src/lib/api.ts`.

## 🚧 Fonctionnalités à Venir

- [ ] Gestion complète des produits (CRUD)
- [ ] Upload d'images
- [ ] Graphiques de revenus (Recharts)
- [ ] Gestion des employés
- [ ] Historique des ventes détaillé
- [ ] Rapports PDF
- [ ] Notifications en temps réel
- [ ] Mode hors ligne (PWA)
- [ ] Application mobile (React Native)

## 🐛 Dépannage

### Le backend n'est pas accessible
Vérifier que le backend tourne sur `http://localhost:3000`

### Erreur CORS
Le backend doit avoir CORS activé (déjà configuré)

### Token expiré
Le token est automatiquement rafraîchi ou l'utilisateur est déconnecté

## 📝 Notes

- L'application est responsive (mobile-first)
- Support des navigateurs modernes
- Optimisée pour les performances
- Accessible (ARIA labels)

---

**Dernière mise à jour** : 8 Mars 2026
