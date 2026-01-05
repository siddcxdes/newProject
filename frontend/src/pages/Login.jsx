import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Use local backend for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Login = () => {
    const navigate = useNavigate();
    const { setAuthToken, setIsAuthenticated, hydrateFromServerData } = useApp();
    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('ascension_token', data.token);
            setAuthToken(data.token);
            setIsAuthenticated(true);

            if (data.user) {
                hydrateFromServerData(data.user);
            }

            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name || 'Champion', email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            localStorage.setItem('ascension_token', data.token);
            setAuthToken(data.token);
            setIsAuthenticated(true);

            if (data.user) {
                hydrateFromServerData(data.user);
            }

            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to send reset email');
            }

            setSuccess('Check your email for the reset code');
            // In dev mode, the token is returned
            if (data.resetToken) {
                setResetToken(data.resetToken);
            }
            setMode('reset');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetToken || !password) {
            setError('Please enter the reset code and new password');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: resetToken, newPassword: password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            setSuccess('Password reset successful! You can now login.');
            setPassword('');
            setConfirmPassword('');
            setResetToken('');
            setMode('login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        switch (mode) {
            case 'register': return 'Create Account';
            case 'forgot': return 'Forgot Password';
            case 'reset': return 'Reset Password';
            default: return 'Welcome Back';
        }
    };

    const getSubtitle = () => {
        switch (mode) {
            case 'register': return 'Join your journey to success';
            case 'forgot': return 'Enter your email to reset';
            case 'reset': return 'Enter the code and new password';
            default: return 'Sign in to continue';
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="relative w-10 h-10">
                            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-xl rotate-45"></div>
                            <div className="absolute inset-[3px] bg-[var(--color-bg-primary)] rounded-[9px] rotate-45"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-4 h-4 text-[var(--color-text-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 19V5M5 12l7-7 7 7" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">ASCENSION</h1>
                    </div>
                    <p className="text-[var(--color-text-muted)] text-sm">{getSubtitle()}</p>
                </div>

                {/* Form Container */}
                <div className="glass-card p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white text-center">{getTitle()}</h2>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-sm text-center">
                            {success}
                        </div>
                    )}

                    {/* Login Form */}
                    {mode === 'login' && (
                        <>
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                    placeholder="you@example.com"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="••••••••"
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                />
                            </div>
                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                            <div className="flex justify-between text-sm">
                                <button
                                    onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                                    className="text-violet-400 hover:text-violet-300"
                                >
                                    Forgot password?
                                </button>
                                <button
                                    onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                                    className="text-violet-400 hover:text-violet-300"
                                >
                                    Create account
                                </button>
                            </div>
                        </>
                    )}

                    {/* Register Form */}
                    {mode === 'register' && (
                        <>
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field"
                                    placeholder="Your name"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="At least 6 characters"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="Confirm password"
                                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                                />
                            </div>
                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                            <button
                                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                                className="w-full text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                            >
                                Already have an account? Sign in
                            </button>
                        </>
                    )}

                    {/* Forgot Password Form */}
                    {mode === 'forgot' && (
                        <>
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                    placeholder="you@example.com"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
                                />
                            </div>
                            <button
                                onClick={handleForgotPassword}
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </button>
                            <button
                                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                                className="w-full text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                            >
                                Back to login
                            </button>
                        </>
                    )}

                    {/* Reset Password Form */}
                    {mode === 'reset' && (
                        <>
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                                    Reset Code
                                </label>
                                <input
                                    type="text"
                                    value={resetToken}
                                    onChange={(e) => setResetToken(e.target.value.toUpperCase())}
                                    className="input-field text-center text-lg tracking-widest font-mono"
                                    placeholder="XXXXXX"
                                    maxLength={6}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="At least 6 characters"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="Confirm password"
                                    onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                                />
                            </div>
                            <button
                                onClick={handleResetPassword}
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                            <button
                                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                                className="w-full text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                            >
                                Back to login
                            </button>
                        </>
                    )}
                </div>

                {/* Continue offline option */}
                <button
                    onClick={() => navigate('/')}
                    className="w-full mt-6 py-2 text-[var(--color-text-muted)] text-sm hover:text-[var(--color-text-secondary)] transition-colors"
                >
                    Continue offline (local storage only)
                </button>
            </div>
        </div>
    );
};

export default Login;
