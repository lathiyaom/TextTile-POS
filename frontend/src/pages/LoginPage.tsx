import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input, Button, Card } from '@/components/atoms';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authApi.login({ email, password });
            login(response.token, response.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                'Login failed. Please check your credentials.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top brand bar like Zoho */}
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
                            {/* Title area similar to Zoho login */}
                            <div className="mb-6 text-center">
                                <h1 className="text-xl font-semibold text-gray-900 mb-1">
                                    Sign in to POS Books
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Use your email and password to continue.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-md text-sm">
                                        {error}
                                    </div>
                                )}

                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full mt-2"
                                    isLoading={isLoading}
                                >
                                    Sign In
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm text-gray-600">
                                <span>Don&apos;t have an account? </span>
                                <Link
                                    to="/register"
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Register here
                                </Link>
                            </div>
                        </div>
                    </Card>

                    {/* Small footer note like Zoho */}
                    <p className="mt-4 text-center text-xs text-gray-400">
                        © {new Date().getFullYear()} POS Books. All rights reserved.
                    </p>
                </div>
            </main>
        </div>
    );
};
