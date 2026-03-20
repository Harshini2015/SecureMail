const COLORS = [
    '#1a73e8', '#e37400', '#188038', '#d93025', '#9c27b0',
    '#00897b', '#f4511e', '#0288d1', '#c2185b', '#5d4037',
];

function avatarColor(str) {
    let h = 0;
    for (let c of (str || 'A')) h = c.charCodeAt(0) + ((h << 5) - h);
    return COLORS[Math.abs(h) % COLORS.length];
}

function initials(email) {
    const name = (email || '?').split('@')[0];
    const p = name.split(/[._\-+]/);
    if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

function timeStr(d) {
    if (!d) return '';
    const date = new Date(d), now = new Date();
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    if (now.getFullYear() === date.getFullYear()) {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function riskLevel(score) {
    if (score == null) return null;
    if (score < 30) return { label: 'Safe', cls: 'safe' };
    if (score < 70) return { label: 'Suspicious', cls: 'suspicious' };
    return { label: 'Phishing', cls: 'phishing' };
}

export default function EmailListItem({ email, onClick }) {
    const sender = email.sender || email.from || '';
    const name = email.senderName || sender.split('@')[0] || 'Unknown';
    const risk = riskLevel(email.riskScore);
    const unread = email.isRead === false;

    const cls = [
        'email-item',
        unread ? 'unread' : '',
        risk?.cls === 'phishing' ? 'phishing' : '',
        risk?.cls === 'suspicious' ? 'suspicious' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={cls} onClick={() => onClick(email)}>
            <div className="ei-check">
                <input type="checkbox" onClick={e => e.stopPropagation()} />
            </div>
            <button className={`ei-star${email.starred ? ' starred' : ''}`} onClick={e => e.stopPropagation()}>
                <span className="material-icons">{email.starred ? 'star' : 'star_border'}</span>
            </button>
            <div className="ei-avatar" style={{ background: avatarColor(sender) }}>
                {initials(sender)}
            </div>
            <div className="ei-sender">{name}</div>
            <div className="ei-content">
                <span className="ei-subject">{email.subject || '(no subject)'}</span>
                <span className="ei-preview"> – {(email.body || email.preview || '').slice(0, 100)}</span>
            </div>
            <div className="ei-right">
                {risk && <span className={`risk-chip ${risk.cls}`}>{risk.label}</span>}
                <span className="ei-time">{timeStr(email.createdAt || email.date)}</span>
            </div>
        </div>
    );
}