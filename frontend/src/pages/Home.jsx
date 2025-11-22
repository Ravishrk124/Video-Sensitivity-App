// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CompactDropzone from '../components/Upload/CompactDropzone';
import EnhancedVideoCard from '../components/Dashboard/EnhancedVideoCard';
import VideoPlayerModal from '../components/VideoPlayerModal';
import { Loader } from 'lucide-react';
import useSocket from '../hooks/useSocket';

export default function Home() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const canUpload = ['admin', 'editor'].includes(user.role);
    const canEdit = ['admin', 'editor'].includes(user.role);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiBase}/api/videos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(response.data || []);
        } catch (err) {
            console.error('Fetch videos error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file) => {
        setUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`${apiBase}/api/videos/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                }
            });

            // Add uploaded video to list
            if (response.data) {
                setVideos([response.data, ...videos]);
                setTimeout(() => fetchVideos(), 2000); // Refresh after processing starts
            }

        } catch (err) {
            console.error('Upload error:', err);
            throw new Error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (video) => {
        try {
            await axios.delete(`${apiBase}/api/videos/${video._id || video.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(videos.filter(v => (v._id || v.id) !== (video._id || video.id)));
        } catch (err) {
            console.error('Delete error:', err);
            throw err;
        }
    };

    const handleToggleManual = async (video) => {
        try {
            const newValue = !video.manualReview;
            await axios.patch(
                `${apiBase}/api/videos/${video._id || video.id}`,
                { manualReview: newValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setVideos(videos.map(v =>
                (v._id || v.id) === (video._id || video.id)
                    ? { ...v, manualReview: newValue }
                    : v
            ));
        } catch (err) {
            console.error('Toggle manual error:', err);
        }
    };

    const canDelete = (video) => {
        if (user.role === 'admin') return true;
        return String(video.owner) === String(user.id);
    };

    // Socket.io real-time updates
    const handleProcessingUpdate = (payload) => {
        setVideos(prev => prev.map(v =>
            (v._id || v.id) === payload.videoId
                ? { ...v, progress: payload.progress, status: payload.status || v.status }
                : v
        ));
    };

    const handleProcessingComplete = (payload) => {
        setVideos(prev => prev.map(v =>
            (v._id || v.id) === payload.videoId
                ? {
                    ...v,
                    progress: 100,
                    status: payload.status || 'done',
                    sensitivity: payload.sensitivity || v.sensitivity,
                    sensitivityScore: payload.sensitivityScore ?? v.sensitivityScore,
                    thumbnail: payload.thumbnail || v.thumbnail
                }
                : v
        ));
    };

    useSocket({
        'processingProgress': handleProcessingUpdate,
        'processingComplete': handleProcessingComplete
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6 py-8">
                {/* Upload Section */}
                {canUpload && (
                    <div className="mb-8">
                        <CompactDropzone
                            onUpload={handleUpload}
                            uploading={uploading}
                            progress={uploadProgress}
                        />
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Videos</h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{videos.length}</p>
                    </div>
                    <div className="card">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Flagged</h3>
                        <p className="text-3xl font-bold text-danger-600 dark:text-danger-400 mt-2">
                            {videos.filter(v => v.sensitivity === 'flagged' || (v.sensitivityScore && v.sensitivityScore >= 50)).length}
                        </p>
                    </div>
                    <div className="card">
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Manual Review</h3>
                        <p className="text-3xl font-bold text-warning-600 dark:text-warning-400 mt-2">
                            {videos.filter(v => v.manualReview).length}
                        </p>
                    </div>
                </div>

                {/* Video Grid */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Video Library</h2>

                    {loading ? (
                        <div className="card flex items-center justify-center py-12">
                            <Loader className="w-8 h-8 text-primary-600 animate-spin" />
                            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading videos...</span>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">
                                {canUpload ? 'No videos yet. Upload your first video above!' : 'No videos available.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {videos.map((video) => (
                                <EnhancedVideoCard
                                    key={video._id || video.id || video.filename}
                                    video={video}
                                    onPlay={setSelectedVideo}
                                    onDelete={handleDelete}
                                    onToggleManual={handleToggleManual}
                                    canDelete={canDelete(video)}
                                    canEdit={canEdit}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Video Player Modal */}
            {selectedVideo && (
                <VideoPlayerModal
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
            )}
        </div>
    );
}
