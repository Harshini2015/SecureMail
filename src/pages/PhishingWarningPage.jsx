import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function PhishingWarningPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bypassing, setBypassing] = useState(false);

    useEffect(() => {
        api.get(`/api/emails/${id}`)
            .then(r => setEmail(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [id]);

    const showAnyway = async () => {
        setBypassing(true);
        try { await api.patch(`/api/emails/${id}/mark-safe`); } catch { }
        navigate(`/email/${id}`);
    };

    if (loading) return (
        <div className="warning-page">
            <div className="warning-card">
                <div className="skeleton-pulse sk-line" style={{ width: '60%', height: 24, margin: '0 auto 16px' }} />
                <div className="skeleton-pulse sk-line" style={{ width: '80%', height: 14, margin: '0 auto' }} />
            </div>
        </div>
    );

    const score = email?.riskScore ?? 85;

    return (
        <div className="warning-page">
            <div className="warning-card">
                <div className="warning-icon-wrap">
                    <span className="material-icons">gpp_bad</span>
                </div>

                <h1>This email has been blocked</h1>
                <p>
                    Our security system detected that this email may be a phishing attack
                    designed to steal your personal information or account credentials.
                    Interacting with it could put your account at risk.
                </p>

                <div className="warning-score-box">
                    <span className="warning-score-label">
                        <span className="material-icons" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>warning</span>
                        Risk Score
                    </span>
                    <span className="warning-score-num">{score}<span>/100</span></span>
                </div>

                {email?.threatReasons?.length > 0 && (
                    <div className="warning-threats">
                        <h4>Why this was blocked</h4>
                        {email.threatReasons.map((r, i) => (
                            <div key={i} className="warning-threat-item">
                                <span className="material-icons">cancel</span>
                                {r}
                            </div>
                        ))}
                    </div>
                )}

                <div className="warning-actions">
                    <button className="btn-back" onClick={() => navigate('/inbox')}>
                        ← Go Back to Inbox
                    </button>
                    <button className="btn-show-anyway" onClick={showAnyway} disabled={bypassing}>
                        {bypassing ? 'Loading…' : 'I understand the risk — show email anyway'}
                    </button>
                </div>
            </div>
        </div>
    );
}