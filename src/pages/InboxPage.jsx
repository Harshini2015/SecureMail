import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import EmailListItem from '../components/EmailListItem';

const TABS = [
    { key: 'primary', label: 'Primary', icon: 'inbox' },
    { key: 'promotions', label: 'Promotions', icon: 'local_offer' },
    { key: 'jobs', label: 'Jobs', icon: 'work' },
    { key: 'personal', label: 'Personal', icon: 'person' },
    { key: 'spam', label: 'Spam', icon: 'report' },
    { key: 'phishing', label: 'Phishing', icon: 'phishing' },
];

const NAV = [
    { icon: 'inbox', label: 'Inbox', key: 'inbox', count: true },
    { icon: 'star_border', label: 'Starred', key: 'starred' },
    { icon: 'schedule', label: 'Snoozed', key: 'snoozed' },
    { icon: 'send', label: 'Sent', key: 'sent' },
    { icon: 'drafts', label: 'Drafts', key: 'drafts' },
    { icon: 'expand_more', label: 'More', key: 'more' },
];

function SkeletonRow() {
    return (
        <div className="skeleton-row">
            <div style={{ width: 40, height: 40 }} />
            <div style={{ width: 32, height: 40 }} />
            <div className="skeleton-pulse sk-circle" style={{ marginRight: 12, marginLeft: 4 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton-pulse sk-line" style={{ width: '25%' }} />
                <div className="skeleton-pulse sk-line" style={{ width: '65%' }} />
            </div>
            <div className="skeleton-pulse sk-line" style={{ width: 32 }} />
        </div>
    );
}

export default function InboxPage() {
    const [activeTab, setActiveTab] = useState('primary');
    const [activeNav, setActiveNav] = useState('inbox');
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.toggle('dark', dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    }, [dark]);

    const fetchEmails = useCallback(async (cat) => {
        setLoading(true); setError(''); setEmails([]);
        try {
            const res = await api.get(`/api/emails?category=${cat}&page=1&limit=20`);
            setEmails(res.data.emails || res.data || []);
        } catch {
            setError('Could not load emails. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEmails(activeTab); }, [activeTab, fetchEmails]);

    const handleClick = async (email) => {
        try {
            const res = await api.get(`/api/emails/${email._id}`);
            navigate(res.data.isBlocked ? `/phishing-warning/${email._id}` : `/email/${email._id}`);
        } catch {
            navigate(`/email/${email._id}`);
        }
    };

    const userInitial = (user?.email || 'U')[0].toUpperCase();

    return (
        <div className="app-root">
            {/* HEADER */}
            <header className="app-header">
                <button className="header-menu-btn">
                    <span className="material-icons" style={{ fontSize: 24 }}>menu</span>
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

                <div className="header-search">
                    <div className="search-box">
                        <span className="material-icons" style={{ fontSize: 24 }}>search</span>
                        <input placeholder="Search mail" />
                        <button className="search-options-btn">
                            <span className="material-icons" style={{ fontSize: 20 }}>tune</span>
                        </button>
                    </div>
                </div>

                <div className="header-right">
                    <button className="hdr-btn" onClick={() => setDark(d => !d)} title={dark ? 'Light mode' : 'Dark mode'}>
                        <span className="material-icons" style={{ fontSize: 24 }}>{dark ? 'light_mode' : 'dark_mode'}</span>
                    </button>
                    <button className="hdr-btn">
                        <span className="material-icons" style={{ fontSize: 24 }}>help_outline</span>
                    </button>
                    <button className="hdr-btn">
                        <span className="material-icons" style={{ fontSize: 24 }}>settings</span>
                    </button>
                    <button className="hdr-btn">
                        <span className="material-icons" style={{ fontSize: 24 }}>apps</span>
                    </button>
                    <button
                        className="avatar-circle"
                        onClick={() => { logout(); navigate('/login'); }}
                        title={`Signed in as ${user?.email} — Click to sign out`}
                    >
                        {userInitial}
                    </button>
                </div>
            </header>

            <div className="app-body">
                {/* SIDEBAR */}
                <nav className="sidebar">
                    <button className="compose-btn">
                        <span className="material-icons">edit</span>
                        Compose
                    </button>
                    {NAV.map(item => (
                        <div
                            key={item.key}
                            className={`nav-link${activeNav === item.key ? ' active' : ''}`}
                            onClick={() => setActiveNav(item.key)}
                        >
                            <span className="material-icons">{item.icon}</span>
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.count && activeNav === 'inbox' && emails.filter(e => !e.isRead).length > 0 && (
                                <span className="nav-count">{emails.filter(e => !e.isRead).length}</span>
                            )}
                        </div>
                    ))}
                </nav>

                {/* MAIN */}
                <div className="main-panel">
                    {/* TABS */}
                    <div className="inbox-tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                className={`inbox-tab${activeTab === tab.key ? ' active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                <span className="material-icons">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* TOOLBAR */}
                    <div className="list-toolbar">
                        <div className="toolbar-check">
                            <div className="cb-wrap">
                                <input type="checkbox" />
                            </div>
                            <button className="toolbar-icon-btn">
                                <span className="material-icons" style={{ fontSize: 18 }}>arrow_drop_down</span>
                            </button>
                        </div>
                        <button className="toolbar-icon-btn" onClick={() => fetchEmails(activeTab)} title="Refresh">
                            <span className="material-icons">refresh</span>
                        </button>
                        <button className="toolbar-icon-btn">
                            <span className="material-icons">more_vert</span>
                        </button>
                        <div className="toolbar-sep" />
                        <div className="toolbar-right">
                            {!loading && <span>1–{emails.length} of {emails.length}</span>}
                            <button className="toolbar-icon-btn">
                                <span className="material-icons">chevron_left</span>
                            </button>
                            <button className="toolbar-icon-btn">
                                <span className="material-icons">chevron_right</span>
                            </button>
                        </div>
                    </div>

                    {/* EMAIL LIST */}
                    <div className="email-list">
                        {loading && [1, 2, 3, 4, 5, 6, 7].map(i => <SkeletonRow key={i} />)}

                        {!loading && error && (
                            <div className="empty-box">
                                <span className="material-icons">error_outline</span>
                                <h3>Something went wrong</h3>
                                <p>{error}</p>
                            </div>
                        )}

                        {!loading && !error && emails.length === 0 && (
                            <div className="empty-box">
                                <span className="material-icons">inbox</span>
                                <h3>No conversations here</h3>
                                <p>Emails that arrive in {activeTab} will appear here.</p>
                            </div>
                        )}

                        {!loading && !error && emails.map(email => (
                            <EmailListItem key={email._id} email={email} onClick={handleClick} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}