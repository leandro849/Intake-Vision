import React, { useRef } from 'react';
import { ImageFile } from '../types';

interface ImageUploadProps {
  label: string;
  image: ImageFile | null;
  onImageSelect: (file: ImageFile) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  image,
  onImageSelect,
  onRemove,
  disabled
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const result = reader.result as string;
        // Extract base64 and mime type
        // result is format: "data:image/jpeg;base64,....."
        const base64Content = result.split(',')[1];
        const mimeType = result.split(';')[0].split(':')[1];

        onImageSelect({
          file,
          previewUrl: result,
          base64: base64Content,
          mimeType: mimeType
        });
      };
      
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
        {label}
      </label>
      
      {!image ? (
        <div 
          onClick={() => !disabled && inputRef.current?.click()}
          className={`
            flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all duration-200
            ${disabled ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-60' : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer shadow-sm'}
          `}
        >
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">Click to upload document</p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG, HEIC up to 5MB</p>
        </div>
      ) : (
        <div className="relative flex-1 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 group">
          <img 
            src={image.previewUrl} 
            alt={label} 
            className="w-full h-64 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
          {!disabled && (
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-full hover:bg-white shadow-md transition-colors"
              title="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm text-white text-xs px-3 truncate">
            {image.file.name}
          </div>
        </div>
      )}

      <input 
        type="file" 
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};
