export default function PdfViewer({ pdf }) {
  const pdfUrl = URL.createObjectURL(pdf);
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  if (isMobile) {
    return (
      <div>
        <h3>📄 Aperçu du PDF</h3>
        <p style={{ opacity: 0.8 }}>
          L’aperçu n’est pas disponible sur mobile.
        </p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="primary"
          style={{ display: "inline-block", marginTop: "1rem" }}
        >
          📄 Ouvrir le PDF
        </a>
      </div>
    );
  }

  return (
    <div>
      <h3>📄 Aperçu du PDF</h3>
      <iframe
        src={pdfUrl}
        className="pdf-viewer"
        title="Aperçu PDF"
      />
    </div>
  );
}
