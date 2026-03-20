import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password || !confirm) { setError('Please fill in all fields.'); return; }
        if (password.length < 6) { setError('Use 8 characters or more for your password'); return; }
        if (password !== confirm) { setError("Those passwords didn't match. Try again."); return; }
        setLoading(true);
        try {
            const res = await api.post('/api/auth/register', { email, password });
            login(res.data.token, res.data.user);
            navigate('/inbox');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                <button className="auth-help-btn">Help</button>
            </header>

            <div className="auth-content">
                <div className="auth-card">
                    <svg className="auth-google-icon" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>

                    <h1>Create your account</h1>
                    <p className="subtitle">to continue to SecureMail</p>

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
                                autoFocus
                            />
                            <label>Email address</label>
                        </div>

                        <div className="auth-input-wrap">
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder=" "
                            />
                            <label>Password</label>
                        </div>

                        <div className="auth-input-wrap">
                            <input
                                type="password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                placeholder=" "
                            />
                            <label>Confirm password</label>
                        </div>

                        <div className="auth-actions">
                            <Link to="/login" className="auth-create-btn">Sign in instead</Link>
                            <button type="submit" className="auth-next-btn" disabled={loading}>
                                {loading ? 'Creating…' : 'Next'}
                            </button>
                        </div>
                    </form>

                    <hr className="auth-divider" />
                    <div className="auth-footer">
                        <a href="#">English (United States)</a>
                    </div>
                </div>
            </div>
        </div>
    );
}