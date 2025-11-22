// frontend/src/components/Layout/Header.jsx
import React from 'react';
import { LogOut, User, Shield, Edit, Eye } from 'lucide-react';

export default function Header({ user, onLogout }) {
    if (!user) return null;

    const getRoleIcon = () => {
        switch (user.role) {
            case 'admin':
                return <Shield className="w-4 h-4" />;
            case 'editor':
                return <Edit className="w-4 h-4" />;
            case 'viewer':
                return <Eye className="w-4 h-4" />;
            default:
                return <User className="w-4 h-4" />;
        }
    };

    const getRoleBadgeClass = () => {
        switch (user.role) {
            case 'admin':
                return 'badge-danger';
            case 'editor':
                return 'badge-primary';
            case 'viewer':
                return 'badge-success';
            default:
                return 'badge-primary';
        }
    };

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                        VideoSafe AI
                    </h1>
                    <span className={`badge ${getRoleBadgeClass()} flex items-center space-x-1`}>
                        {getRoleIcon()}
                        <span className="uppercase">{user.role}</span>
                    </span>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{user.name || user.email}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={onLogout}
                        className="btn btn-secondary flex items-center space-x-2"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
