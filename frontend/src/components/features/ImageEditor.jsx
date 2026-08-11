import React, { useState, useCallback, useRef } from 'react';
import { Image as ImageIcon, Trash2, Move } from 'lucide-react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
};

export const ImageEditor = ({ onImageAdjusted, initialImageFile = null }) => {
  const [imageSrc, setImageSrc] = useState(
    initialImageFile ? URL.createObjectURL(initialImageFile) : null
  );
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleRemoveImage = () => {
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageAdjusted) {
      onImageAdjusted({ file: null, dataUrl: null });
    }
  };

  const onCropComplete = useCallback(
    async (croppedArea, croppedAreaPixels) => {
      try {
        const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
        const processedFile = new File([blob], 'article-image.jpg', {
          type: 'image/jpeg',
        });
        if (onImageAdjusted) {
          onImageAdjusted({ file: processedFile, dataUrl: URL.createObjectURL(blob) });
        }
      } catch (e) {
        console.error(e);
      }
    },
    [imageSrc, onImageAdjusted]
  );

  return (
    <div className="w-full relative">
      {!imageSrc ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[15/11] rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#444] bg-slate-50 dark:bg-[#1a1a1a] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-[#252525] transition group overflow-hidden"
        >
          <div className="w-16 h-16 bg-white dark:bg-[#252525] rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-4">
            <ImageIcon className="w-8 h-8 text-indigo-500" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Click to upload cover</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">JPG, PNG, WebP up to 5MB</p>
        </div>
      ) : (
        <div className="w-full aspect-[15/11] relative rounded-2xl overflow-hidden bg-[#111]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={15 / 11}
            objectFit="cover"
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={false}
          />
          
          <button
            onClick={handleRemoveImage}
            className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/60 hover:bg-black/80 backdrop-blur text-white flex items-center justify-center rounded-full transition shadow-lg border border-white/10"
            title="Remove Image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white/90 text-sm font-medium shadow-lg border border-white/10 pointer-events-none">
            <Move className="w-4 h-4" />
            <span>Pinch to zoom & drag to reposition</span>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />
    </div>
  );
};

export default ImageEditor;
