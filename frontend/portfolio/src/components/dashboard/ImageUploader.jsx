import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function ImageUploader({
  label = 'Cover Image',
  value = null,
  onChange,
  error = null,
  helperText = 'JPG, PNG or WebP under 2 MB',
  maxSizeMB = 2,
  acceptedExtensions = ['.jpg', '.jpeg', '.png', '.webp'],
  className = '',
  previewClassName = 'aspect-video',
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (typeof value === 'string' && value.trim()) {
      setPreviewUrl(value);
    } else if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const validateAndSelect = (file) => {
    setLocalError(null);
    if (!file) return;

    // Size validation
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setLocalError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the ${maxSizeMB} MB limit.`);
      return;
    }

    // Format validation
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!acceptedExtensions.includes(extension)) {
      setLocalError(`Unsupported format '${extension}'. Allowed: ${acceptedExtensions.join(', ')}`);
      return;
    }

    onChange?.(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    validateAndSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLocalError(null);
    onChange?.(null);
  };

  const displayedError = error || localError;

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {label && (
        <label className="font-mono text-xs font-medium text-text-muted flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-text-muted/60">{helperText}</span>
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedExtensions.join(',')}
        onChange={handleFileChange}
        className="hidden"
        id={`uploader-${label.replace(/\s+/g, '-').toLowerCase()}`}
      />

      {previewUrl ? (
        <div className="relative rounded-lg border border-border/80 bg-surface-2 overflow-hidden group">
          <div className={cn('w-full overflow-hidden flex items-center justify-center bg-bg/50', previewClassName)}>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute inset-0 bg-bg/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-md bg-surface border border-border font-mono text-xs text-text hover:border-accent transition-colors"
            >
              Replace Image
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-md bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-colors"
              title="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-surface-2/40 hover:bg-surface-2/80 transition-colors cursor-pointer select-none text-center',
            displayedError
              ? 'border-danger/60 hover:border-danger'
              : 'border-border/80 hover:border-accent'
          )}
        >
          <div className="p-3 rounded-full bg-surface-2 border border-border text-accent mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="font-mono text-xs text-text font-medium">Click or drag & drop to upload</p>
          <p className="font-mono text-[10px] text-text-muted mt-1">{helperText}</p>
        </div>
      )}

      {displayedError && (
        <div className="flex items-center gap-1.5 text-danger font-mono text-xs mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
