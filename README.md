# 📸 Photos → PDF

Application web pour convertir vos photos en PDF, directement depuis votre navigateur.

## ✨ Fonctionnalités

- **Import de photos** : glisser-déposer ou sélection de fichiers
- **Prise de photo** : utilisez directement l'appareil photo de votre téléphone
- **Édition d'image** : rotation, recadrage, luminosité, contraste
- **Réorganisation** : glissez les miniatures pour changer l'ordre des pages
- **Nom personnalisé** : renommez votre PDF avant de le télécharger
- **100% local** : tout est traité dans votre navigateur, aucune donnée envoyée

## 🚀 Installation

```bash
npm install
npm run dev
```

## 📦 Déploiement

```bash
npm run build
vercel --prod
```

## 🛠️ Technologies

- React + Vite
- pdf-lib (génération PDF côté client)
- pdfjs-dist (aperçu PDF)
- @dnd-kit (drag & drop)

## 📱 Compatibilité

Fonctionne sur desktop et mobile (Chrome, Safari, Firefox, Samsung Internet).

## 📄 Licence

Projet personnel – usage libre.
