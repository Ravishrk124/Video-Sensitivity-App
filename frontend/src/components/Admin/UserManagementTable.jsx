// frontend/src/components/Admin/UserManagementTable.jsx
import React, { useState, useEffect } from 'react';
import { Trash2, Shield, Edit, Eye, Loader, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export default function UserManagementTable() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(null);

    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${apiBase}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data || []);
        } catch (err) {
            console.error('Fetch users error:', err);
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Delete user "${user.name}" (${user.email})?\n\nThis will also delete all videos owned by this user.`)) {
            return;
        }

        setDeleting(user._id);
        try {
            await axios.delete(`${apiBase}/api/users/${user._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from local state
            setUsers(users.filter(u => u._id !== user._id));

        } catch (err) {
            console.error('Delete user error:', err);
            alert(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setDeleting(null);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <Shield className="w-4 h-4 text-danger-600" />;
            case 'editor':
                return <Edit className="w-4 h-4 text-primary-600" />;
            case 'viewer':
                return <Eye className="w-4 h-4 text-success-600" />;
            default:
                return null;
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
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

    const currentUserId = (() => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user?.id;
        } catch {
            return null;
        }
    })();

    if (loading) {
        return (
            <div className="card flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-primary-600 animate-spin" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading users...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card">
                <div className="flex items-center space-x-3 text-danger-600">
                    <AlertTriangle className="w-6 h-6" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h2>
                <button
                    onClick={fetchUsers}
                    className="btn btn-secondary text-sm"
                >
                    Refresh
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {user.name}
                                        {user._id === currentUserId && (
                                            <span className="ml-2 text-xs text-gray-500">(You)</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`badge ${getRoleBadge(user.role)} flex items-center space-x-1 w-fit`}>
                                        {getRoleIcon(user.role)}
                                        <span className="uppercase">{user.role}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    {user._id === currentUserId ? (
                                        <span className="text-gray-400 text-xs">Cannot delete self</span>
                                    ) : (
                                        <button
                                            onClick={() => handleDelete(user)}
                                            disabled={deleting === user._id}
                                            className="btn btn-danger text-sm flex items-center space-x-1 ml-auto"
                                        >
                                            {deleting === user._id ? (
                                                <Loader className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Delete</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No users found
                    </div>
                )}
            </div>

            <div className="mt-6 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-700 rounded-lg">
                <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-warning-800 dark:text-warning-200">
                        <p className="font-medium">Warning</p>
                        <p>Deleting a user will permanently delete all their uploaded videos. This action cannot be undone.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
