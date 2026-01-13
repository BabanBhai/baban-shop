import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Chrome } from 'lucide-react';
import toast from 'react-hot-toast';
import { NeoButton } from '../components/NeoButton';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
            toast.success('Signed in with Google!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-400 to-red-400 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-black text-white drop-shadow-[4px_4px_0px_#000] mb-2 uppercase">
                        Welcome Back
                    </h1>
                    <p className="text-white font-mono font-bold">Login to your account</p>
                </div>

                {/* Form Card */}
                <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block font-bold text-black mb-2 uppercase text-sm">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border-2 border-black p-3 pl-12 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block font-bold text-black mb-2 uppercase text-sm">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border-2 border-black p-3 pl-12 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <Link
                                to="/forgot-password"
                                className="text-sm font-bold text-black underline hover:text-purple-600"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <NeoButton
                            type="submit"
                            className="w-full py-3 text-lg"
                            variant="black"
                            disabled={loading}
                        >
                            {loading ? 'LOGGING IN...' : 'LOGIN'}
                        </NeoButton>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-black"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-4 font-bold text-black">OR</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <Chrome size={20} />
                        CONTINUE WITH GOOGLE
                    </button>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="font-mono text-sm text-black">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold underline hover:text-purple-600">
                                REGISTER HERE
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Shop */}
                <div className="mt-6 text-center">
                    <Link to="/" className="text-white font-bold underline hover:text-yellow-300">
                        ← BACK TO SHOP
                    </Link>
                </div>
            </div>
        </div>
    );
};
