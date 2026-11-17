# 🌾 AgriFlow Backend API

> **Plateforme B2B de mise en relation directe, d'agrégation d'offres et de négociation de récoltes agricoles au Bénin et en Afrique de l'Ouest.**

---

## 🚀 Présentation du Projet

AgriFlow est une plateforme numérique structurée en **Monolithe Modulaire** sous **NestJS**, conçue pour fluidifier et fiabiliser la chaîne d'approvisionnement agricole entre producteurs, coopératives, acheteurs institutionnels, industriels et grossistes.

### Fonctionnalités Clés

* **🔐 Authentification Multi-Rôles Cumulatifs** : Rôles simultanés (`PRODUCER`, `BUYER`, `ORGANIZATION_OWNER`, `ORGANIZATION_MANAGER`, `ADMIN`).
* **📱 Double Flux de Vérification (OTP)** : Envoi d'OTP par SMS / Email réel (SMTP Gmail avec `nodemailer`) et passage au niveau KYC 1 lors de la validation.
* **🏢 Organisations, Coopératives & Exploitations** : Gestion des entités juridiques, invitations de membres avec contrôle d'accès (RBAC) et prévisions de récoltes par parcelle.
* **📍 Localités & Territoires Béninois** : Couverture géographique des 12 départements, communes et principaux hubs agricoles (Bohicon, Dantokpa, Parakou, Malanville, Glazoué, Allada, Djougou).
* **📦 Catalogue & Fiches Techniques** : Produits agricoles standardisés, unités de mesure homologuées (sac 50kg, 100kg, tonne, kg, etc.) et catégories.
* **☁️ Gestion des Médias (Cloudinary)** : Signature directe sécurisée côté client pour les photos de récoltes et documents KYC.
* **⚖️ Négociation & Offres Commerciales** : Négociation itérative avec historique des contre-propositions.
* **🛒 Réservation de Stock Atomique & Commandes** : Verrous pessimistes PostgreSQL empêchant les surventes lors de la confirmation d'offres.
* **🚚 Suivi Logistique & Livraisons** : Expédition, bordereaux de livraison et confirmation de pesée/réception conforme.
* **💬 Messagerie & Chat contextuel** : Conversations directes liées aux annonces, offres et commandes.
* **⭐ Notations, Avis & Médiation** : Système d'évaluation post-transaction et résolution administrative des litiges.
* **🛡️ Administration & Audit** : Dashboard KPIs temps réel et journal d'audit immuable des opérations sensibles.

---

## 🛠️ Stack Technique

* **Framework** : [NestJS](https://nestjs.com/) (TypeScript)
* **Base de données** : PostgreSQL avec [TypeORM](https://typeorm.io/)
* **Files d'attente & Cache** : Redis & BullMQ
* **Documentation API** : OpenAPI / Swagger UI
* **Mailing** : Nodemailer (SMTP)
* **Stockage média** : Cloudinary (Direct Signed Upload)
* **Validation & Sécurité** : `class-validator`, `class-transformer`, `helmet`, `bcryptjs`, JWT Access/Refresh tokens

---

## ⚙️ Installation & Démarrage

### 1. Cloner le projet & installer les dépendances
```bash
git clone https://github.com/diane-prog/agri-flow.git
cd agri-flow
pnpm install
```

### 2. Configuration d'environnement
Créez un fichier `.env` à la racine à partir du modèle :
```bash
cp .env.example .env
```
Renseignez les variables (`DB_*`, `JWT_*`, `MAIL_*`, `CLOUDINARY_*`).

### 3. Compiler et lancer l'application
```bash
# Mode développement avec rechargement automatique
pnpm run start:dev

# Mode production
pnpm run build
pnpm run start:prod
```

---

## 📖 Documentation Interactive Swagger

La documentation complète de l'API est accessible dès le lancement :
* **URL** : `http://localhost:3000/docs`
* **Sécurité HTTP Basic** :
  * Nom d'utilisateur : `agriflow`
  * Mot de passe : `agriflow` (ou configuré via `SWAGGER_PASSWORD`)
* **Autorisation JWT** : Cliquez sur **Authorize** et fournissez le header `Bearer <accessToken>`.

---

## 🧪 Tests

```bash
# Tests unitaires
pnpm run test

# Tests avec couverture
pnpm run test:cov
```

---

## 📄 Licence
Ce projet est développé dans le cadre du projet AgriFlow. Tous droits réservés.
