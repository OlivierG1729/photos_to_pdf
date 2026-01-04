import { useRef } from "react";

export default function CameraCapture({ setImages }) {
  const inputRef = useRef(null);

  const handleCapture = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages((prev) => [...prev, ...files]);
    }
    // Reset l'input pour pouvoir reprendre une photo
    e.target.value = "";
  };

  const openCamera = () => {
    inputRef.current?.click();
  };

  return (
    <div className="camera-capture">
      {/* Input caché avec capture camera */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        style={{ display: "none" }}
      />

      <div className="camera-zone" onClick={openCamera}>
        <span className="camera-icon">📷</span>
        <span className="camera-text">Prendre une photo</span>
        <span className="camera-subtext">
          Appuyez pour ouvrir l'appareil photo
        </span>
      </div>

      {/* Bouton pour prendre plusieurs photos */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleCapture}
        id="camera-multi"
        style={{ display: "none" }}
      />
    </div>
  );
}
