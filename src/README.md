# 📸 Photos → PDF

Application web simple et rapide permettant de convertir plusieurs images (JPG, PNG) en un **PDF propre**, directement depuis le navigateur.

👉 Fonctionne sur **PC et smartphone**  
👉 Aucune donnée n’est stockée : tout est traité à la volée

---

## ✨ Fonctionnalités

- 📂 Ajout d’images par clic ou glisser-déposer
- 🔀 Réorganisation de l’ordre des pages
- 📄 Génération automatique d’un PDF
- 👀 Aperçu du PDF (desktop)
- 💾 Téléchargement du PDF
- 📤 Partage du PDF (mobile compatible)
- 🌙 Interface moderne en thème sombre
- 📱 Responsive (PC & mobile)

---

## 🛠️ Technologies utilisées

- **Frontend** : React + Vite
- **Backend** : API Node.js (Vercel Functions)
- **PDF** : pdf-lib
- **Upload** : react-dropzone
- **Déploiement** : Vercel

---

## 🚀 Lancer le projet en local

### 1️⃣ Installer les dépendances
```bash
npm install
```

### 2️⃣ Lancer le frontend
```bash
npm run dev
```

### 3️⃣ Tester l’API serverless
```bash
vercel dev
```

---

## 🌐 Déploiement sur Vercel

```bash
vercel --prod
```

---

## 📁 Structure du projet

```
.
├── api/
│   └── pdf.js
├── src/
│   ├── components/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
├── styles.css
├── vite.config.js
├── vercel.json
└── README.md
```

---

## 🔐 Confidentialité

- Aucune image stockée
- Traitement temporaire uniquement
- Aucun tracking

---

## 📄 Licence

Projet personnel – usage libre.
