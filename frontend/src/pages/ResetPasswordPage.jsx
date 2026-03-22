import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const validatePassword = (pass) => {
        const username = email.split('@')[0];
        const isComplex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}|;:,.<>?])[A-Za-z\d!@#$%^&*()_+\-=[\]{}|;:,.<>?]{8,64}$/.test(pass);
        const noSpace = !pass.includes(' ');
        const noUsername = username ? !pass.toLowerCase().includes(username.toLowerCase()) : true;
        return isComplex && noSpace && noUsername;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validatePassword(password)) {
            setError('Password does not meet security requirements');
            return;
        }

        if (password !== confirm) {
            setError("Those passwords didn't match. Try again.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/api/auth/reset-password', { email, token, password });
            if (res.data.success) {
                navigate('/login', { state: { message: 'Password reset successful! Please sign in.' } });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Reset failed. Check your token and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <header className="auth-page-header">
                <div className="google-logo">
                    <span className="g1">S</span><span className="g2">e</span>
                    <span className="g3">c</span><span className="g4">u</span>
                    <span className="g5">r</span><span className="g6">e</span>
                    <span style={{ color: '#5f6368', marginLeft: 2 }}>Mail</span>
                </div>
            </header>

            <div className="auth-content">
                <div className="auth-card">
                    <h1>Reset password</h1>
                    <p className="subtitle">Enter your email and the 6-digit code</p>

                    {error && (
                        <div className="global-err-banner">
                            <span className="material-icons" style={{ fontSize: 18 }}>error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="auth-input-wrap">
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder=" "
                                required
                            />
                            <label>Email address</label>
                        </div>

                        <div className="auth-input-wrap">
                            <input
                                type="text"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                placeholder=" "
                                required
                            />
                            <label>6-digit reset code</label>
                        </div>

                        <div className="auth-input-wrap">
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder=" "
                                required
                            />
                            <label>New password</label>
                        </div>

                        <div className="auth-input-wrap">
                            <input
                                type="password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                placeholder=" "
                                required
                            />
                            <label>Confirm new password</label>
                        </div>

                        <div className="auth-actions" style={{ marginTop: 32 }}>
                            <Link to="/login" className="auth-create-btn">Back to sign in</Link>
                            <button type="submit" className="auth-next-btn" disabled={loading}>
                                {loading ? 'Resetting…' : 'Reset'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
