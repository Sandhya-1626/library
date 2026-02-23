import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Trash2, Plus, Users, BookOpen, Bell, Upload,
    Star, LogOut, Library, BarChart2, MessageSquare,
    BookMarked, ShieldCheck, TrendingUp, RefreshCw,
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const CHART_OPTS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(13,15,43,0.95)',
            titleColor: '#818cf8',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(99,102,241,0.3)',
            borderWidth: 1,
        },
    },
    scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
};

const DOUGHNUT_OPTS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 14, font: { size: 12 } } },
        tooltip: {
            backgroundColor: 'rgba(13,15,43,0.95)',
            titleColor: '#818cf8',
            bodyColor: '#cbd5e1',
        },
    },
};

const NAV = [
    { key: 'overview', icon: BarChart2, label: 'Overview' },
    { key: 'books', icon: BookOpen, label: 'Manage Books' },
    { key: 'notifs', icon: Bell, label: 'Pre-Bookings' },
    { key: 'feedback', icon: MessageSquare, label: 'Feedback' },
];

const AdminDashboard = ({ onLogout }) => {
    const [activeNav, setActiveNav] = useState('overview');
    const [stats, setStats] = useState(null);
    const [notifs, setNotifs] = useState([]);
    const [books, setBooks] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [newBook, setNewBook] = useState({ title: '', category: '', pages: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [adding, setAdding] = useState(false);
    const [addSuccess, setAddSuccess] = useState(false);

    const fetchData = async () => {
        try {
            const [s, n, b, f] = await Promise.all([
                axios.get('/api/admin/stats'),
                axios.get('/api/admin/notifications'),
                axios.get('/api/books'),
                axios.get('/api/admin/feedbacks'),
            ]);
            setStats(s.data);
            setNotifs(n.data);
            setBooks(b.data);
            setFeedbacks(f.data);
        } catch {/* ignore */ }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 8000);
        return () => clearInterval(interval);
    }, []);

    const handleAddBook = async () => {
        if (!newBook.title || !newBook.category) return;
        setAdding(true);
        const formData = new FormData();
        formData.append('title', newBook.title);
        formData.append('category', newBook.category);
        formData.append('pages', newBook.pages);
        if (selectedFile) formData.append('bookFile', selectedFile);

        await axios.post('/api/books', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        await fetchData();
        setNewBook({ title: '', category: '', pages: '' });
        setSelectedFile(null);
        setAdding(false);
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 2500);
    };

    const handleDeleteBook = async (id) => {
        if (!window.confirm('Delete this book?')) return;
        await axios.delete(`/api/books/${id}`);
        await fetchData();
    };

    if (!stats) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.3)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    Loading dashboard…
                </div>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    const barData = {
        labels: Object.keys(stats.deptWiseLogins),
        datasets: [{
            label: 'Logins',
            data: Object.values(stats.deptWiseLogins),
            backgroundColor: ['#6366f1', '#a855f7', '#06b6d4', '#f59e0b', '#10b981'].map(c => c + '99'),
            borderColor: ['#6366f1', '#a855f7', '#06b6d4', '#f59e0b', '#10b981'],
            borderWidth: 2,
            borderRadius: 8,
        }],
    };

    const doughnutData = {
        labels: Object.keys(stats.deptWiseLogins),
        datasets: [{
            data: Object.values(stats.deptWiseLogins),
            backgroundColor: ['#6366f155', '#a855f755', '#06b6d455', '#f59e0b55', '#10b98155'],
            borderColor: ['#6366f1', '#a855f7', '#06b6d4', '#f59e0b', '#10b981'],
            borderWidth: 2,
        }],
    };

    const avgFeedbackRating = feedbacks.length
        ? (feedbacks.reduce((sum, f) => sum + Number(f.rating), 0) / feedbacks.length).toFixed(1)
        : 'N/A';

    return (
        <div className="dashboard" style={{ width: '100%' }}>

            {/* ── Sidebar ── */}
            <aside className="sidebar">
                <div className="sidebar__logo">
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Library size={20} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Smart Library</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Admin Panel</div>
                    </div>
                </div>

                {/* Admin badge */}
                <div style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.20)', borderRadius: 12, padding: '10px 14px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ShieldCheck size={17} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>Administrator</div>
                        <span className="badge badge--primary" style={{ marginTop: 2 }}>Active</span>
                    </div>
                </div>

                <div className="section-label">Management</div>
                {NAV.map(({ key, icon: Icon, label }) => (
                    <div
                        key={key}
                        className={`sidebar__nav-item ${activeNav === key ? 'active' : ''}`}
                        onClick={() => setActiveNav(key)}
                    >
                        <Icon size={17} />
                        {label}
                        {key === 'notifs' && notifs.length > 0 && (
                            <span style={{ marginLeft: 'auto', background: '#06b6d4', color: '#fff', fontSize: '0.68rem', fontWeight: 700, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {notifs.length}
                            </span>
                        )}
                    </div>
                ))}

                <div style={{ flex: 1 }} />

                <button
                    onClick={() => fetchData()}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', width: '100%', boxShadow: 'none', fontSize: '0.85rem', marginBottom: 10 }}
                >
                    <RefreshCw size={15} />Refresh Data
                </button>

                <button
                    onClick={onLogout}
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', width: '100%', boxShadow: 'none', fontSize: '0.88rem' }}
                >
                    <LogOut size={16} />Logout
                </button>
            </aside>

            {/* ── Main Content ── */}
            <main className="dashboard__main">

                {/* ── Overview ── */}
                {activeNav === 'overview' && (
                    <>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
                                Dashboard <span className="text-gradient">Overview</span>
                            </h2>
                            <p style={{ color: 'var(--text-muted)' }}>Real-time library analytics and activity</p>
                        </div>

                        {/* Stat cards */}
                        <div className="grid-4" style={{ marginBottom: '2rem' }}>
                            {[
                                { label: 'Total Logins', value: stats.totalLogins, icon: '👥', color: '#6366f1' },
                                { label: 'Total Books', value: books.length, icon: '📚', color: '#a855f7' },
                                { label: 'Pre-Bookings', value: notifs.length, icon: '🔖', color: '#06b6d4' },
                                { label: 'Avg. Rating', value: avgFeedbackRating, icon: '⭐', color: '#f59e0b' },
                            ].map(s => (
                                <div key={s.label} className="stat-card">
                                    <div className="stat-card__icon" style={{ background: `${s.color}22` }}>
                                        <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
                                    </div>
                                    <div className="stat-card__value text-gradient">{s.value}</div>
                                    <div className="stat-card__label">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Charts */}
                        <div className="grid-2" style={{ marginBottom: '2rem' }}>
                            <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.2rem' }}>
                                    <BarChart2 size={18} color="#818cf8" />
                                    <h3 style={{ fontSize: '1rem', margin: 0 }}>Logins by Department</h3>
                                </div>
                                <div style={{ height: 220 }}>
                                    <Bar data={barData} options={CHART_OPTS} />
                                </div>
                            </div>

                            <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.2rem' }}>
                                    <TrendingUp size={18} color="#a855f7" />
                                    <h3 style={{ fontSize: '1rem', margin: 0 }}>Department Share</h3>
                                </div>
                                <div style={{ height: 220 }}>
                                    <Doughnut data={doughnutData} options={DOUGHNUT_OPTS} />
                                </div>
                            </div>
                        </div>

                        {/* Recent usage */}
                        {stats.studentUsage?.length > 0 && (
                            <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.2rem' }}>
                                    <Users size={18} color="#06b6d4" />
                                    <h3 style={{ fontSize: '1rem', margin: 0 }}>Recent Student Sessions</h3>
                                </div>
                                <div className="table-wrap">
                                    <table>
                                        <thead>
                                            <tr><th>Student</th><th>Session Duration</th><th>Date</th></tr>
                                        </thead>
                                        <tbody>
                                            {stats.studentUsage.slice(-10).reverse().map((s, i) => (
                                                <tr key={i}>
                                                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                                                    <td>{Math.floor(s.duration / 60)}m {s.duration % 60}s</td>
                                                    <td style={{ color: 'var(--text-muted)' }}>{s.date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ── Manage Books ── */}
                {activeNav === 'books' && (
                    <>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
                                Manage <span className="text-gradient">Books</span>
                            </h2>
                            <p style={{ color: 'var(--text-muted)' }}>{books.length} books in the collection</p>
                        </div>

                        {/* Add Book Form */}
                        <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: '1.75rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                                <Plus size={18} color="#818cf8" />
                                <h3 style={{ fontSize: '1rem', margin: 0 }}>Add New Book</h3>
                            </div>

                            <div className="grid-2" style={{ marginBottom: '1rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Book Title *</label>
                                    <input placeholder="e.g. Introduction to Algorithms" value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Category / Subject *</label>
                                    <input placeholder="e.g. Computer Science" value={newBook.category} onChange={e => setNewBook({ ...newBook, category: e.target.value })} />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '1rem' }}>
                                <label>Content / Summary <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional — use double blank line to separate pages)</span></label>
                                <textarea
                                    placeholder="Book description or content..."
                                    value={newBook.pages}
                                    onChange={e => setNewBook({ ...newBook, pages: e.target.value })}
                                    style={{ height: 100, resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                                        <Upload size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />Upload File (PDF/TXT)
                                    </label>
                                    <input type="file" accept=".pdf,.txt" onChange={e => setSelectedFile(e.target.files[0])} style={{ width: 'auto', padding: '0.4rem' }} />
                                </div>
                                <button
                                    onClick={handleAddBook}
                                    disabled={adding || !newBook.title || !newBook.category}
                                    style={{ width: 'auto', padding: '0.75rem 2rem', marginTop: '1.4rem', opacity: (!newBook.title || !newBook.category) ? 0.5 : 1 }}
                                >
                                    {adding ? 'Adding…' : <><Plus size={16} />Add Book</>}
                                </button>
                                {addSuccess && (
                                    <span style={{ color: '#10b981', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: '1.4rem' }}>
                                        ✅ Book added successfully!
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Book list */}
                        <div style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: '1.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                                <BookMarked size={18} color="#a855f7" />
                                <h3 style={{ fontSize: '1rem', margin: 0 }}>All Books</h3>
                            </div>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr><th>#</th><th>Title</th><th>Category</th><th>Rating</th><th>Action</th></tr>
                                    </thead>
                                    <tbody>
                                        {books.slice(0, 100).map((b, i) => {
                                            const avg = b.ratings?.length
                                                ? (b.ratings.reduce((a, c) => a + c, 0) / b.ratings.length).toFixed(1)
                                                : null;
                                            return (
                                                <tr key={b.id}>
                                                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                                    <td style={{ fontWeight: 600, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</td>
                                                    <td><span className="badge badge--primary">{b.category}</span></td>
                                                    <td>
                                                        {avg ? (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                                                                <span style={{ color: '#f59e0b', fontWeight: 600 }}>{avg}</span>
                                                            </span>
                                                        ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleDeleteBook(b.id)}
                                                            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', padding: '0.35rem 0.8rem', fontSize: '0.8rem', width: 'auto', boxShadow: 'none' }}
                                                        >
                                                            <Trash2 size={13} />Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {books.length > 100 && (
                                            <tr>
                                                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                    … and {books.length - 100} more books
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ── Pre-Bookings ── */}
                {activeNav === 'notifs' && (
                    <>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
                                Pre-Booking <span className="text-gradient">Requests</span>
                            </h2>
                            <p style={{ color: 'var(--text-muted)' }}>{notifs.length} pending request{notifs.length !== 1 ? 's' : ''}</p>
                        </div>

                        {notifs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                                <Bell size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                                <p>No pre-booking requests yet.</p>
                            </div>
                        ) : (
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr><th>#</th><th>Student</th><th>Book</th><th>Requested At</th><th>Status</th></tr>
                                    </thead>
                                    <tbody>
                                        {notifs.map((n, i) => (
                                            <tr key={i}>
                                                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                                <td style={{ fontWeight: 600 }}>{n.studentName}</td>
                                                <td>{n.bookTitle}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{new Date(n.time).toLocaleString()}</td>
                                                <td><span className="badge badge--accent">Pending</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* ── Feedback ── */}
                {activeNav === 'feedback' && (
                    <>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
                                Student <span className="text-gradient">Feedback</span>
                            </h2>
                            <p style={{ color: 'var(--text-muted)' }}>
                                {feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''} · Avg rating: <strong style={{ color: '#f59e0b' }}>{avgFeedbackRating}</strong>
                            </p>
                        </div>

                        {feedbacks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                                <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                                <p>No feedback submitted yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {feedbacks.map((f, i) => (
                                    <div key={i} style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                                            <div>
                                                <span style={{ fontWeight: 700, color: '#818cf8' }}>{f.studentName}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> · {f.bookTitle}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} size={14} fill={s <= f.rating ? '#f59e0b' : 'none'} stroke={s <= f.rating ? '#f59e0b' : 'rgba(255,255,255,0.15)'} />
                                                ))}
                                                <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600, marginLeft: 4 }}>{f.rating}</span>
                                            </div>
                                        </div>
                                        {f.message && (
                                            <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', margin: '0 0 8px', fontSize: '0.9rem' }}>"{f.message}"</p>
                                        )}
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{new Date(f.date).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default AdminDashboard;
