import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, Card } from '@/components/atoms';
import { authApi } from '@/services/api';

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirm_password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);

        try {
            await authApi.register(formData);
            navigate('/login', {
                state: {
                    message: 'Registration successful! Please login with your credentials.',
                },
            });
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Registration failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top brand bar (same as Login) */}
            <header className="h-14 flex items-center px-8 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                        POS
                    </div>
                    <div className="leading-tight">
                        <p className="text-sm font-semibold text-gray-900">POS Books</p>
                        <p className="text-[11px] text-gray-400">Billing &amp; Inventory</p>
                    </div>
                </div>
            </header>

            {/* Center content */}
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <Card className="w-full shadow-sm border border-gray-200 bg-white">
                        <div className="px-8 pt-8 pb-6">
                            <div className="mb-6 text-center">
                                <h1 className="text-xl font-semibold text-gray-900 mb-1">
                                    Create your POS Books account
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Fill in the details below to get started.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-md text-sm">
                                        {error}
                                    </div>
                                )}

                                <Input
                                    label="Full Name"
                                    type="text"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />

                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                                <Input
                                    label="Password"
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    name="confirm_password"
                                    placeholder="••••••••"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    required
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full mt-2"
                                    isLoading={isLoading}
                                >
                                    Register
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm text-gray-600">
                                <span>Already have an account? </span>
                                <Link
                                    to="/login"
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Sign in here
                                </Link>
                            </div>
                        </div>
                    </Card>

                    <p className="mt-4 text-center text-xs text-gray-400">
                        © {new Date().getFullYear()} POS Books. All rights reserved.
                    </p>
                </div>
            </main>
        </div>
    );
};
