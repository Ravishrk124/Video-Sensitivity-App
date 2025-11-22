// frontend/src/components/Dashboard/EnhancedVideoCard.jsx
import React, { useState } from 'react';
import { Play, Trash2, Flag, CheckCircle, AlertCircle, Clock, HardDrive, Calendar, Video } from 'lucide-react';
import { format } from 'date-fns';

export default function EnhancedVideoCard({ video, onPlay, onDelete, onToggleManual, canDelete, canEdit }) {
    const [deleting, setDeleting] = useState(false);
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

    // Calculate badge based on sensitivity and manual review
    const getBadge = () => {
        if (video.manualReview) {
            return {
                icon: <AlertCircle className="w-3 h-3" />,
                text: 'Manual Review',
                className: 'badge-warning'
            };
        }

        if (video.sensitivity === 'flagged' || (video.sensitivityScore && video.sensitivityScore >= 50)) {
            return {
                icon: <Flag className="w-3 h-3" />,
                text: 'Flagged',
                className: 'badge-danger'
            };
        }

        return {
            icon: <CheckCircle className="w-3 h-3" />,
            text: 'Safe',
            className: 'badge-success'
        };
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${video.originalName || video.filename}"?`)) return;
        setDeleting(true);
        try {
            await onDelete(video);
        } catch (err) {
            console.error('Delete failed:', err);
            setDeleting(false);
        }
    };

    const badge = getBadge();
    // thumbnailUrl is no longer directly used in the new JSX, but apiBase is.
    // const thumbnailUrl = video.thumbnail
    //     ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}${video.thumbnail}`)
    //     : null;

    return (
        <div className="card card-hover group">
            {/* Thumbnail with Styled Overlay */}
            <div className="relative aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden mb-4">
                {video.thumbnail ? (
                    <>
                        <img
                            src={`${apiBase}${video.thumbnail}`}
                            alt={video.title || video.originalName}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

                        {/* Decorative Border */}
                        <div className="absolute inset-0 border-2 border-primary-500/30 rounded-xl"></div>

                        {/* Film Grain Effect */}
                        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWJlbGVuY2UgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIiB0eXBlPSJmcmFjdGFsTm9pc2UiLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PHBhdGggZD0iTTAgMGgzMDB2MzAwSDB6IiBmaWx0ZXI9InVybCgjYSkib3BhY2l0eT0iLjA1Ii8+PC9zdmc+')]"></div>

                        {/* Play Icon Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/50">
                                <Play className="w-6 h-6 text-white fill-white" />
                            </div>
                        </div>

                        {/* Badge Overlay */}
                        <div className="absolute top-2 right-2">
                            <span className={`badge ${badge.className} flex items-center space-x-1`}>
                                {badge.icon}
                                <span>{badge.text}</span>
                            </span>
                        </div>

                        {/* Score Overlay */}
                        {video.sensitivityScore !== undefined && video.sensitivityScore !== null && (
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                                Score: {video.sensitivityScore}%
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                        <Video className="w-10 h-10 text-gray-400" />
                        <span className="text-xs text-gray-500">Processing...</span>
                    </div>
                )}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate" title={video.originalName || video.filename}>
                {video.title || video.originalName || video.filename}
            </h3>

            {/* Metadata */}
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-2">
                    <HardDrive className="w-4 h-4" />
                    <span>{video.size ? (video.size / (1024 * 1024)).toFixed(2) : '0'} MB</span>
                </div>

                <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{video.createdAt ? format(new Date(video.createdAt), 'MMM dd, yyyy') : 'Unknown'}</span>
                </div>

                {video.duration > 0 && (
                    <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => onPlay(video)}
                    className="btn btn-primary flex-1 flex items-center justify-center space-x-1 text-sm"
                >
                    <Play className="w-4 h-4" />
                    <span>Play</span>
                </button>

                {canEdit && (
                    <button
                        onClick={() => onToggleManual(video)}
                        className={`btn ${video.manualReview ? 'btn-warning' : 'btn-secondary'} flex items-center justify-center space-x-1 text-sm`}
                        title={video.manualReview ? 'Remove manual review flag' : 'Flag for manual review'}
                    >
                        <AlertCircle className="w-4 h-4" />
                    </button>
                )}

                {canDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // CRITICAL: Prevent bubbling to parent/video player
                            handleDelete();
                        }}
                        disabled={deleting}
                        className="btn btn-danger flex items-center justify-center space-x-1 text-sm relative z-10"
                        title="Delete video"
                    >
                        {deleting ? (
                            <Clock className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
