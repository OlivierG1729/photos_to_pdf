import { useDropzone } from "react-dropzone";

export default function ImageDropzone({ setImages }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (files) => setImages((prev) => [...prev, ...files]),
  });

  return (
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}>
      <input {...getInputProps()} />
      
      <span className="dropzone-icon">📂</span>
      
      <span className="dropzone-text">
        {isDragActive ? "Déposez les images ici" : "Importer des photos"}
      </span>

      <span className="dropzone-subtext">
        Cliquez ou glissez-déposez vos images (JPG, PNG)
      </span>
    </div>
  );
}
