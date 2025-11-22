// frontend/src/components/Upload/CompactDropzone.jsx
import React, { useState, useCallback } from 'react';
import { Upload, CheckCircle, XCircle, Loader, FileVideo } from 'lucide-react';

export default function CompactDropzone({ onUpload, uploading, progress }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const validateFile = (file) => {
        const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
        const maxSize = 500 * 1024 * 1024; // 500MB

        if (!validTypes.includes(file.type)) {
            setError('Please select a valid video file (MP4, WebM, MOV, AVI)');
            return false;
        }

        if (file.size > maxSize) {
            setError('File size must be less than 500MB');
            return false;
        }

        setError('');
        return true;
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
            }
        }
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        try {
            await onUpload(selectedFile);
            setSelectedFile(null);
            setError('');
        } catch (err) {
            setError(err.message || 'Upload failed');
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setError('');
    };

    return (
        <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upload Video</h3>

            {/* Compact Horizontal Rectangle Dropzone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
          relative flex items-center justify-between p-4 border-2 border-dashed rounded-lg transition-all duration-200
          ${dragActive
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
                    }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
            >
                <div className="flex items-center space-x-4 flex-1">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        {uploading ? (
                            <Loader className="w-10 h-10 text-primary-600 animate-spin" />
                        ) : selectedFile ? (
                            <FileVideo className="w-10 h-10 text-success-600" />
                        ) : (
                            <Upload className="w-10 h-10 text-gray-400" />
                        )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        {uploading ? (
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Uploading...</p>
                                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress || 0}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{progress || 0}% complete</p>
                            </div>
                        ) : selectedFile ? (
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Drop video here or click to browse
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Supports MP4, WebM, MOV, AVI (max 500MB)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Success Checkmark */}
                    {selectedFile && !uploading && (
                        <CheckCircle className="w-8 h-8 text-success-600 flex-shrink-0" />
                    )}
                </div>

                {/* Hidden File Input */}
                <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-3 p-2 bg-danger-50 dark:bg-danger-900 border border-danger-200 dark:border-danger-700 rounded text-danger-800 dark:text-danger-200 text-sm flex items-center space-x-2">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Actions */}
            {selectedFile && !uploading && (
                <div className="mt-4 flex items-center space-x-3">
                    <button
                        onClick={handleUpload}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <Upload className="w-4 h-4" />
                        <span>Upload & Analyze</span>
                    </button>
                    <button
                        onClick={handleCancel}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}
