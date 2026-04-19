# 🎓 Guide Complet : Projet de Gestion des Soutenances

---

## 1. 📌 Introduction

### Présentation du projet
Ce projet est une application web moderne développée pour faciliter la gestion administrative et pédagogique des soutenances. Il vise à numériser la création de comptes, la définition des rôles (Étudiant vs Jury) et la gestion des notes de soutenance dans des espaces de travail cloisonnés.

### Objectif de l’application
L'application permet d'une part aux étudiants de consulter les informations concernant leur soutenance (date, salle, encadrant) et les notes attribuées par le jury. D'autre part, elle permet aux membres du jury de répertorier l'ensemble des soutenances assignées, et d'utiliser un formulaire pour noter les étudiants et laisser des commentaires.

### Technologies utilisées
L'application se repose sur une architecture robuste et séparée en deux parties (Frontend / Backend) :
- **Frontend** : React.js (via Vite) pour une Single Page Application réactive.
- **Backend** : Spring Boot pour un cœur de métier sécurisé et performant.
- **Base de données** : MySQL (base nommée `soutenance`) pour stocker de façon persistante et saine les utilisateurs, les soutenances et les notes.

---

## 2. ⚙️ Partie Backend (Spring Boot)

Le backend est l'épine dorsale du projet. Il stocke les données, opère les vérifications métier et fournit des ressources (API) au client frontend.

### Description de l'architecture
L'architecture adoptée est celle d'un modèle multicouche (N-Tier), visant à séparer clairement les responsabilités dans différents *packages* :
- **`controller/`** : C'est la couche d'exposition. Elle reçoit les requêtes HTTP (POST, GET), pilote l'exécution via les autres couches, puis renvoie la réponse (JSON).
- **`repository/`** : Couche d'accès aux données (DAO). Elle utilise *Spring Data JPA* pour communiquer de façon abstraite avec la base MySQL.
- **`dto/`** (Data Transfer Object) : Définit les objets qui lient les requêtes Frontend aux données attendues sans y lier des règles métiers directement.
- **`model/` (ou `entity/`)** : Contient les objets mappés à la base de données.
- **`config/`** : Pour gérer la configuration, notamment les paramètres de sécurité et du réseau (CORS).

### Explication des API principales
- `POST /api/auth/register` : Capture les informations du formulaire frontend (Nom, Email, Mot de passe, Rôle). Le mot de passe est directement passé au chiffrement **BCrypt** avant son stockage en base pour garantir la sécurité.
- `POST /api/auth/login` : Vérifie les accès, puis si l'email et le mot de passe correspondent, authentifie l'utilisateur via une création de Session Active.
- `GET /api/auth/me` : Utilisé au chargement de chaque page afin de vérifier que l'utilisateur détient encore une session authentifiée et active sur le système.

### Gestion de la Session & Base de données
- **La Session** : Nous avons opté pour une approche classique `HttpSession`. Il n'y a pas de jeton complexe côté client (ex: JWT) : le backend crée un identifiant, le stocke dans le serveur et donne un cookie (`JSESSIONID`) au navigateur. À chaque appel API, Spring Boot vérifie les informations en session (qui contiennent l'objet *User* courant).
- **La Base de données** : L'URL se connecte en local `jdbc:mysql://localhost:3306/soutenance?createDatabaseIfNotExist=true`. Cette configuration assure la génération immédiate des structures (Tables) sans interventions depuis MySQL.

### Explication des Entités (MySQL)
1. **User** : `id, nom, email, password, role`. Stocke l'identité complète. L'email est mis en contrainte unique (`unique=true`).
2. **Soutenance** : `id, date, salle, encadrant, etudiant_id`. Relie une date d'examen à un étudiant précis (clé étrangère `User`).
3. **Note** : `id, note, commentaire, soutenance_id, jury_id`. Représente la note physique posée par un membre jury attitré lors de la soutenance.

---

## 3. ⚛️ Partie Frontend (React)

### Structure du projet
- **`src/pages/`** : Contient l'intégralité des Vues complètes (ex: Login, Signup, ou encore nos 2 Dashboards).
- **`src/api/` (ou `services/`)** : Regroupe la logique de connexion avec le Backend (configuration de l'outil *Axios*).
- **`src/App.jsx`** : Chef d'orchestre chargé de pointer quel composant afficher selon l'URL de la page.

### Explication des pages (Views)
- **Login & Signup** : Formulantes d’arrivée qui interceptent les variables (State) pour les envoyer en base de données. Si le processus aboutit, l'utilisateur est redirigé selon son rôle récupéré en réponse.
- **Dashboard Étudiant** : Composé d'une barre latérale (Sidebar) dynamique et de cartes d'informations. Permet de consulter l'information en lecture seule (Ma soutenance, Mes notes avec génération automatique de la moyenne).
- **Dashboard Jury** : Inclut en plus des fonctionnalités d'écriture. Il affiche toutes les soutenances dans un tableau interactif, et un formulaire permettant au jury d'insérer une note et son commentaire associé.

### Routage
La navigation (`React Router`) permet un basculement de page instantané sans que le navigateur ait besoin de recharger. Un utilisateur non authentifié se dirigera toujours inévitablement vers la page `/login`.

---

## 4. 🔗 Communication Frontend ↔ Backend

### Fonctionnement Global
L'application client React (tournant sur le port 5173) communique avec le serveur Spring (tournant sur le port 9006) en échangeant du format JSON via le module **Axios**.

### Gestion des sessions et de l'objet Request
L'enjeu consistait à utiliser un système de Session (Cookie) malgré la présence de deux domaines différents (ports différents).
- **`withCredentials: true`** : Ce paramètre présent de manière globale dans notre instance Axios permet d'informer notre Client qu'il doit accepter et renvoyer le cookie magique (`JSESSIONID`) à notre Backend pour valider et se souvenir de qui l'on est de page en page. Sans cela, Spring Boot bloquerait l'accès sous un code 401 ou 403 (Unauthorized).
- **CORS Côté Backend** : Le fichier *CorsConfig* de Spring a été conçu pour spécifiquement accorder les droits d'écriture en session à l'URL `http://localhost:5173`, car les navigateurs bloquent sinon le partage de cookies entre domaines pour des raisons de sécurité.

---

## 5. 🎨 Partie CSS / Design

Le design a été conçu pour donner la sensation d'une application ultra-moderne, professionnelle et réactive.
- **Framework utilisé** : `Tailwind CSS`. Contrairement au CSS classique qui implique un fichier stylistique lourd à structurer, ce cadriciel injecte de petites classes descriptives directement intégrées dans le HTML.
- **Organisation** : Nous utilisons des "Shadows" (ombres douces) et des "Gradients" de fond pour faire de jolis effets d'interface et d'interaction (Boutons rebondissants au clic, colorations intenses au survol).
- **Responsive & Architecture UI** : L'utilisation large du système **Flexbox** et **Grids** permet au Dashboard d'adapter la largeur de la navigation et des blocs selon l'écran.

---

## 6. 📊 Fonctionnement des Dashboards

La valeur ajoutée majeure de l'application est la dualité des espaces. 
- Tout repose sur **le Rôle** :
  - **L'Étudiant** a un accès passif. Il arrive sur un Dashboard teinté de couleurs chaudes (Orange, Rose). Les pages affichent l'état d'assignement de sa propre soutenance et il bénéficie d'un calcul automatique en temps réel de ses notes (pour avoir une mention précise : Bien, Très bien, etc.).
  - **Le Jury** possède un espace d'encadrement actif, de couleur studieuse et sobre (Émeraude, Slate transparent). Il bénéficie d'un tableau récapitulatif listant l'intégralité des dates, de l'étudiant à évaluer, et dispose d'un espace de saisie contrôlé (note sur 20) qu'il renvoie dans la base pour consolider le bulletin de l'étudiant.

---

## 7. 🚀 Conclusion

### Résumé Global
À travers ce projet, nous avons pu ériger de bout-en-bout un écosystème Full-Stack où la structuration, le stockage et la sécurité des données ont été déléguées aux classes robustes de l'écosystème Java/Spring Boot. En face, React orchestre de magnifiques interfaces permettant d'exploiter efficacement lesdites données.

### Points Forts
- L'Authentification est solidifiée (les accès au code source MVC par des utilisateurs malveillant sont protégés).
- Chiffrement du mot de passe irréversible au format **BCrypt**.
- Les Dashboard sont fonctionnels, dynamiques, ergonomiques et distincts visuellement. 

### Améliorations futures
Pour aller plus loin, le projet peut faire l'objet des évolutions suivantes :
- Remplacer temporairement l'authentification `Session` au profit d'une sécurité `JWT` complète.
- Rajouter un rôle *Admin* chargé de créer, manuellement, les salles de soutenances et modifier les encadrants.
- Exporter les notes et la mention dans un module PDF téléchargeable pour l'étudiant.
