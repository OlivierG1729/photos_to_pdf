export default function PdfActions({ pdf }) {
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  const handleDownload = () => {
    const url = URL.createObjectURL(pdf);

    const link = document.createElement("a");
    link.href = url;
    link.download = `photos-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // on laisse un petit délai avant revoke pour éviter les bugs mobiles
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleShare = async () => {
    if (!navigator.share) {
      alert("Le partage n'est pas supporté sur ce navigateur.");
      return;
    }

    try {
      const file = new File(
        [pdf],
        `photos-${Date.now()}.pdf`,
        { type: "application/pdf" }
      );

      await navigator.share({
        files: [file],
        title: "Photos → PDF",
        text: "Voici le PDF généré à partir de mes photos",
      });
    } catch (err) {
      // Annulation utilisateur = comportement normal
      console.log("Partage annulé ou non autorisé");
    }
  };

  return (
    <div className="pdf-actions">
      <button className="primary" onClick={handleDownload}>
        💾 Télécharger le PDF
      </button>

      {/* Le partage est affiché uniquement si le navigateur le supporte */}
      {navigator.share && (
        <button className="success" onClick={handleShare}>
          📤 Partager
        </button>
      )}

      {/* Message informatif uniquement sur mobile */}
      {isMobile && !navigator.share && (
        <p style={{ marginTop: "0.75rem", opacity: 0.7, fontSize: "0.85rem" }}>
          ℹ️ Le partage n’est pas disponible sur ce navigateur mobile.
        </p>
      )}
    </div>
  );
}
