import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface DocumentFile extends File {
  preview?: string;
}

interface DocumentUploadFieldProps {
  label: string;
  required: boolean;
  file: DocumentFile | null;
  error?: string;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

const DocumentUploadField = ({ label, required, file, error, onSelect, onRemove }: DocumentUploadFieldProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onSelect(acceptedFiles[0]);
      }
    },
  });

  return (
    <div className="mb-6">
      <label className="block text-light font-medium mb-2">
        {label} {required && <span className="text-wine">*</span>}
      </label>

      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-gold bg-gold/10'
              : error
              ? 'border-wine bg-wine/10'
              : 'border-dark-light hover:border-gold/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 text-gold mx-auto mb-2" />
          {isDragActive ? (
            <p className="text-light">Drop the file here...</p>
          ) : (
            <>
              <p className="text-light text-sm mb-1">Drag & drop or click to select</p>
              <p className="text-xs text-gray-400">PDF, PNG, JPG up to 10MB</p>
            </>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between p-4 bg-dark rounded-lg border border-dark-light"
        >
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-gold" />
            <div>
              <p className="text-light font-medium text-sm">{file.name}</p>
              <p className="text-xs text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-400 hover:text-wine transition-colors"
          >
            <X size={20} />
          </button>
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-wine text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default DocumentUploadField;

