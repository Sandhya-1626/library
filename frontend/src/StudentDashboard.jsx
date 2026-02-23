import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Clock, BookOpen, Search, LogOut, Star, X,
    Library, User, BarChart2, Download, Sparkles,
    TrendingUp, FileText, Bookmark, BookMarked,
    ChevronLeft, ChevronRight,
} from 'lucide-react';

/* ────────────────────────────────────────────────────
   Cover gradient helper
──────────────────────────────────────────────────── */
const PALETTES = [
    ['#6366f1', '#a855f7'], ['#0ea5e9', '#06b6d4'],
    ['#f59e0b', '#ef4444'], ['#10b981', '#14b8a6'],
    ['#8b5cf6', '#ec4899'], ['#3b82f6', '#6366f1'],
];
function coverGradient(id) {
    const seed = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const [c1, c2] = PALETTES[seed % PALETTES.length];
    return `linear-gradient(135deg, ${c1}, ${c2})`;
}

/* ────────────────────────────────────────────────────
   BookCard — defined OUTSIDE the parent component
──────────────────────────────────────────────────── */
function BookCard({ book, idx, onRead, onDownload, onPreBook, downloading }) {
    const avg = book.ratings?.length
        ? (book.ratings.reduce((a, b) => a + b, 0) / book.ratings.length).toFixed(1)
        : null;

    return (
        <div className="book-card" style={{ animationDelay: `${Math.min(idx, 12) * 0.05}s` }}>
            {/* Cover */}
            <div className="book-card__cover" style={{ background: coverGradient(book.id) }}>
                <span style={{ fontSize: '2.5rem' }}>{book.cover || '📖'}</span>
                {book.isEbook && (
                    <div style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'rgba(16,185,129,0.92)', color: '#fff',
                        fontSize: '0.60rem', fontWeight: 700, padding: '3px 8px',
                        borderRadius: 999, letterSpacing: '0.05em',
                    }}>E-BOOK</div>
                )}
            </div>

            {/* Info */}
            <div>
                <div className="book-card__title">{book.title}</div>
                <div className="book-card__category">
                    {book.category}
                    {book.author && <span style={{ color: 'var(--text-muted)' }}> · {book.author}</span>}
                </div>
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Star size={13} fill="#f59e0b" stroke="#f59e0b" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f59e0b' }}>
                    {avg ?? 'New'}
                </span>
                {book.ratings?.length > 0 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ({book.ratings.length})
                    </span>
                )}
                {book.isEbook && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#10b981' }}>
                        {book.pages.length} pages
                    </span>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 'auto' }}>
                <button
                    id={`read-btn-${book.id}`}
                    onClick={() => onRead(book)}
                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.82rem', width: '100%' }}
                >
                    <BookOpen size={14} /> Read Online
                </button>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: book.isEbook ? '1fr 1fr' : '1fr',
                    gap: 6,
                }}>
                    {book.isEbook && (
                        <button
                            id={`dl-btn-${book.id}`}
                            onClick={() => onDownload(book)}
                            disabled={downloading === book.id}
                            style={{
                                padding: '0.5rem 0.4rem', fontSize: '0.78rem',
                                background: downloading === book.id
                                    ? 'rgba(16,185,129,0.4)'
                                    : 'linear-gradient(135deg,#10b981,#059669)',
                                boxShadow: '0 2px 8px rgba(16,185,129,0.30)',
                            }}
                        >
                            <Download size={13} />
                            {downloading === book.id ? '…' : 'Download'}
                        </button>
                    )}
                    <button
                        id={`prebook-btn-${book.id}`}
                        onClick={() => onPreBook(book)}
                        style={{
                            padding: '0.5rem 0.4rem', fontSize: '0.78rem',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-primary)', boxShadow: 'none',
                        }}
                    >
                        <Bookmark size={13} /> Pre-Book
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────
   Custom Book Reader Modal (no external lib)
──────────────────────────────────────────────────── */
function BookReader({ book, onClose, onRate, onDownload, downloading }) {
    const [page, setPage] = useState(0);
    const [animDir, setAnimDir] = useState('');
    // page 0 = cover, page 1..n = content pages
    const totalPages = book.pages.length;
    const displayPage = page; // 0=cover

    const goNext = useCallback(() => {
        if (page < totalPages) {
            setAnimDir('left');
            setTimeout(() => { setPage(p => p + 1); setAnimDir(''); }, 180);
        }
    }, [page, totalPages]);

    const goPrev = useCallback(() => {
        if (page > 0) {
            setAnimDir('right');
            setTimeout(() => { setPage(p => p - 1); setAnimDir(''); }, 180);
        }
    }, [page]);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [goNext, goPrev, onClose]);

    const isCover = page === 0;
    const isLast = page === totalPages;
    const content = isCover ? null : book.pages[page - 1];
    const progress = Math.round((page / totalPages) * 100);

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(2,3,16,0.97)',
                display: 'flex', flexDirection: 'column',
                animation: 'fadeIn 0.25s ease',
            }}
        >
            {/* ── Top bar ── */}
            <div style={{
                height: 64, flexShrink: 0,
                background: 'rgba(4,5,26,0.90)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.5rem', gap: 12,
            }}>
                {/* Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <BookOpen size={18} color="#a855f7" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {book.title}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
                            Page {page} of {totalPages} · {book.category}
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {book.isEbook && (
                        <button
                            onClick={() => onDownload(book)}
                            disabled={downloading === book.id}
                            style={{
                                padding: '0.45rem 1rem', fontSize: '0.8rem', width: 'auto',
                                background: 'linear-gradient(135deg,#10b981,#059669)',
                                boxShadow: '0 2px 10px rgba(16,185,129,0.3)',
                            }}
                        >
                            <Download size={14} />
                            {downloading === book.id ? 'Saving…' : 'Download'}
                        </button>
                    )}
                    <button
                        onClick={onRate}
                        style={{
                            padding: '0.45rem 1rem', fontSize: '0.8rem', width: 'auto',
                            background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                            boxShadow: '0 2px 10px rgba(245,158,11,0.25)',
                        }}
                    >
                        <Star size={14} /> Rate
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.45rem 1rem', fontSize: '0.8rem', width: 'auto',
                            background: 'rgba(239,68,68,0.12)',
                            border: '1px solid rgba(239,68,68,0.30)',
                            color: '#fca5a5', boxShadow: 'none',
                        }}
                    >
                        <X size={14} /> Close
                    </button>
                </div>
            </div>

            {/* ── Progress bar ── */}
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{
                    height: '100%', width: `${progress}%`,
                    background: 'linear-gradient(90deg,#6366f1,#a855f7)',
                    transition: 'width 0.3s ease',
                }} />
            </div>

            {/* ── Page area ── */}
            <div style={{
                flex: 1, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1.5rem 1rem',
                gap: '1.5rem',
            }}>
                {/* Prev button */}
                <button
                    onClick={goPrev}
                    disabled={page === 0}
                    style={{
                        flexShrink: 0, width: 48, height: 48, borderRadius: '50%',
                        background: page === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.2)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: page === 0 ? 'not-allowed' : 'pointer',
                        opacity: page === 0 ? 0.3 : 1,
                        boxShadow: 'none', padding: 0,
                        transition: 'all 0.2s',
                    }}
                >
                    <ChevronLeft size={22} color="#818cf8" />
                </button>

                {/* Page content */}
                <div style={{
                    width: '100%', maxWidth: 760,
                    height: '100%', maxHeight: 'calc(100vh - 160px)',
                    background: isCover ? coverGradient(book.id) : '#fafafa',
                    borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
                    display: 'flex', flexDirection: 'column',
                    opacity: animDir ? 0 : 1,
                    transform: animDir === 'left' ? 'translateX(-12px)' : animDir === 'right' ? 'translateX(12px)' : 'none',
                    transition: 'opacity 0.18s ease, transform 0.18s ease',
                }}>
                    {isCover ? (
                        /* ── Cover ── */
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            padding: '3rem 2.5rem', textAlign: 'center',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{ fontSize: '5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }}>
                                {book.cover || '📖'}
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.3, fontFamily: 'Inter, sans-serif' }}>
                                {book.title}
                            </h2>
                            {book.author && (
                                <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '0.4rem' }}>by {book.author}</p>
                            )}
                            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>{book.category}</p>
                            {book.isEbook && (
                                <div style={{
                                    marginTop: '1.5rem', padding: '8px 20px', borderRadius: 999,
                                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                                    color: '#fff', fontSize: '0.82rem', fontWeight: 600,
                                }}>
                                    ✅ Full E-Book · {totalPages} pages
                                </div>
                            )}
                            <div style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
                                Press → or click Next to start reading
                            </div>
                        </div>
                    ) : isLast ? (
                        /* ── End page ── */
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            padding: '3rem', textAlign: 'center',
                            background: 'linear-gradient(135deg,#f0f4ff,#fdf4ff)',
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                            <h3 style={{ color: '#1e293b', fontSize: '1.6rem', marginBottom: '0.5rem' }}>You finished it!</h3>
                            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>We hope you found "{book.title}" useful.</p>
                            <button
                                onClick={onRate}
                                style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', padding: '0.7rem 2rem', borderRadius: 999, fontSize: '0.9rem', cursor: 'pointer' }}
                            >
                                <Star size={15} /> Leave a Review
                            </button>
                        </div>
                    ) : (
                        /* ── Content page ── */
                        <div style={{
                            flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        }}>
                            {/* Page header */}
                            <div style={{
                                padding: '14px 24px 10px', borderBottom: '1px solid #e2e8f0',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: '#fff',
                            }}>
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>
                                    {book.title.toUpperCase().slice(0, 30)}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                    {page} / {totalPages}
                                </span>
                            </div>

                            {/* Text body */}
                            <div style={{
                                flex: 1, overflowY: 'auto', padding: '1.5rem 2rem',
                                fontFamily: '"Courier New", Courier, monospace',
                                fontSize: '0.88rem', lineHeight: 1.9, color: '#1e293b',
                                whiteSpace: 'pre-wrap', background: '#fff',
                            }}>
                                {content}
                            </div>

                            {/* Page footer */}
                            <div style={{
                                padding: '10px 24px', borderTop: '1px solid #e2e8f0',
                                background: '#f8fafc', display: 'flex', justifyContent: 'center',
                            }}>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    {Array.from({ length: Math.min(totalPages, 12) }).map((_, i) => {
                                        const dotPage = Math.round((i / 11) * (totalPages - 1)) + 1;
                                        return (
                                            <div
                                                key={i}
                                                onClick={() => setPage(dotPage)}
                                                style={{
                                                    width: page === dotPage ? 20 : 8,
                                                    height: 8, borderRadius: 999,
                                                    background: page === dotPage ? '#6366f1' : '#e2e8f0',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Next button */}
                <button
                    onClick={goNext}
                    disabled={isLast}
                    style={{
                        flexShrink: 0, width: 48, height: 48, borderRadius: '50%',
                        background: isLast ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.2)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: isLast ? 'not-allowed' : 'pointer',
                        opacity: isLast ? 0.3 : 1,
                        boxShadow: 'none', padding: 0,
                        transition: 'all 0.2s',
                    }}
                >
                    <ChevronRight size={22} color="#818cf8" />
                </button>
            </div>

            {/* ── Bottom keyboard hint ── */}
            <div style={{
                textAlign: 'center', padding: '0.6rem',
                fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)',
                flexShrink: 0,
            }}>
                ← → Arrow keys to navigate · Esc to close
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────
   Feedback Modal
──────────────────────────────────────────────────── */
function FeedbackModal({ book, studentName, onDone, onSkip }) {
    const [rating, setRating] = useState(5);
    const [msg, setMsg] = useState('');
    const [sent, setSent] = useState(false);

    const submit = async () => {
        await axios.post('/api/feedback', {
            studentName, bookTitle: book.title, message: msg, rating,
        });
        setSent(true);
        setTimeout(onDone, 1600);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            background: 'rgba(2,3,16,0.96)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
        }}>
            <div style={{
                background: 'rgba(13,15,43,0.98)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 24, padding: '2.5rem 2rem',
                maxWidth: 440, width: '90%', textAlign: 'center',
                boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
            }}>
                {sent ? (
                    <div style={{ padding: '1.5rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>🎉</div>
                        <h3 style={{ color: '#10b981', marginBottom: '0.4rem' }}>Thank you!</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your review has been submitted.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
                            <Star size={26} color="#fff" />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>Rate this Book</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
                            How was <strong style={{ color: '#e2e8f0' }}>{book.title}</strong>?
                        </p>

                        {/* Stars */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: '1.25rem' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star
                                    key={s} size={36}
                                    fill={s <= rating ? '#f59e0b' : 'none'}
                                    stroke={s <= rating ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
                                    style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                                    onClick={() => setRating(s)}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.25)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                                />
                            ))}
                        </div>

                        <textarea
                            value={msg}
                            onChange={e => setMsg(e.target.value)}
                            placeholder="Share your thoughts… (optional)"
                            style={{ width: '100%', height: 100, padding: '0.8rem 1rem', borderRadius: 12, fontSize: '0.88rem', resize: 'vertical' }}
                        />

                        <div style={{ display: 'flex', gap: 10, marginTop: '1rem' }}>
                            <button onClick={submit} style={{ flex: 1, padding: '0.65rem', fontSize: '0.9rem' }}>
                                Submit Review
                            </button>
                            <button
                                onClick={onSkip}
                                style={{ flex: 1, padding: '0.65rem', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', boxShadow: 'none' }}
                            >
                                Skip
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────
   Sidebar nav config
──────────────────────────────────────────────────── */
const NAV = [
    { key: 'ebooks', icon: Sparkles, label: 'E-Books Library' },
    { key: 'browse', icon: Library, label: 'All Books' },
    { key: 'prebooked', icon: BookMarked, label: 'My Pre-Bookings' },
    { key: 'stats', icon: BarChart2, label: 'My Stats' },
];

/* ────────────────────────────────────────────────────
   Main StudentDashboard
──────────────────────────────────────────────────── */
const StudentDashboard = ({ user, onLogout }) => {
    const [activeNav, setActiveNav] = useState('ebooks');
    const [timer, setTimer] = useState(0);
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('All');
    const [readingBook, setReadingBook] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [myPrebooks, setMyPrebooks] = useState([]);
    const [downloading, setDownloading] = useState(null);
    const [loadError, setLoadError] = useState('');

    /* Fetch books */
    useEffect(() => {
        axios.get('/api/books')
            .then(r => setBooks(r.data))
            .catch(() => setLoadError('Could not load books. Is the backend running?'));
    }, []);

    /* Session timer */
    useEffect(() => {
        const t = setInterval(() => setTimer(s => s + 1), 1000);
        return () => clearInterval(t);
    }, []);

    const formatTime = s => {
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    /* Handlers */
    const handleRead = useCallback((book) => {
        setReadingBook(book);
    }, []);

    const handlePreBook = useCallback(async (book) => {
        try {
            await axios.post('/api/prebook', { studentName: user.name, bookTitle: book.title });
            setMyPrebooks(prev => [...prev, { bookTitle: book.title, time: new Date() }]);
            alert(`✅ Pre-booked "${book.title}"!\nAdmin notified. Collect within 24 hours.`);
        } catch {
            alert('Pre-booking failed. Please try again.');
        }
    }, [user.name]);

    const handleDownload = useCallback(async (book) => {
        setDownloading(book.id);
        try {
            const res = await fetch(`/api/books/${book.id}/download`);
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = book.title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_') + '.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch {
            alert('Download failed. Please try again.');
        } finally {
            setDownloading(null);
        }
    }, []);

    /* Derived */
    const ebooks = books.filter(b => b.isEbook);
    const categories = ['All', ...new Set(books.map(b => b.category).filter(Boolean))];
    const filtered = books
        .filter(b => b.title?.toLowerCase().includes(search.toLowerCase()))
        .filter(b => catFilter === 'All' || b.category === catFilter)
        .slice(0, 60);

    /* ── Overlays (rendered above everything) ── */
    if (showFeedback && readingBook) {
        return (
            <FeedbackModal
                book={readingBook}
                studentName={user.name}
                onDone={() => { setShowFeedback(false); setReadingBook(null); }}
                onSkip={() => { setShowFeedback(false); setReadingBook(null); }}
            />
        );
    }

    if (readingBook) {
        return (
            <BookReader
                book={readingBook}
                downloading={downloading}
                onClose={() => setReadingBook(null)}
                onRate={() => setShowFeedback(true)}
                onDownload={handleDownload}
            />
        );
    }

    /* ── Dashboard ── */
    return (
        <div className="dashboard" style={{ width: '100%' }}>

            {/* ── Sidebar ── */}
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
                <div style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.20)', borderRadius: 14, padding: '12px 14px', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={18} color="#fff" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.rollNo} · {user.year}</div>
                        </div>
                    </div>
                </div>

                <div className="section-label">Navigation</div>
                {NAV.map(({ key, icon: Icon, label }) => (
                    <div
                        key={key}
                        className={`sidebar__nav-item ${activeNav === key ? 'active' : ''}`}
                        onClick={() => setActiveNav(key)}
                    >
                        <Icon size={17} /> {label}
                        {key === 'ebooks' && ebooks.length > 0 && (
                            <span style={{ marginLeft: 'auto', background: '#10b981', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>
                                {ebooks.length}
                            </span>
                        )}
                    </div>
                ))}

                <div style={{ flex: 1 }} />

                {/* Timer */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '12px 14px', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', marginBottom: 3 }}>
                        <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Session time
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.06em', color: '#818cf8', fontVariantNumeric: 'tabular-nums' }}>
                        {formatTime(timer)}
                    </div>
                </div>

                <button
                    onClick={() => onLogout(timer)}
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', width: '100%', boxShadow: 'none', fontSize: '0.88rem' }}
                >
                    <LogOut size={16} /> Logout
                </button>
            </aside>

            {/* ── Main Content ── */}
            <main className="dashboard__main">

                {/* Error banner */}
                {loadError && (
                    <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '0.9rem 1.2rem', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.9rem' }}>
                        ⚠️ {loadError}
                    </div>
                )}

                {/* ══ E-BOOKS TAB ══ */}
                {activeNav === 'ebooks' && (
                    <>
                        {/* Hero banner */}
                        <div style={{
                            background: 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(168,85,247,0.12))',
                            border: '1px solid rgba(99,102,241,0.25)',
                            borderRadius: 20, padding: '1.75rem 2rem',
                            marginBottom: '2rem', position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(99,102,241,0.10)' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                                    <Sparkles size={16} color="#818cf8" />
                                    <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.1em' }}>FEATURED COLLECTION</span>
                                </div>
                                <h2 style={{ fontSize: '1.65rem', marginBottom: '0.3rem' }}>
                                    📚 E-Books <span className="text-gradient">Library</span>
                                </h2>
                                <p style={{ color: 'var(--text-muted)', maxWidth: 520, fontSize: '0.9rem' }}>
                                    Read full-length educational books in your browser. Download any book for offline reading.
                                </p>
                                <div style={{ display: 'flex', gap: 10, marginTop: '1rem', flexWrap: 'wrap' }}>
                                    {[
                                        { text: `✅ ${ebooks.length} Complete E-Books`, bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.25)', color: '#10b981' },
                                        { text: '📖 Read Online', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.25)', color: '#818cf8' },
                                        { text: '⬇️ Free Download', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.25)', color: '#06b6d4' },
                                    ].map(badge => (
                                        <span key={badge.text} style={{ padding: '5px 14px', borderRadius: 999, background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color, fontSize: '0.78rem', fontWeight: 600 }}>
                                            {badge.text}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid-auto">
                            {ebooks.map((book, idx) => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    idx={idx}
                                    onRead={handleRead}
                                    onDownload={handleDownload}
                                    onPreBook={handlePreBook}
                                    downloading={downloading}
                                />
                            ))}
                        </div>

                        {/* How-to */}
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                                <FileText size={16} color="#a855f7" />
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>How to use E-Books</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.8rem' }}>
                                {[
                                    { e: '1️⃣', t: 'Click "Read Online" to open the full book reader' },
                                    { e: '2️⃣', t: 'Use ← → arrows or keyboard keys to flip pages' },
                                    { e: '3️⃣', t: 'Click "Download" to save book as a .txt file' },
                                    { e: '4️⃣', t: 'Rate the book and leave a review after reading' },
                                ].map(s => (
                                    <div key={s.e} style={{ display: 'flex', gap: 10 }}>
                                        <span style={{ fontSize: '1.1rem' }}>{s.e}</span>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{s.t}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ══ ALL BOOKS TAB ══ */}
                {activeNav === 'browse' && (
                    <>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>
                                Hello, <span className="text-gradient">{user.name.split(' ')[0]}</span> 👋
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {books.length.toLocaleString()} books · {user.department}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            <div className="search-wrap" style={{ flex: '1 1 260px', maxWidth: 440, margin: 0 }}>
                                <Search className="search-wrap__icon" size={17} />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books by title…" />
                            </div>
                            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: 'auto', minWidth: 180 }}>
                                {categories.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>

                        {filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                                <BookOpen size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                                <p>No books found.</p>
                            </div>
                        ) : (
                            <div className="grid-auto">
                                {filtered.map((book, idx) => (
                                    <BookCard
                                        key={book.id}
                                        book={book}
                                        idx={idx}
                                        onRead={handleRead}
                                        onDownload={handleDownload}
                                        onPreBook={handlePreBook}
                                        downloading={downloading}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ══ PRE-BOOKINGS TAB ══ */}
                {activeNav === 'prebooked' && (
                    <>
                        <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>My Pre-Bookings</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Books reserved for physical pickup</p>
                        {myPrebooks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                                <BookMarked size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                                <p>No pre-bookings yet.</p>
                            </div>
                        ) : (
                            <div className="table-wrap">
                                <table>
                                    <thead><tr><th>#</th><th>Book Title</th><th>Booked At</th><th>Status</th></tr></thead>
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

                {/* ══ STATS TAB ══ */}
                {activeNav === 'stats' && (
                    <>
                        <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>My Statistics</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Your activity this session</p>
                        <div className="grid-3" style={{ marginBottom: '2rem' }}>
                            {[
                                { label: 'Session Time', value: formatTime(timer), emoji: '⏱️', color: '#6366f1' },
                                { label: 'Pre-Bookings', value: myPrebooks.length, emoji: '🔖', color: '#a855f7' },
                                { label: 'Total E-Books', value: ebooks.length, emoji: '📚', color: '#10b981' },
                            ].map(s => (
                                <div key={s.label} className="stat-card">
                                    <div className="stat-card__icon" style={{ background: `${s.color}22`, fontSize: '1.3rem' }}>{s.emoji}</div>
                                    <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                                    <div className="stat-card__label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: '1.5rem', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <TrendingUp size={15} color="#818cf8" />
                                <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.88rem' }}>Your Profile</span>
                            </div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                                {user.department} · {user.year} · Roll: {user.rollNo}
                            </p>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;
