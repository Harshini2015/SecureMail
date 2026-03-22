import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await api.post('/api/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
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
                    <h1>Account recovery</h1>
                    <p className="subtitle">Enter the email address you use for SecureMail</p>

                    {message && (
                        <div className="global-success-banner" style={{
                            background: '#e6f4ea', color: '#1e8e3e', padding: '12px',
                            borderRadius: '8px', marginBottom: '16px', fontSize: '14px'
                        }}>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="global-err-banner">
                            <span className="material-icons" style={{ fontSize: 18 }}>error</span>
                            {error}
                        </div>
                    )}

                    {!message && (
                        <form onSubmit={handleSubmit}>
                            <div className="auth-input-wrap">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder=" "
                                    autoFocus
                                    required
                                />
                                <label>Email address</label>
                            </div>

                            <div className="auth-actions" style={{ marginTop: 32 }}>
                                <Link to="/login" className="auth-create-btn">Back to sign in</Link>
                                <button type="submit" className="auth-next-btn" disabled={loading}>
                                    {loading ? 'Sending…' : 'Next'}
                                </button>
                            </div>
                        </form>
                    )}

                    {message && (
                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <Link to="/reset-password" style={{ 
                                color: 'var(--accent)', 
                                textDecoration: 'none',
                                fontWeight: 500
                            }}>
                                Have a reset token? Click here
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
