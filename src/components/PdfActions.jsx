export default function PdfActions({ pdf }) {
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  const pdfUrl = URL.createObjectURL(pdf);

  const handleOpen = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `photos-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
  };

  const handleShare = async () => {
    if (!navigator.share) return;

    try {
      const file = new File(
        [pdf],
        `photos-${Date.now()}.pdf`,
        { type: "application/pdf" }
      );

      await navigator.share({
        files: [file],
        title: "Photos → PDF",
      });
    } catch (err) {
      console.log("Partage annulé ou non supporté");
    }
  };

  return (
    <div className="pdf-actions">
      {/* 📱 MOBILE : un seul bouton */}
      {isMobile && (
        <button className="primary" onClick={handleOpen}>
          📄 Ouvrir le PDF
        </button>
      )}

      {/* 🖥 DESKTOP */}
      {!isMobile && (
        <>
          <button className="primary" onClick={handleDownload}>
            💾 Télécharger le PDF
          </button>

          {navigator.share && (
            <button className="success" onClick={handleShare}>
              📤 Partager
            </button>
          )}
        </>
      )}
    </div>
  );
}
