import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  previewUrl: string | null;
  onClear: () => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  selectedImage,
  previewUrl,
  onClear,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          onImageSelect(file);
        }
      }
    },
    [onImageSelect]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onImageSelect(e.target.files[0]);
      }
    },
    [onImageSelect]
  );

  if (previewUrl) {
    return (
      <div className="relative animate-scale-in">
        <div className="relative overflow-hidden rounded-2xl border border-white/20 shadow-glass">
          <img
            src={previewUrl}
            alt="Selected plant"
            className="w-full h-64 sm:h-80 object-cover"
          />
          {!isLoading && (
            <button
              onClick={onClear}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-all duration-200 hover:scale-110"
              aria-label="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>
        <p className="mt-3 text-sm text-center text-muted-foreground truncate px-4">
          {selectedImage?.name}
        </p>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all duration-300 cursor-pointer group",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
      )}
    >
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload image"
      />
      <div className="flex flex-col items-center gap-4 pointer-events-none">
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
            isDragging
              ? "bg-primary text-primary-foreground scale-110"
              : "bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-105"
          )}
        >
          {isDragging ? (
            <ImageIcon className="w-8 h-8" />
          ) : (
            <Upload className="w-8 h-8" />
          )}
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-foreground">
            {isDragging ? "Drop your image here" : "Upload plant image"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag & drop or click to browse
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            Supports JPG, JPEG, PNG
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
