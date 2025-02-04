import React, { useState } from 'react';
import { Paperclip, FileText, Image, X, Clock } from 'lucide-react';

const SUPPORTED_TYPES = {
  'image/jpeg': true,
  'image/png': true,
  'image/gif': true,
  'application/pdf': true
};

interface FileSharingProps {
  onFileSelect: (file: File, expiresIn: number) => void;
  selectedFile: File | null;
  onRemoveFile: () => void;
}

const expiryOptions = [
  { label: '1 Minute', value: 60, short: '1m' },
  { label: '30 Minutes', value: 30 * 60, short: '30m' },
  { label: '1 Hour', value: 60 * 60, short: '1h' },
  { label: '12 Hours', value: 12 * 60 * 60, short: '12h' },
  { label: '1 Day', value: 24 * 60 * 60, short: '1d' },
  { label: '7 Days', value: 7 * 24 * 60 * 60, short: '7d' },
  { label: '30 Days', value: 30 * 24 * 60 * 60, short: '30d' },
  { label: '90 Days', value: 90 * 24 * 60 * 60, short: '90d' },
];

const FilePreview = ({ 
  file, 
  onRemove, 
  expiryValue,
  onExpiryChange
}: { 
  file: File; 
  onRemove: () => void;
  expiryValue: number;
  onExpiryChange: (value: number) => void;
}) => {
  const isImage = file.type.startsWith('image/');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const selectedOption = expiryOptions.find(opt => opt.value === expiryValue);
  
  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onRemove}
            className="bg-gray-800 hover:bg-gray-700 text-white rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-2 backdrop-blur-sm border border-gray-700/50">
          {isImage ? (
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="w-8 h-8 object-cover rounded"
            />
          ) : (
            <FileText className="w-6 h-6 text-gray-300" />
          )}
          <span className="text-sm text-gray-300 truncate max-w-[120px]">{file.name}</span>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg px-3 py-2 transition-colors duration-200 backdrop-blur-sm border border-gray-700/50"
        >
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">
            Expires in {selectedOption?.short || '1d'}
          </span>
        </button>

        {isDropdownOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-700/50 py-1 z-50">
            <div className="max-h-48 overflow-y-auto">
              {expiryOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onExpiryChange(option.value);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700/50 transition-colors duration-200 ${
                    option.value === expiryValue ? 'bg-gray-700/30 text-white' : 'text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FileSharing: React.FC<FileSharingProps> = ({
  onFileSelect,
  selectedFile,
  onRemoveFile
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedExpiry, setSelectedExpiry] = useState(expiryOptions[4].value); // Default 1 day

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && SUPPORTED_TYPES[file.type]) {
      onFileSelect(file, selectedExpiry);
    } else {
      alert('Please select a supported file type (JPG, PNG, GIF, or PDF)');
    }
    event.target.value = '';
  };

  const handleExpiryChange = (value: number) => {
    setSelectedExpiry(value);
    if (selectedFile) {
      onFileSelect(selectedFile, value);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".jpg,.jpeg,.png,.gif,.pdf"
        onChange={handleFileSelect}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="text-gray-400 hover:text-gray-300 transition-colors"
        title="Attach file"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      {selectedFile && (
        <FilePreview
          file={selectedFile}
          onRemove={onRemoveFile}
          expiryValue={selectedExpiry}
          onExpiryChange={handleExpiryChange}
        />
      )}
    </div>
  );
};

export default FileSharing;