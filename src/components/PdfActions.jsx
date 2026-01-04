import { useState } from "react";
import PdfViewer from "./PdfViewer";

export default function PdfActions({ pdf, pdfName }) {
  const [showViewer, setShowViewer] = useState(false);

  // Générer le nom de fichier final
  const getFileName = () => {
    const name = pdfName?.trim() || "photos";
    // Nettoyer le nom (enlever caractères spéciaux)
    const cleanName = name.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüç\s\-_]/g, "").trim();
    return `${cleanName || "photos"}.pdf`;
  };

  return (
    <>
      {/* Bouton pour ouvrir le viewer */}
      <div className="pdf-actions-container">
        <button className="primary large" onClick={() => setShowViewer(true)}>
          📖 Ouvrir le PDF
        </button>
      </div>

      {/* Viewer plein écran */}
      {showViewer && (
        <PdfViewer
          pdf={pdf}
          fileName={getFileName()}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  );
}
