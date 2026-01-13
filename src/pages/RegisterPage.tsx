import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, Chrome } from 'lucide-react';
import toast from 'react-hot-toast';
import { NeoButton } from '../components/NeoButton';

export const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register(email, password, displayName);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
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
                        Join Us
                    </h1>
                    <p className="text-white font-mono font-bold">Create your exclusive account</p>
                </div>

                {/* Form Card */}
                <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Display Name */}
                        <div>
                            <label className="block font-bold text-black mb-2 uppercase text-sm">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                                    <UserIcon size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full border-2 border-black p-3 pl-12 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

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
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block font-bold text-black mb-2 uppercase text-sm">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full border-2 border-black p-3 pl-12 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <NeoButton
                            type="submit"
                            className="w-full py-3 text-lg"
                            variant="black"
                            disabled={loading}
                        >
                            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
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

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="font-mono text-sm text-black">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold underline hover:text-purple-600">
                                LOGIN HERE
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
