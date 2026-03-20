import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const COLORS = ['#1a73e8', '#e37400', '#188038', '#d93025', '#9c27b0', '#00897b', '#f4511e'];

function avatarColor(s) {
    let h = 0; for (let c of (s || 'A')) h = c.charCodeAt(0) + ((h << 5) - h);
    return COLORS[Math.abs(h) % COLORS.length];
}
function initials(email) {
    const n = (email || '?').split('@')[0], p = n.split(/[._\-+]/);
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : n.slice(0, 2).toUpperCase();
}
function riskClass(s) { return s < 30 ? 'safe' : s < 70 ? 'suspicious' : 'phishing'; }
function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function EmailDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/api/emails/${id}`)
            .then(r => setEmail(r.data))
            .catch(() => setError('Could not load email.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="detail-page">
            <header className="app-header">
                <button className="header-menu-btn" onClick={() => navigate('/inbox')}>
                    <span className="material-icons">arrow_back</span>
                </button>
            </header>
            <div className="detail-main">
                {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton-pulse sk-line" style={{ width: `${75 - i * 15}%`, height: 16, marginBottom: 16 }} />
                ))}
            </div>
        </div>
    );

    if (error) return (
        <div className="detail-page">
            <header className="app-header">
                <button className="header-menu-btn" onClick={() => navigate('/inbox')}>
                    <span className="material-icons">arrow_back</span>
                </button>
            </header>
            <div className="detail-main">
                <div className="global-err-banner">{error}</div>
            </div>
        </div>
    );

    const score = email?.riskScore ?? 0;
    const rc = riskClass(score);
    const sender = email?.sender || email?.from || '';

    return (
        <div className="detail-page">
            {/* HEADER */}
            <header className="app-header">
                <button className="header-menu-btn" onClick={() => navigate('/inbox')}>
                    <span className="material-icons">arrow_back</span>
                </button>
                <div className="header-logo">
                    <div className="header-logo-text">
                        <div className="logo-secure">
                            <span className="logo-s">S</span><span className="logo-e">e</span>
                            <span className="logo-c">c</span><span className="logo-u">u</span>
                            <span className="logo-r">r</span><span className="logo-e2">e</span>
                        </div>
                        <span className="logo-mail">Mail</span>
                    </div>
                </div>
                <div style={{ flex: 1 }} />
                <div className="header-right">
                    <button className="hdr-btn" title="Archive">
                        <span className="material-icons">archive</span>
                    </button>
                    <button className="hdr-btn" title="Report spam">
                        <span className="material-icons">report</span>
                    </button>
                    <button className="hdr-btn" title="Delete">
                        <span className="material-icons">delete</span>
                    </button>
                    <button className="hdr-btn" title="Mark as unread">
                        <span className="material-icons">mark_email_unread</span>
                    </button>
                    <button className="hdr-btn" title="Snooze">
                        <span className="material-icons">schedule</span>
                    </button>
                    <button className="hdr-btn" title="More">
                        <span className="material-icons">more_vert</span>
                    </button>
                </div>
            </header>

            <div className="detail-main">
                {/* SUBJECT */}
                <div className="detail-subject-bar">
                    <span className="detail-subject-text">{email?.subject || '(no subject)'}</span>
                    {email?.riskScore !== undefined && (
                        <span className={`risk-chip ${rc}`} style={{ fontSize: 13, padding: '4px 12px' }}>
                            {rc === 'safe' ? 'Safe' : rc === 'suspicious' ? 'Suspicious' : 'Phishing'}
                        </span>
                    )}
                    <button className="hdr-btn" title="Print">
                        <span className="material-icons">print</span>
                    </button>
                    <button className="hdr-btn" title="New window">
                        <span className="material-icons">open_in_new</span>
                    </button>
                </div>

                {/* SECURITY CARD */}
                {email?.riskScore !== undefined && (
                    <div className="security-card">
                        <div className="security-card-title">
                            <span className="material-icons" style={{ fontSize: 16, color: rc === 'safe' ? 'var(--success)' : rc === 'suspicious' ? 'var(--warning)' : 'var(--danger)' }}>
                                {rc === 'safe' ? 'verified_user' : rc === 'suspicious' ? 'warning' : 'gpp_bad'}
                            </span>
                            Security Analysis
                        </div>
                        <div className="risk-bar-wrap">
                            <div className="risk-bar-track">
                                <div className={`risk-bar-fill ${rc}`} style={{ width: `${score}%` }} />
                            </div>
                            <div className="risk-bar-labels">
                                <span>Risk Score: <strong>{score}/100</strong></span>
                                {email?.mlConfidence !== undefined && (
                                    <span>ML Confidence: <strong>{Math.round(email.mlConfidence * 100)}%</strong></span>
                                )}
                            </div>
                        </div>
                        {email?.threatReasons?.length > 0 && (
                            <div className="threat-list">
                                <h4>Threat Indicators</h4>
                                {email.threatReasons.slice(0, 3).map((r, i) => (
                                    <div key={i} className="threat-item">
                                        <span className="material-icons">warning_amber</span>
                                        {r}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* MESSAGE CARD */}
                <div className="detail-msg-card">
                    <div className="detail-msg-header">
                        <div className="ei-avatar" style={{
                            background: avatarColor(sender), width: 40, height: 40,
                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontFamily: 'Google Sans',
                            fontSize: 16, fontWeight: 500, color: '#fff', flexShrink: 0
                        }}>
                            {initials(sender)}
                        </div>
                        <div className="detail-sender-info">
                            <div className="detail-sender-name">
                                {email?.senderName || sender.split('@')[0]}
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 400 }}>
                                    &lt;{sender}&gt;
                                </span>
                            </div>
                            <div className="detail-sender-email">to me</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <span className="detail-msg-date">{fmtDate(email?.createdAt || email?.date)}</span>
                            <button className="hdr-btn"><span className="material-icons" style={{ fontSize: 20 }}>star_border</span></button>
                            <button className="hdr-btn"><span className="material-icons" style={{ fontSize: 20 }}>reply</span></button>
                            <button className="hdr-btn"><span className="material-icons" style={{ fontSize: 20 }}>more_vert</span></button>
                        </div>
                    </div>
                    <div className="detail-msg-body">
                        {email?.body || email?.content || 'No content.'}
                    </div>
                </div>

                {/* REPLY BOX */}
                <div style={{
                    border: '1px solid var(--border-light)', borderRadius: 8,
                    padding: '16px 24px', background: 'var(--surface)',
                    display: 'flex', alignItems: 'center', gap: 12,
                    color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer'
                }}>
                    <span className="material-icons">reply</span>
                    Click here to Reply, Reply all, or Forward
                </div>
            </div>
        </div>
    );
}