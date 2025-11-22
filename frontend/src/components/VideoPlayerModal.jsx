// frontend/src/components/VideoPlayerModal.jsx  
import React, { useRef, useEffect } from 'react';
import { X, Maximize2, Film, Activity, Monitor, Zap, HardDrive, Clock } from 'lucide-react';

export default function VideoPlayerModal({ video, onClose }) {
    const videoRef = useRef(null);
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const videoUrl = video._id || video.id
        ? `${apiBase}/api/videos/stream/${video._id || video.id}`
        : null;

    const handleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            } else if (videoRef.current.webkitRequestFullscreen) {
                videoRef.current.webkitRequestFullscreen();
            } else if (videoRef.current.mozRequestFullScreen) {
                videoRef.current.mozRequestFullScreen();
            }
        }
    };

    // Format file size
    const formatSize = (bytes) => {
        if (!bytes) return 'N/A';
        const mb = bytes / (1024 * 1024);
        return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(2)} MB`;
    };

    // Format duration
    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
                    <div className="flex items-center space-x-2 flex-1 mr-4">
                        <div className="p-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <Film className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-white font-semibold text-sm truncate">
                            {video.title || video.originalName || video.filename || 'Video Player'}
                        </h3>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={handleFullscreen}
                            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
                            title="Fullscreen"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
                            title="Close (Esc)"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Video Player */}
                <div className="relative bg-black" style={{ maxHeight: '60vh' }}>
                    {videoUrl ? (
                        <video
                            ref={videoRef}
                            controls
                            autoPlay
                            className="w-full h-full"
                            style={{ maxHeight: '60vh' }}
                        >
                            <source src={videoUrl} type="video/mp4" />
                            <source src={videoUrl} type="video/webm" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <p>Video unavailable</p>
                        </div>
                    )}
                </div>

                {/* Enhanced Metadata Grid */}
                <div className="p-5 bg-gradient-to-br from-gray-800 to-gray-900">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                        <Monitor className="w-4 h-4 text-blue-400" />
                        <span>Technical Details</span>
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* AI Confidence */}
                        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-3 border border-gray-600">
                            <div className="flex items-center space-x-2 mb-2">
                                <Activity className="w-4 h-4 text-blue-400" />
                                <span className="text-xs text-gray-400 font-medium">AI Score</span>
                            </div>
                            <p className={`text-2xl font-bold ${(video.sensitivityScore || 0) >= 50 ? 'text-red-400' : 'text-green-400'
                                }`}>
                                {video.sensitivityScore !== undefined ? `${video.sensitivityScore}%` : 'N/A'}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                                {(video.sensitivityScore || 0) >= 50 ? 'Flagged' : 'Safe'}
                            </p>
                        </div>

                        {/* File Size */}
                        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-3 border border-gray-600">
                            <div className="flex items-center space-x-2 mb-2">
                                <HardDrive className="w-4 h-4 text-yellow-400" />
                                <span className="text-xs text-gray-400 font-medium">File Size</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {formatSize(video.size)}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                                {video.mimetype || 'video/mp4'}
                            </p>
                        </div>

                        {/* Duration */}
                        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-3 border border-gray-600">
                            <div className="flex items-center space-x-2 mb-2">
                                <Clock className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-gray-400 font-medium">Duration</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {formatDuration(video.duration)}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                                {video.duration ? `${video.duration}s` : 'Unknown'}
                            </p>
                        </div>

                        {/* Status */}
                        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-3 border border-gray-600">
                            <div className="flex items-center space-x-2 mb-2">
                                <Zap className="w-4 h-4 text-purple-400" />
                                <span className="text-xs text-gray-400 font-medium">Status</span>
                            </div>
                            <p className="text-sm font-bold text-white capitalize">
                                {video.status || 'Unknown'}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                                {video.manualReview ? 'Manual Review' : 'Automated'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
