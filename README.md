# Next.js Shortcuts Manager

Application de gestion de raccourcis et PDFs avec système d'authentification.

## Fonctionnalités

- Système d'authentification complet avec Next-Auth
- Gestion des raccourcis
- Gestion des PDFs
- Interface administrateur
- Interface utilisateur
- Base de données PostgreSQL avec Prisma
- Système de rôles (Admin/User)

## Installation

```bash
# Installation des dépendances
npm install

# Configuration de la base de données
npx prisma generate
npx prisma migrate dev

# Démarrage du serveur de développement
npm run dev
```

## Structure du projet

- `/components` - Composants React réutilisables
- `/pages` - Routes et pages de l'application
- `/hooks` - Hooks React personnalisés
- `/prisma` - Schéma et migrations de la base de données
- `/public` - Fichiers statiques et uploads
