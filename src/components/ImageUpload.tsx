import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUploaded, 
  currentImageUrl, 
  className = '' 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const processImage = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('El archivo debe ser menor a 5MB');
      }

      // Convert to base64 for storage
      const base64String = await convertToBase64(file);
      
      // Store in localStorage with a unique key
      const imageId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const imageKey = `certificate_template_${imageId}`;
      
      try {
        localStorage.setItem(imageKey, base64String);
        
        // Create a data URL for immediate use
        const imageUrl = base64String;
        
        setUploadedImageUrl(imageUrl);
        onImageUploaded(imageUrl);
        
      } catch (storageError) {
        throw new Error('Error al guardar la imagen. El archivo puede ser muy grande.');
      }

    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar la imagen');
    } finally {
      setIsUploading(false);
    }
  }, [onImageUploaded]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processImage(file);
    }
  }, [processImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleRemoveImage = () => {
    setUploadedImageUrl(null);
    setError(null);
    onImageUploaded('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {!uploadedImageUrl ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-gray-400 bg-gray-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-transparent mx-auto"></div>
              <div>
                <p className="text-base font-medium text-gray-900">Subiendo imagen...</p>
                <p className="text-sm text-gray-500">Por favor espera mientras procesamos tu imagen</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload
                className={`mx-auto h-12 w-12 ${
                  isDragActive ? 'text-gray-500' : error ? 'text-red-400' : 'text-gray-400'
                }`}
              />
              <div className="space-y-1">
                <p className="text-base font-medium text-gray-900">
                  {isDragActive
                    ? 'Suelta la imagen aquí'
                    : 'Sube una imagen de fondo para el certificado'}
                </p>
                <p className="text-sm text-gray-500">
                  Arrastra y suelta tu imagen aquí, o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, GIF, WebP o SVG hasta 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="aspect-[3/2] relative">
              <img
                src={uploadedImageUrl}
                alt="Template preview"
                className="w-full h-full object-contain bg-gray-50"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200 shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center text-gray-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Imagen subida correctamente</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error al subir imagen</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ImageIcon className="h-5 w-5 text-gray-400 mt-0.5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Recomendaciones para la imagen
            </h3>
            <div className="mt-2 text-sm text-gray-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Dimensiones recomendadas: 2000x1414 píxeles (proporción A4)</li>
                <li>Resolución mínima: 300 DPI para impresión</li>
                <li>Deja espacio suficiente para el texto del certificado</li>
                <li>Usa colores que contrasten bien con el texto</li>
                <li>Formatos soportados: PNG, JPG, GIF, WebP, SVG</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;