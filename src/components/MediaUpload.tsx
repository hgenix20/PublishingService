import React, { useCallback, useState } from 'react';
import { Upload, Video, Image, X } from 'lucide-react';
import { MediaFile } from '../types';

interface MediaUploadProps {
  onFileSelect: (file: MediaFile) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('video/') || file.type.startsWith('image/')) {
      const preview = URL.createObjectURL(file);
      const mediaFile: MediaFile = {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview
      };
      onFileSelect(mediaFile);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
      <h3 className="text-lg font-semibold text-white mb-4">Upload Media</h3>
      
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-purple-400 bg-purple-500 bg-opacity-20' 
            : 'border-gray-400 hover:border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
              <Image className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div>
            <p className="text-white font-medium">Drop your media here</p>
            <p className="text-gray-300 text-sm mt-1">or click to browse</p>
          </div>
          
          <input
            type="file"
            accept="video/*,image/*"
            onChange={handleInputChange}
            className="hidden"
            id="media-upload"
          />
          
          <label
            htmlFor="media-upload"
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200"
          >
            Choose Files
          </label>
          
          <div className="text-xs text-gray-400 mt-2">
            Supports: MP4, MOV, AVI, JPG, PNG, GIF
            <br />
            Max size: 100MB
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;