// frontend/src/pages/AdminPanel.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserManagementTable from '../components/Admin/UserManagementTable';
import { ArrowLeft } from 'lucide-react';

export default function AdminPanel() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Redirect if not admin
    if (user.role !== 'admin') {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6 py-8">
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-secondary mb-6 flex items-center space-x-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </button>

                <UserManagementTable />
            </div>
        </div>
    );
}
