# Application Mobile Pharmacie Siloé

Application mobile de gestion des commandes et factures pour la Pharmacie Siloé.

## 📱 Fonctionnalités

- Gestion des commandes clients
- Génération de factures au format PDF
- Stockage local des données
- Interface utilisateur intuitive et réactive
- Compatible Android et iOS

## 🚀 Installation

1. **Prérequis**
   - Node.js (version 16 ou supérieure)
   - npm ou yarn
   - Expo CLI (installé globalement)

2. **Cloner le dépôt**
   ```bash
   git clone https://github.com/Jojo-onedev/pharmaciesiloe.git
   cd pharmaciesiloe
   ```

3. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   ```

4. **Lancer l'application**
   ```bash
   npx expo start
   ```

## 📝 Utilisation

1. **Démarrer l'application**
   - Sur un appareil physique : Scannez le QR code avec l'application Expo Go
   - Sur émulateur : Appuyez sur 'i' pour iOS ou 'a' pour Android

2. **Fonctionnalités principales**
   - Consultation des commandes
   - Génération et partage de factures
   - Gestion des stocks
   - Suivi des ventes

## 📁 Structure du projet

```
pharmaciesiloe/
├── app/                 # Fichiers de l'application
│   ├── (tabs)/          # Écrans principaux
│   ├── components/      # Composants réutilisables
│   └── context/         # Contexte global
├── assets/             # Images et polices
├── services/           # Services et logique métier
└── types/              # Définitions TypeScript
```

## 🛠 Technologies utilisées

- [Expo](https://expo.dev/) - Cadre de développement multiplateforme
- [React Native](https://reactnative.dev/) - Bibliothèque pour applications mobiles
- [TypeScript](https://www.typescriptlang.org/) - Typage statique pour JavaScript
- [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/) - Gestion des fichiers
- [Expo Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/) - Partage de fichiers

## 📄 Licence

Ce projet est sous licence [MIT].
