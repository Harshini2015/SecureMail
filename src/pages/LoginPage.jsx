import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleEmailNext = (e) => {
        e.preventDefault();
        setError('');
        if (!email) { setError('Enter an email or phone number'); return; }
        if (!email.includes('@')) { setError('Enter a valid email address'); return; }
        setStep('password');
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        if (!password) { setError('Enter a password'); return; }
        setLoading(true);
        try {
            const res = await api.post('/api/auth/login', { email, password });
            login(res.data.token, res.data.user);
            navigate('/inbox');
        } catch (err) {
            setError(err.response?.data?.message || 'Wrong password. Try again or click Forgot password.');
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

                    <h1>Sign in</h1>
                    <p className="subtitle">to continue to SecureMail</p>

                    {error && (
                        <div className="global-err-banner">
                            <span className="material-icons" style={{ fontSize: 18 }}>error</span>
                            {error}
                        </div>
                    )}

                    {step === 'email' ? (
                        <form onSubmit={handleEmailNext}>
                            <div className="auth-input-wrap">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); setError(''); }}
                                    placeholder=" "
                                    autoFocus
                                    className={error ? 'error-input' : ''}
                                />
                                <label>Email or phone</label>
                            </div>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: '20px' }}>
                                Not your computer? Use Guest mode to sign in privately.{' '}
                                <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Learn more</a>
                            </p>
                            <div className="auth-actions">
                                <Link to="/register" className="auth-create-btn">Create account</Link>
                                <button type="submit" className="auth-next-btn">Next</button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSignIn}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                border: '1px solid var(--border)', borderRadius: 20,
                                padding: '6px 12px', marginBottom: 28, width: 'fit-content'
                            }}>
                                <div style={{
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: 'var(--accent)', color: '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, fontWeight: 500, fontFamily: 'Google Sans',
                                }}>
                                    {email[0]?.toUpperCase()}
                                </div>
                                <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{email}</span>
                                <button type="button" onClick={() => setStep('email')}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    <span className="material-icons" style={{ fontSize: 16, color: 'var(--text-secondary)' }}>arrow_drop_down</span>
                                </button>
                            </div>

                            <div className="auth-input-wrap">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    placeholder=" "
                                    autoFocus
                                    className={error ? 'error-input' : ''}
                                />
                                <label>Enter your password</label>
                            </div>

                            <a href="#" className="auth-forgot">Forgot password?</a>

                            <div className="auth-actions">
                                <Link to="/register" className="auth-create-btn">Create account</Link>
                                <button type="submit" className="auth-next-btn" disabled={loading}>
                                    {loading ? 'Signing in…' : 'Next'}
                                </button>
                            </div>
                        </form>
                    )}

                    <hr className="auth-divider" />
                    <div className="auth-footer">
                        <a href="#">English (United States)</a>
                    </div>
                </div>
            </div>
        </div>
    );
}