import { useState } from "react";

import ImageDropzone from "./components/ImageDropzone";
import ImageSorter from "./components/ImageSorter";
import PdfViewer from "./components/PdfViewer";
import PdfActions from "./components/PdfActions";

import { generatePdf } from "./services/api";

import "./styles.css";

function App() {
  const [images, setImages] = useState([]);
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGeneratePdf = async () => {
    if (images.length === 0) return;

    setLoading(true);
    try {
      const pdfBlob = await generatePdf(images);
      setPdf(pdfBlob);
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
  };

  return (
    <div className="container">
      {/* Header centré */}
      <header className="header">
        <h1>📸 Photos → PDF</h1>
        <p className="header-subtitle">
          Convertissez vos images en un PDF propre, en quelques secondes
        </p>
      </header>

      {/* Étape 1 : ajout des images */}
      <div className="card">
        <ImageDropzone setImages={setImages} />

        {images.length > 0 && (
          <ImageSorter images={images} setImages={setImages} />
        )}
      </div>

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

      {/* Étape 2 : aperçu + téléchargement */}
      {pdf && (
        <div className="card">
          <PdfViewer pdf={pdf} />
          <PdfActions pdf={pdf} />
        </div>
      )}

      {/* Bouton reset */}
      {(images.length > 0 || pdf) && (
        <button className="danger" onClick={handleReset}>
          🧹 Tout effacer
        </button>
      )}
    </div>
  );
}

export default App;
