import { PDFDocument } from "pdf-lib";

// Convertir une image File en JPEG via canvas
function convertToJpeg(file, maxSize = 2048, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Redimensionner si trop grand
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve({ blob, width, height });
          } else {
            reject(new Error("Échec conversion image"));
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Impossible de charger: ${file.name}`));
    };

    img.src = url;
  });
}

// Convertir Blob en ArrayBuffer
function blobToArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

// Générer le PDF entièrement côté client (pas besoin d'API !)
export async function generatePdf(images) {
  const pdfDoc = await PDFDocument.create();

  for (const file of images) {
    try {
      // Convertir l'image en JPEG
      const { blob, width, height } = await convertToJpeg(file);
      const arrayBuffer = await blobToArrayBuffer(blob);

      // Embed dans le PDF
      const jpgImage = await pdfDoc.embedJpg(arrayBuffer);

      // Créer une page aux dimensions de l'image
      const page = pdfDoc.addPage([width, height]);

      page.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });
    } catch (err) {
      console.error(`Erreur image ${file.name}:`, err);
      // Continuer avec les autres images
    }
  }

  if (pdfDoc.getPageCount() === 0) {
    throw new Error("Aucune image n'a pu être traitée");
  }

  // Générer le PDF
  const pdfBytes = await pdfDoc.save();

  // Retourner comme Blob
  return new Blob([pdfBytes], { type: "application/pdf" });
}