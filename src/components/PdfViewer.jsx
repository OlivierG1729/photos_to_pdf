import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PdfViewer({ pdf, fileName, onClose }) {
  const containerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);

  const [blobUrl, setBlobUrl] = useState(null);

  // Créer le fichier avec le nom actuel (se met à jour quand fileName change)
  const pdfFile = useMemo(() => {
    if (!pdf) return null;
    return new File([pdf], fileName, { type: "application/pdf" });
  }, [pdf, fileName]);

  // Charger le PDF
  useEffect(() => {
    if (!pdf) return;

    let url = null;

    const loadPdf = async () => {
      try {
        setLoading(true);

        url = URL.createObjectURL(pdf);
        setBlobUrl(url);

        const loadingTask = pdfjsLib.getDocument(url);
        const doc = await loadingTask.promise;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error("Erreur chargement PDF:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [pdf]);

  // Rendre la page courante
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !containerRef.current) return;

    try {
      const page = await pdfDoc.getPage(currentPage);

      const containerWidth = window.innerWidth - 32;
      const viewport = page.getViewport({ scale: 1 });
      const fitScale = Math.min(containerWidth / viewport.width, 1.5);
      const finalScale = fitScale * scale;

      const scaledViewport = page.getViewport({ scale: finalScale });

      let canvas = containerRef.current.querySelector("canvas");
      if (!canvas) {
        canvas = document.createElement("canvas");
        containerRef.current.appendChild(canvas);
      }

      const context = canvas.getContext("2d");
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      canvas.style.maxWidth = "100%";

      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
      }).promise;
    } catch (err) {
      console.error("Erreur rendu:", err);
    }
  }, [pdfDoc, currentPage, scale]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Navigation
  const prevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const nextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  // Zoom
  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 2.5));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));

  // Télécharger
  const handleDownload = () => {
    if (!pdfFile) return;

    const downloadUrl = URL.createObjectURL(pdfFile);
    
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  };

  if (loading) {
    return (
      <div className="pdf-fullscreen">
        <div className="pdf-loading">
          <span className="spinner"></span>
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-fullscreen">
      {/* Header */}
      <div className="pdf-header">
        <button className="pdf-close-btn" onClick={onClose}>
          ✕
        </button>
        <span className="pdf-title">
          Page {currentPage} / {totalPages}
        </span>
        <div className="pdf-zoom">
          <button onClick={zoomOut}>−</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn}>+</button>
        </div>
      </div>

      {/* Nom du fichier */}
      <div className="pdf-filename">📄 {fileName}</div>

      {/* Contenu PDF */}
      <div className="pdf-content" ref={containerRef} />

      {/* Navigation pages */}
      {totalPages > 1 && (
        <div className="pdf-nav">
          <button onClick={prevPage} disabled={currentPage <= 1}>
            ◀ Préc.
          </button>
          <button onClick={nextPage} disabled={currentPage >= totalPages}>
            Suiv. ▶
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="pdf-bottom-actions">
        <button className="pdf-action-btn primary" onClick={handleDownload}>
          💾 Télécharger le PDF
        </button>
      </div>
    </div>
  );
}
