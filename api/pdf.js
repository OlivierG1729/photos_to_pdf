import { PDFDocument } from "pdf-lib";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  try {
    const { images } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({ error: "Aucune image reçue" });
    }

    const pdfDoc = await PDFDocument.create();

    for (const img of images) {
      const imageBytes = Buffer.from(img.data, "base64");

      let embeddedImage;
      if (img.type === "image/png") {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } else {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      }

      const page = pdfDoc.addPage([
        embeddedImage.width,
        embeddedImage.height,
      ]);

      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: embeddedImage.width,
        height: embeddedImage.height,
      });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=photos.pdf");

    return res.status(200).send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("PDF ERROR:", err);
    return res.status(500).json({ error: "Erreur génération PDF" });
  }
}
