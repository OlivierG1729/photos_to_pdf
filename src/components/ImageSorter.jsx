export default function ImageSorter({ images, setImages }) {
  
  const handleRemove = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setImages((prev) => {
      const newImages = [...prev];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      return newImages;
    });
  };

  const handleMoveDown = (index) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const newImages = [...prev];
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      return newImages;
    });
  };

  return (
    <div className="sorter">
      <div className="sorter-header">
        <span className="sorter-title">📋 Ordre des pages</span>
        <span className="sorter-count">{images.length} image{images.length > 1 ? 's' : ''}</span>
      </div>

      <div className="thumbs">
        {images.map((file, index) => (
          <div key={`${file.name}-${index}`} className="thumb-container">
            <img
              src={URL.createObjectURL(file)}
              alt={`Image ${index + 1}`}
              className="thumb"
            />
            <span className="thumb-number">{index + 1}</span>
            <button 
              className="thumb-remove" 
              onClick={() => handleRemove(index)}
              title="Supprimer"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
