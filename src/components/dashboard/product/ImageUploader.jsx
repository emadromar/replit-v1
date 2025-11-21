// src/components/dashboard/product/ImageUploader.jsx

import React from 'react';
import { Upload, Loader2, Wand2 } from 'lucide-react';

export function ImageUploader({ 
  imageFile, 
  imageUrl, 
  onFileChange, 
  onRemoveBackground, 
  bgRemoveLoading, 
  canUseBgRemove, 
  isLocked,
  onUpgrade 
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Product Image</label>
      
      {/* Image Preview / Upload Box */}
      <div className="flex items-center gap-4 p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 relative">
          
          {/* If we have an image (URL or File), show a tiny preview */}
          {(imageFile || imageUrl) && (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 border border-gray-200 flex-shrink-0">
               <img 
                 src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} 
                 alt="Preview" 
                 className="w-full h-full object-cover" 
               />
            </div>
          )}

          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-primary-700 hover:file:bg-gray-100 cursor-pointer"
            onClick={(event) => { event.target.value = null; }} // Allow re-selecting same file
          />
      </div>

      {/* AI Background Remover Logic */}
      {imageFile && (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 truncate font-medium max-w-[200px]">
            Selected: {imageFile.name}
          </p>
          
          {!isLocked ? (
            <button
              type="button"
              onClick={onRemoveBackground}
              disabled={bgRemoveLoading || !canUseBgRemove}
              className="text-xs bg-white border border-green-300 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-100 transition-colors font-semibold flex items-center"
            >
              {bgRemoveLoading ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1.5" />}
              {bgRemoveLoading ? "Removing..." : "Remove BG (AI)"}
            </button>
          ) : (
            <button 
              type="button" 
              onClick={onUpgrade} 
              className="text-xs text-primary-700 font-semibold underline"
            >
              Unlock AI Remover
            </button>
          )}
        </div>
      )}
      
      {/* Existing URL View (Only if no new file selected) */}
      {!imageFile && imageUrl && (
         <div className="text-xs text-gray-500 text-right">
            <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              View current image
            </a>
         </div>
      )}
    </div>
  );
}