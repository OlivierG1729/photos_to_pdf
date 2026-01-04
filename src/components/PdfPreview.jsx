import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PdfPreview({ pdf }) {
  const containerRef = useRef(null);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    if (!pdf) return;

    let blobUrl = null;

    const renderPreview = async () => {
      try {
        containerRef.current.innerHTML = "";

        blobUrl = URL.createObjectURL(pdf);
        const loadingTask = pdfjsLib.getDocument(blobUrl);
        const pdfDoc = await loadingTask.promise;

        setPageCount(pdfDoc.numPages);

        // Afficher max 3 pages en aperçu
        const maxPages = Math.min(pdfDoc.numPages, 3);

        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 0.5 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "pdf-preview-page";

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          containerRef.current.appendChild(canvas);
        }

        if (pdfDoc.numPages > 3) {
          const moreIndicator = document.createElement("div");
          moreIndicator.className = "pdf-preview-more";
          moreIndicator.textContent = `+${pdfDoc.numPages - 3} pages`;
          containerRef.current.appendChild(moreIndicator);
        }
      } catch (err) {
        console.error("Erreur aperçu PDF:", err);
      }
    };

    renderPreview();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [pdf]);

  return (
    <div className="pdf-preview-section">
      <h3>📄 Aperçu ({pageCount} page{pageCount > 1 ? "s" : ""})</h3>
      <div className="pdf-preview-container" ref={containerRef} />
    </div>
  );
}
