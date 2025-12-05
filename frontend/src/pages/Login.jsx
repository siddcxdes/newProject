import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Use production URL if env var not set
const API_URL = import.meta.env.VITE_API_URL || 'https://newproject-zqkp.onrender.com/api';

const Login = () => {
    const navigate = useNavigate();
    const { setAuthToken, setIsAuthenticated, hydrateFromServerData } = useApp();
    const [step, setStep] = useState('email'); // 'email' | 'otp' | 'name'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendOTP = async () => {
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/otp/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            setStep('otp');
            setCountdown(60); // 60 second countdown for resend
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, name: name || undefined })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            // If new user, ask for name
            if (data.isNewUser && !name) {
                setStep('name');
                setLoading(false);
                return;
            }

            // Login successful
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

    const handleSetName = async () => {
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        // Verify OTP again with name
        handleVerifyOTP();
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
                    <p className="text-[var(--color-text-muted)] text-sm">
                        {step === 'email' && 'Enter your email to continue'}
                        {step === 'otp' && 'Check your email for the code'}
                        {step === 'name' && 'Welcome! What should we call you?'}
                    </p>
                </div>

                {/* Form Container */}
                <div className="glass-card p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Email Input Step */}
                    {step === 'email' && (
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
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                                />
                            </div>
                            <button
                                onClick={handleSendOTP}
                                disabled={loading || !email.includes('@')}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send Verification Code'}
                            </button>
                        </>
                    )}

                    {/* OTP Input Step */}
                    {step === 'otp' && (
                        <>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
                                        Verification Code
                                    </label>
                                    <button
                                        onClick={() => setStep('email')}
                                        className="text-xs text-violet-400 hover:text-violet-300"
                                    >
                                        Change email
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                                    placeholder="000000"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                                />
                                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                                    Sent to {email}
                                </p>
                            </div>
                            <button
                                onClick={handleVerifyOTP}
                                disabled={loading || otp.length !== 6}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>
                            <button
                                onClick={handleSendOTP}
                                disabled={countdown > 0}
                                className="w-full py-2 text-[var(--color-text-muted)] text-sm hover:text-[var(--color-text-secondary)] transition-colors disabled:opacity-50"
                            >
                                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                            </button>
                        </>
                    )}

                    {/* Name Input Step (for new users) */}
                    {step === 'name' && (
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
                                    placeholder="Enter your name"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSetName()}
                                />
                            </div>
                            <button
                                onClick={handleSetName}
                                disabled={loading || !name.trim()}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Creating account...' : 'Get Started'}
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
