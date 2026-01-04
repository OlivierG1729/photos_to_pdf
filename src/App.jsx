import { useState } from "react";

import ImageDropzone from "./components/ImageDropzone";
import CameraCapture from "./components/CameraCapture";
import ImageSorter from "./components/ImageSorter";
import ImageEditor from "./components/ImageEditor";
import PdfPreview from "./components/PdfPreview";
import PdfActions from "./components/PdfActions";

import { generatePdf } from "./services/api";

import "./styles.css";

function App() {
  // Onglet actif : "import" ou "camera"
  const [activeTab, setActiveTab] = useState("import");

  // Images (communes aux deux modes)
  const [images, setImages] = useState([]);

  // Éditeur d'image
  const [editingIndex, setEditingIndex] = useState(null);

  // PDF
  const [pdf, setPdf] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGeneratePdf = async () => {
    if (images.length === 0) return;

    setLoading(true);
    try {
      const pdfBlob = await generatePdf(images);
      setPdf(pdfBlob);
      // Nom par défaut
      setPdfName(`photos-${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImages([]);
    setPdf(null);
    setPdfName("");
    setEditingIndex(null);
  };

  // Ouvrir l'éditeur pour une image
  const handleEditImage = (index) => {
    setEditingIndex(index);
  };

  // Sauvegarder l'image éditée
  const handleSaveEditedImage = (editedFile) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[editingIndex] = editedFile;
      return newImages;
    });
    setEditingIndex(null);
  };

  // Fermer l'éditeur
  const handleCloseEditor = () => {
    setEditingIndex(null);
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1>📸 Photos → PDF</h1>
        <p className="header-subtitle">
          Convertissez vos images en un PDF propre, en quelques secondes
        </p>
      </header>

      {/* Onglets */}
      {!pdf && (
        <div className="tabs">
          <button
            className={`tab ${activeTab === "import" ? "active" : ""}`}
            onClick={() => setActiveTab("import")}
          >
            📂 Import
          </button>
          <button
            className={`tab ${activeTab === "camera" ? "active" : ""}`}
            onClick={() => setActiveTab("camera")}
          >
            📷 Caméra
          </button>
        </div>
      )}

      {/* Contenu selon l'onglet */}
      {!pdf && (
        <div className="card">
          {activeTab === "import" ? (
            <ImageDropzone setImages={setImages} />
          ) : (
            <CameraCapture setImages={setImages} />
          )}

          {images.length > 0 && (
            <ImageSorter
              images={images}
              setImages={setImages}
              onEditImage={handleEditImage}
            />
          )}
        </div>
      )}

      {/* Bouton génération */}
      {images.length > 0 && !pdf && (
        <button
          className="primary"
          onClick={handleGeneratePdf}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Génération en cours…
            </>
          ) : (
            "📄 Générer le PDF"
          )}
        </button>
      )}

      {/* PDF généré */}
      {pdf && (
        <div className="card">
          {/* Champ pour renommer */}
          <div className="pdf-rename">
            <label htmlFor="pdf-name">📝 Nom du PDF :</label>
            <input
              id="pdf-name"
              type="text"
              value={pdfName}
              onChange={(e) => setPdfName(e.target.value)}
              placeholder="Mon document"
            />
            <span className="pdf-ext">.pdf</span>
          </div>

          <PdfPreview pdf={pdf} />
          <PdfActions pdf={pdf} pdfName={pdfName} />
        </div>
      )}

      {/* Bouton reset */}
      {(images.length > 0 || pdf) && (
        <button className="danger" onClick={handleReset}>
          🧹 Tout effacer
        </button>
      )}

      {/* Éditeur d'image (modal plein écran) */}
      {editingIndex !== null && images[editingIndex] && (
        <ImageEditor
          image={images[editingIndex]}
          onSave={handleSaveEditedImage}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
}

export default App;
