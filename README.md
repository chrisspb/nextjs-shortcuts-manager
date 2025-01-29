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

## Prérequis

### Installation de PostgreSQL

1. Téléchargez PostgreSQL depuis [le site officiel](https://www.postgresql.org/download/)
2. Lancez l'installateur :
   - Conservez le port par défaut (5432)
   - Définissez un mot de passe pour l'utilisateur 'postgres' et notez-le
   - Laissez les autres options par défaut

3. Une fois l'installation terminée, vous pouvez créer une base de données :
   - Ouvrez pgAdmin (installé avec PostgreSQL)
   - Connectez-vous avec les identifiants définis pendant l'installation
   - Clic droit sur 'Databases' > 'Create' > 'Database'
   - Nommez la base de données 'shortcuts_db'

## Installation

1. Clonez le repository :
```bash
git clone [url-du-repo]
cd nextjs-shortcuts-manager
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
```bash
# Copiez le fichier d'exemple
cp .env.example .env
```

4. Modifiez le fichier .env avec vos informations :
   - Pour DATABASE_URL : remplacez VOTRE_MOT_DE_PASSE par le mot de passe PostgreSQL défini à l'installation
   - Pour NEXTAUTH_SECRET : générez une clé secrète avec une des commandes suivantes :

   Sur Linux/Mac :
   ```bash
   openssl rand -base64 32
   ```
   
   Sur Windows (dans Node.js) :
   ```bash
   node -e "console.log(crypto.randomBytes(32).toString('base64'))"
   ```

   Copiez la valeur générée dans votre .env :
   ```
   NEXTAUTH_SECRET="votre-clé-générée"
   ```

5. Initialisez la base de données :
```bash
# Générez le client Prisma
npx prisma generate

# Créez les tables dans la base de données
npx prisma migrate dev --name init
```

6. Démarrez le serveur de développement :
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Création du premier utilisateur admin

1. Lancez Prisma Studio :
```bash
npx prisma studio
```

2. Accédez à [http://localhost:5555](http://localhost:5555)
3. Dans la table "User", cliquez sur "Add record"
4. Remplissez les champs :
   - email: votre@email.com
   - password: votre mot de passe (hashé avec bcrypt)
   - role: ADMIN

## Dépannage

Si vous rencontrez des problèmes de connexion à la base de données :
1. Vérifiez que PostgreSQL est en cours d'exécution
2. Vérifiez que le mot de passe dans DATABASE_URL est correct
3. Vérifiez que la base de données 'shortcuts_db' existe
4. Vérifiez que le port 5432 est bien celui utilisé par PostgreSQL

## Développement

Pour plus de détails sur la structure du projet, consultez le diagramme des cas d'utilisation dans `/docs/use-cases.md`.