import { useState, useRef, useEffect, useCallback } from "react";

export default function ImageEditor({ image, onSave, onClose }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [crop, setCrop] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState(null);
  const [originalImg, setOriginalImg] = useState(null);
  const [imageVersion, setImageVersion] = useState(0); // Pour forcer le re-render après crop

  // URLs à nettoyer
  const urlsToCleanup = useRef([]);

  // Charger l'image initiale
  useEffect(() => {
    const url = URL.createObjectURL(image);
    urlsToCleanup.current.push(url);

    const img = new Image();
    img.onload = () => {
      setOriginalImg(img);
      setRotation(0);
      setBrightness(100);
      setContrast(100);
    };
    img.onerror = () => {
      console.error("Erreur chargement image");
      alert("Impossible de charger l'image");
      onClose();
    };
    img.src = url;

    return () => {
      // Nettoyer toutes les URLs créées
      urlsToCleanup.current.forEach((u) => URL.revokeObjectURL(u));
      urlsToCleanup.current = [];
    };
  }, [image, onClose]);

  // Dessiner l'image avec les transformations
  const drawImage = useCallback(() => {
    if (!originalImg || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Calculer les dimensions après rotation
    const isRotated = rotation === 90 || rotation === 270;
    const srcWidth = isRotated ? originalImg.height : originalImg.width;
    const srcHeight = isRotated ? originalImg.width : originalImg.height;

    // Adapter au container
    const maxWidth = window.innerWidth - 32;
    const maxHeight = window.innerHeight - 350;
    const scale = Math.min(maxWidth / srcWidth, maxHeight / srcHeight, 1);

    canvas.width = Math.max(1, Math.floor(srcWidth * scale));
    canvas.height = Math.max(1, Math.floor(srcHeight * scale));

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Appliquer les filtres
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const drawWidth = isRotated ? canvas.height : canvas.width;
    const drawHeight = isRotated ? canvas.width : canvas.height;

    ctx.drawImage(originalImg, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // Dessiner la zone de recadrage si active
    if (crop && crop.width > 0 && crop.height > 0) {
      ctx.strokeStyle = "#4f7cff";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

      // Assombrir les zones hors recadrage
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, crop.y);
      ctx.fillRect(0, crop.y + crop.height, canvas.width, canvas.height - crop.y - crop.height);
      ctx.fillRect(0, crop.y, crop.x, crop.height);
      ctx.fillRect(crop.x + crop.width, crop.y, canvas.width - crop.x - crop.width, crop.height);
    }
  }, [originalImg, rotation, brightness, contrast, crop, imageVersion]);

  useEffect(() => {
    drawImage();
  }, [drawImage]);

  // Gestion du recadrage - Mouse
  const handleCanvasMouseDown = (e) => {
    if (!isCropping) return;
    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCropStart({ x, y });
    setCrop({ x, y, width: 0, height: 0 });
  };

  const handleCanvasMouseMove = (e) => {
    if (!isCropping || !cropStart) return;
    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    setCrop({
      x: Math.min(cropStart.x, x),
      y: Math.min(cropStart.y, y),
      width: Math.abs(x - cropStart.x),
      height: Math.abs(y - cropStart.y),
    });
  };

  const handleCanvasMouseUp = () => {
    setCropStart(null);
  };

  // Touch events pour mobile
  const handleTouchStart = (e) => {
    if (!isCropping) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setCropStart({ x, y });
    setCrop({ x, y, width: 0, height: 0 });
  };

  const handleTouchMove = (e) => {
    if (!isCropping || !cropStart) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(touch.clientY - rect.top, rect.height));

    setCrop({
      x: Math.min(cropStart.x, x),
      y: Math.min(cropStart.y, y),
      width: Math.abs(x - cropStart.x),
      height: Math.abs(y - cropStart.y),
    });
  };

  const handleTouchEnd = () => {
    setCropStart(null);
  };

  // Actions
  const rotate = (deg) => setRotation((r) => (r + deg + 360) % 360);

  const applyCrop = () => {
    if (!crop || crop.width < 10 || crop.height < 10) {
      alert("Sélectionnez une zone plus grande à recadrer");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Créer un canvas temporaire pour le crop
    const croppedCanvas = document.createElement("canvas");
    const cropWidth = Math.floor(crop.width);
    const cropHeight = Math.floor(crop.height);

    if (cropWidth <= 0 || cropHeight <= 0) {
      alert("Zone de recadrage invalide");
      return;
    }

    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    const ctx = croppedCanvas.getContext("2d");

    // Copier la zone sélectionnée
    ctx.drawImage(
      canvas,
      Math.floor(crop.x),
      Math.floor(crop.y),
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // Convertir en nouvelle image
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          alert("Erreur lors du recadrage");
          return;
        }

        const url = URL.createObjectURL(blob);
        urlsToCleanup.current.push(url);

        const img = new Image();
        img.onload = () => {
          setOriginalImg(img);
          setCrop(null);
          setIsCropping(false);
          setRotation(0); // Reset rotation après crop
          setImageVersion((v) => v + 1); // Forcer re-render
        };
        img.onerror = () => {
          alert("Erreur lors du recadrage");
          setCrop(null);
          setIsCropping(false);
        };
        img.src = url;
      },
      "image/jpeg",
      0.92
    );
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          alert("Erreur lors de la sauvegarde");
          return;
        }
        const file = new File([blob], image.name || "photo.jpg", {
          type: "image/jpeg",
        });
        onSave(file);
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div className="editor-fullscreen">
      {/* Header */}
      <div className="editor-header">
        <button className="editor-close" onClick={onClose}>
          ✕
        </button>
        <span className="editor-title">Éditer la photo</span>
        <button className="editor-save" onClick={handleSave}>
          ✓
        </button>
      </div>

      {/* Canvas */}
      <div className="editor-canvas-container">
        {originalImg ? (
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
              cursor: isCropping ? "crosshair" : "default",
              touchAction: isCropping ? "none" : "auto"
            }}
          />
        ) : (
          <div className="editor-loading">
            <span className="spinner"></span>
            <span>Chargement...</span>
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div className="editor-controls">
        {/* Rotation */}
        <div className="editor-section">
          <span className="editor-label">🔄 Rotation</span>
          <div className="editor-buttons">
            <button onClick={() => rotate(-90)}>↶ 90°</button>
            <button onClick={() => rotate(90)}>↷ 90°</button>
            <button onClick={() => rotate(180)}>180°</button>
          </div>
        </div>

        {/* Recadrage */}
        <div className="editor-section">
          <span className="editor-label">✂️ Recadrage</span>
          <div className="editor-buttons">
            <button
              className={isCropping ? "active" : ""}
              onClick={() => {
                setIsCropping(!isCropping);
                setCrop(null);
                setCropStart(null);
              }}
            >
              {isCropping ? "Annuler" : "Sélectionner"}
            </button>
            {crop && crop.width > 10 && crop.height > 10 && (
              <button onClick={applyCrop} className="active">
                ✓ Appliquer
              </button>
            )}
          </div>
          {isCropping && (
            <span className="editor-hint">
              Dessinez un rectangle sur l'image
            </span>
          )}
        </div>

        {/* Luminosité */}
        <div className="editor-section">
          <span className="editor-label">☀️ Luminosité: {brightness}%</span>
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
          />
        </div>

        {/* Contraste */}
        <div className="editor-section">
          <span className="editor-label">◐ Contraste: {contrast}%</span>
          <input
            type="range"
            min="50"
            max="150"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
          />
        </div>

        {/* Reset */}
        <button className="editor-reset" onClick={resetFilters}>
          🔄 Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
}
