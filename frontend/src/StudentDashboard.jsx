import React, { useState, useEffect, forwardRef } from 'react';
import axios from 'axios';
import {
    Clock, BookOpen, Search, LogOut, Star, MoveHorizontal,
    BookMarked, Bookmark, ChevronRight, X, Library, User,
    Layers, TrendingUp, BarChart2,
} from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';

/* ── Flipbook page component ── */
const Page = forwardRef(({ children, number }, ref) => {
    const isUrl = typeof children === 'string' &&
        (children.startsWith('http') || /\.(png|jpg|jpeg|gif)$/i.test(children));
    return (
        <div
            className="demoPage"
            ref={ref}
            style={{
                background: '#fff',
                padding: isUrl ? 0 : '32px 28px',
                border: '1px solid #e5e7eb',
                height: '100%', width: '100%',
                color: '#1e293b',
                overflow: 'hidden',
                position: 'relative',
                fontFamily: 'Georgia, serif',
            }}
        >
            {isUrl ? (
                <img
                    src={children}
                    alt={`Page ${number}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    onError={e => { e.target.style.display = 'none'; }}
                />
            ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', lineHeight: 1.8 }}>
                        {children}
                    </div>
                </div>
            )}
            <div style={{
                position: 'absolute', bottom: 10, right: 12,
                fontSize: '0.72rem', color: '#94a3b8',
                background: 'rgba(255,255,255,0.85)', padding: '2px 8px',
                borderRadius: 999, fontFamily: 'sans-serif',
            }}>
                {number}
            </div>
        </div>
    );
});
Page.displayName = 'Page';

/* ── Colour palette for book covers ── */
const COVER_PALETTES = [
    ['#6366f1', '#a855f7'], ['#0ea5e9', '#06b6d4'], ['#f59e0b', '#ef4444'],
    ['#10b981', '#14b8a6'], ['#8b5cf6', '#ec4899'], ['#3b82f6', '#6366f1'],
];

function coverGradient(id) {
    const idx = (String(id).charCodeAt(0) || 0) % COVER_PALETTES.length;
    const [c1, c2] = COVER_PALETTES[idx];
    return `linear-gradient(135deg, ${c1}, ${c2})`;
}

/* ── Nav items ── */
const NAV = [
    { key: 'browse', icon: Library, label: 'Browse Books' },
    { key: 'prebooked', icon: Bookmark, label: 'My Pre-Bookings' },
    { key: 'stats', icon: BarChart2, label: 'My Stats' },
];

const StudentDashboard = ({ user, onLogout }) => {
    const [activeNav, setActiveNav] = useState('browse');
    const [timer, setTimer] = useState(0);
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [readingBook, setReadingBook] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [rating, setRating] = useState(5);
    const [myPrebooks, setMyPrebooks] = useState([]);
    const [feedbackSent, setFeedbackSent] = useState(false);

    useEffect(() => {
        axios.get('/api/books').then(r => setBooks(r.data)).catch(() => { });
        const t = setInterval(() => setTimer(s => s + 1), 1000);
        return () => clearInterval(t);
    }, []);

    const formatTime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    const handlePreBook = async (book) => {
        await axios.post('/api/prebook', { studentName: user.name, bookTitle: book.title });
        setMyPrebooks(prev => [...prev, { bookTitle: book.title, time: new Date() }]);
        alert(`✅ Pre-booked "${book.title}" — Admin notified! Collect within 24 hours.`);
    };

    const handleFeedbackSubmit = async () => {
        await axios.post('/api/feedback', {
            studentName: user.name,
            bookTitle: readingBook.title,
            message: feedbackMsg,
            rating,
        });
        setFeedbackSent(true);
        setTimeout(() => {
            setReadingBook(null);
            setShowFeedback(false);
            setFeedbackMsg('');
            setRating(5);
            setFeedbackSent(false);
        }, 1800);
    };

    /* derived */
    const categories = ['All', ...new Set(books.map(b => b.category).filter(Boolean))];
    const filteredBooks = books
        .filter(b => String(b.title).toLowerCase().includes(search.toLowerCase()))
        .filter(b => categoryFilter === 'All' || b.category === categoryFilter)
        .slice(0, 60);

    /* ── Feedback Screen ── */
    if (showFeedback && readingBook) {
        return (
            <div className="flipbook-overlay">
                <div style={{
                    background: 'rgba(13,15,43,0.97)', border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: 24, padding: '2.5rem', maxWidth: 480, width: '90%', textAlign: 'center',
                    animation: 'slideUp 0.4s ease',
                }}>
                    {feedbackSent ? (
                        <div style={{ padding: '2rem 0' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                            <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Thank you!</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Your review has been submitted.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Star size={28} color="#fff" />
                            </div>
                            <h3 className="text-gradient" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Rate your read</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                How was <strong style={{ color: '#fff' }}>{readingBook.title}</strong>?
                            </p>

                            {/* Star picker */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: '1.5rem' }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star
                                        key={s}
                                        size={36}
                                        fill={s <= rating ? '#f59e0b' : 'none'}
                                        stroke={s <= rating ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
                                        style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                                        onClick={() => setRating(s)}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                                    />
                                ))}
                            </div>

                            <textarea
                                value={feedbackMsg}
                                onChange={e => setFeedbackMsg(e.target.value)}
                                placeholder="Share your thoughts... (optional)"
                                style={{ width: '100%', height: 120, padding: '0.9rem', borderRadius: 12, fontSize: '0.9rem', resize: 'vertical' }}
                            />

                            <div style={{ display: 'flex', gap: 12, marginTop: '1.25rem' }}>
                                <button onClick={handleFeedbackSubmit} style={{ flex: 1 }}>Submit Review</button>
                                <button
                                    onClick={() => { setShowFeedback(false); setReadingBook(null); }}
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxShadow: 'none' }}
                                >
                                    Skip
                                </button>
                            </div>
                        </>
                    )}
                </div>
                <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
            </div>
        );
    }

    /* ── Flipbook Reader ── */
    if (readingBook) {
        const displayPages = [...readingBook.pages];
        if (displayPages.length % 2 !== 0) displayPages.push('');
        return (
            <div className="flipbook-overlay" style={{ flexDirection: 'column' }}>
                {/* Top bar */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 70,
                    background: 'rgba(4,5,26,0.85)', backdropFilter: 'blur(16px)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 2rem', zIndex: 10,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <BookOpen size={20} color="#a855f7" />
                        <h3 className="text-gradient" style={{ margin: 0, fontSize: '1.1rem' }}>{readingBook.title}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            onClick={() => setShowFeedback(true)}
                            style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', width: 'auto' }}
                        >
                            <Star size={15} style={{ marginRight: 6 }} />Rate this Book
                        </button>
                        <button
                            onClick={() => setReadingBook(null)}
                            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '0.5rem 1.2rem', fontSize: '0.85rem', width: 'auto', boxShadow: 'none' }}
                        >
                            <X size={15} style={{ marginRight: 6 }} />Close
                        </button>
                    </div>
                </div>

                {/* Flipbook */}
                <div className="book-container" style={{ marginTop: 80 }}>
                    <HTMLFlipBook
                        width={480} height={660}
                        size="stretch"
                        minWidth={280} maxWidth={960}
                        minHeight={380} maxHeight={1300}
                        maxShadowOpacity={0.5}
                        showCover mobileScrollSupport
                        className="demo-book"
                        style={{ margin: '0 auto' }}
                    >
                        {/* Cover */}
                        <Page number="Cover">
                            <div style={{
                                textAlign: 'center', height: '100%', display: 'flex',
                                flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 48,
                                background: coverGradient(readingBook.id),
                            }}>
                                <BookOpen size={72} color="rgba(255,255,255,0.9)" style={{ marginBottom: 28 }} />
                                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 12 }}>{readingBook.title}</h1>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{readingBook.category}</p>
                                <div style={{ marginTop: 'auto', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <MoveHorizontal size={14} /> Swipe corners to flip pages
                                </div>
                            </div>
                        </Page>

                        {displayPages.map((p, i) => (
                            <Page key={i} number={i + 1}>
                                {p || (i === displayPages.length - 1 ? (
                                    <div style={{ textAlign: 'center', padding: 40, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg,#f0f4ff,#fdf4ff)' }}>
                                        <BookOpen size={56} color="#6366f1" style={{ marginBottom: 20 }} />
                                        <h3 style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>End of Book</h3>
                                        <p style={{ color: '#64748b', marginBottom: 24 }}>We hope you enjoyed reading!</p>
                                        <button
                                            onClick={() => setShowFeedback(true)}
                                            style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', padding: '0.8rem 2rem', borderRadius: 999, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                        >
                                            <Star size={16} />Leave a Review
                                        </button>
                                    </div>
                                ) : '···')}
                            </Page>
                        ))}
                    </HTMLFlipBook>
                </div>

                <div style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MoveHorizontal size={14} />
                    {displayPages.length + 1} pages total
                </div>
            </div>
        );
    }

    /* ── Main Dashboard ── */
    return (
        <div className="dashboard" style={{ width: '100%' }}>

            {/* Sidebar */}
            <aside className="sidebar">
                {/* Logo */}
                <div className="sidebar__logo">
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Library size={20} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Smart Library</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Digital Collection</div>
                    </div>
                </div>

                {/* User card */}
                <div style={{
                    background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.20)',
                    borderRadius: 14, padding: '12px 14px', marginBottom: '1.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={18} color="#fff" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.rollNo} · {user.year}</div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <div className="section-label">Navigation</div>
                {NAV.map(({ key, icon: Icon, label }) => (
                    <div
                        key={key}
                        className={`sidebar__nav-item ${activeNav === key ? 'active' : ''}`}
                        onClick={() => setActiveNav(key)}
                    >
                        <Icon size={17} />
                        {label}
                    </div>
                ))}

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Session Timer */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                    borderRadius: 12, padding: '12px 14px', marginBottom: '1rem',
                }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Session time</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em', color: '#818cf8' }}>
                        {formatTime(timer)}
                    </div>
                </div>

                <button
                    onClick={() => onLogout(timer)}
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', width: '100%', boxShadow: 'none', fontSize: '0.88rem' }}
                >
                    <LogOut size={16} />Logout
                </button>
            </aside>

            {/* Main content */}
            <main className="dashboard__main">

                {/* ── Browse Books ── */}
                {activeNav === 'browse' && (
                    <>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
                                Hello, <span className="text-gradient">{user.name.split(' ')[0]}</span> 👋
                            </h2>
                            <p style={{ color: 'var(--text-muted)' }}>
                                {filteredBooks.length} books available · {user.department}
                            </p>
                        </div>

                        {/* Search + filter */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            <div className="search-wrap" style={{ flex: '1 1 260px', maxWidth: 440, margin: 0 }}>
                                <Search className="search-wrap__icon" size={17} />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search books by title…"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={e => setCategoryFilter(e.target.value)}
                                style={{ width: 'auto', minWidth: 180 }}
                            >
                                {categories.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Book grid */}
                        {filteredBooks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                                <BookOpen size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                                <p>No books found. Try a different search.</p>
                            </div>
                        ) : (
                            <div className="grid-auto">
                                {filteredBooks.map((book, idx) => {
                                    const avgRating = book.ratings?.length
                                        ? (book.ratings.reduce((a, b) => a + b, 0) / book.ratings.length).toFixed(1)
                                        : null;

                                    return (
                                        <div
                                            key={book.id}
                                            className="book-card"
                                            style={{ animationDelay: `${Math.min(idx, 15) * 0.04}s` }}
                                        >
                                            {/* Cover */}
                                            <div className="book-card__cover" style={{ background: coverGradient(book.id) }}>
                                                <BookOpen size={42} color="rgba(255,255,255,0.8)" />
                                            </div>

                                            {/* Info */}
                                            <div>
                                                <div className="book-card__title">{book.title}</div>
                                                <div className="book-card__category" style={{ marginTop: 4 }}>{book.category}</div>
                                            </div>

                                            {/* Rating */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <Star size={13} fill="#f59e0b" stroke="#f59e0b" />
                                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f59e0b' }}>
                                                    {avgRating ?? 'New'}
                                                </span>
                                                {book.ratings?.length > 0 && (
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                        ({book.ratings.length})
                                                    </span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                                                <button
                                                    onClick={() => setReadingBook(book)}
                                                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.82rem' }}
                                                >
                                                    <BookOpen size={14} />Read Online
                                                </button>
                                                <button
                                                    onClick={() => handlePreBook(book)}
                                                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.82rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', boxShadow: 'none' }}
                                                >
                                                    <Bookmark size={14} />Pre-Book
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* ── Pre-Bookings ── */}
                {activeNav === 'prebooked' && (
                    <>
                        <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>My Pre-Bookings</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Books you've reserved for physical pickup</p>

                        {myPrebooks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                                <BookMarked size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                                <p>No pre-bookings yet. Go browse and pre-book a book!</p>
                            </div>
                        ) : (
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Book Title</th>
                                            <th>Booked At</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myPrebooks.map((pb, i) => (
                                            <tr key={i}>
                                                <td>{i + 1}</td>
                                                <td style={{ fontWeight: 600 }}>{pb.bookTitle}</td>
                                                <td>{new Date(pb.time).toLocaleString()}</td>
                                                <td><span className="badge badge--accent">Pending pickup</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* ── Stats ── */}
                {activeNav === 'stats' && (
                    <>
                        <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>My Statistics</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Your reading activity this session</p>
                        <div className="grid-3" style={{ marginBottom: '2rem' }}>
                            {[
                                { label: 'Session Time', value: formatTime(timer), icon: '⏱️', color: '#6366f1' },
                                { label: 'Pre-Bookings', value: myPrebooks.length, icon: '🔖', color: '#a855f7' },
                                { label: 'Books Available', value: books.length, icon: '📚', color: '#06b6d4' },
                            ].map(s => (
                                <div key={s.label} className="stat-card" style={{ '--glow': s.color }}>
                                    <div className="stat-card__icon" style={{ background: `${s.color}22` }}>
                                        <span>{s.icon}</span>
                                    </div>
                                    <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                                    <div className="stat-card__label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: '1.5rem', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <TrendingUp size={16} color="#818cf8" />
                                <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.9rem' }}>Department</span>
                            </div>
                            <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user.department}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Year: {user.year} · Roll: {user.rollNo}</p>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;
