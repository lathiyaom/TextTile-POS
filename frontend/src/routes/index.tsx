import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UsersPage } from '@/pages/UsersPage';
import { VendorsPage } from '@/pages/VendorsPage';
import { VendorCreatePage } from '@/pages/VendorCreatePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { BillsPage } from '@/pages/BillsPage';
import { BillCreatePage } from '@/pages/BillCreatePage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <ProtectedRoute>
                            <UsersPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vendors"
                    element={
                        <ProtectedRoute>
                            <VendorsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vendors/create"
                    element={
                        <ProtectedRoute>
                            <VendorCreatePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vendors/edit/:id"
                    element={
                        <ProtectedRoute>
                            <VendorCreatePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/bills"
                    element={
                        <ProtectedRoute>
                            <BillsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/bills/create"
                    element={
                        <ProtectedRoute>
                            <BillCreatePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <SettingsPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

