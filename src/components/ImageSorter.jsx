import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableThumb({ file, index, url, onRemove, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.name + "-" + index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="thumb-container">
      {/* Image draggable */}
      <img
        src={url}
        alt={`Image ${index + 1}`}
        className="thumb"
        {...attributes}
        {...listeners}
      />
      
      {/* Numéro */}
      <span className="thumb-number">{index + 1}</span>
      
      {/* Bouton ÉDITER - bien visible */}
      <button
        className="thumb-edit"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onEdit(index);
        }}
        title="Modifier cette image"
      >
        ✏️
      </button>

      {/* Bouton SUPPRIMER */}
      <button
        className="thumb-remove"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemove(index);
        }}
        title="Supprimer"
      >
        ×
      </button>
    </div>
  );
}

export default function ImageSorter({ images, setImages, onEditImage }) {
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleRemove = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImages((prev) => {
        const oldIndex = prev.findIndex(
          (file, i) => file.name + "-" + i === active.id
        );
        const newIndex = prev.findIndex(
          (file, i) => file.name + "-" + i === over.id
        );
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="sorter">
      <div className="sorter-header">
        <span className="sorter-title">📋 Ordre des pages</span>
        <span className="sorter-count">
          {images.length} image{images.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Message d'aide */}
      <div className="sorter-help">
        💡 Appuyez sur <strong>✏️</strong> pour modifier une photo (rotation, recadrage, luminosité)
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((file, i) => file.name + "-" + i)}
          strategy={rectSortingStrategy}
        >
          <div className="thumbs">
            {images.map((file, index) => (
              <SortableThumb
                key={file.name + "-" + index}
                file={file}
                index={index}
                url={previewUrls[index]}
                onRemove={handleRemove}
                onEdit={onEditImage}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
