import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Clock, BookOpen, Search, LogOut, Star, X,
    Library, User, BarChart2, Download, Sparkles,
    TrendingUp, FileText, Bookmark, BookMarked,
    AlertCircle,
} from 'lucide-react';
import BookDetailView from './BookDetailView';

/* ── Cover gradient ── */
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

/* ══════════════════════════════════════════════════════
   BookCard — OUTSIDE parent component
══════════════════════════════════════════════════════ */
function BookCard({ book, idx, onRead, onDownload, onPreBook, downloading, bookLoading }) {
    const avg = book.ratings?.length
        ? (book.ratings.reduce((a, b) => a + b, 0) / book.ratings.length).toFixed(1)
        : null;

    return (
        <div
            className="book-card"
            style={{ animationDelay: `${Math.min(idx, 12) * 0.05}s` }}
        >
            {/* Cover */}
            <div className="book-card__cover" style={{ background: coverGradient(book.id) }}>
                <span style={{ fontSize: '2.5rem' }}>{book.cover || '📖'}</span>
                {book.isEbook && (
                    <div style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'rgba(16,185,129,0.92)', color: '#fff',
                        fontSize: '0.60rem', fontWeight: 700, padding: '3px 8px',
                        borderRadius: 999, letterSpacing: '0.05em',
                    }}>
                        E-BOOK
                    </div>
                )}
            </div>

            {/* Info */}
            <div>
                <div className="book-card__title">{book.title}</div>
                <div className="book-card__category">
                    {book.category}
                    {book.author && (
                        <span style={{ color: 'var(--text-muted)' }}> · {book.author}</span>
                    )}
                </div>
            </div>

            {/* Rating row */}
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
                <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                    {book.id?.startsWith('ebook-') && (
                        <span style={{ fontSize: '0.6rem', padding: '1px 4px', background: 'rgba(245,158,11,0.2)', border: '1px solid #f59e0b', borderRadius: 4, color: '#f59e0b' }}>PREMIUM</span>
                    )}
                    <span style={{ fontSize: '0.68rem', color: '#10b981' }}>
                        {book.pageCount > 0 ? `${book.pageCount} pages` : 'Digital'}
                    </span>
                </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 'auto' }}>
                <button
                    onClick={() => onRead(book)}
                    disabled={bookLoading === book.id}
                    style={{
                        padding: '0.55rem 0.75rem', fontSize: '0.82rem', width: '100%',
                        opacity: bookLoading === book.id ? 0.7 : 1,
                    }}
                >
                    <BookOpen size={14} />
                    {bookLoading === book.id ? 'Opening…' : 'Read Online'}
                </button>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 6,
                }}>
                    <button
                        onClick={() => onDownload(book)}
                        disabled={downloading === book.id}
                        style={{
                            padding: '0.5rem 0.4rem', fontSize: '0.78rem',
                            background: downloading === book.id
                                ? 'rgba(16,185,129,0.40)'
                                : 'linear-gradient(135deg,#10b981,#059669)',
                            boxShadow: '0 2px 8px rgba(16,185,129,0.30)',
                        }}
                    >
                        <Download size={13} />
                        {downloading === book.id ? '…' : 'Download'}
                    </button>
                    <button
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

/* ══════════════════════════════════════════════════════
   FeedbackModal — kept here, BookReader moved to BookDetailView.jsx
══════════════════════════════════════════════════════ */
// BookReader removed — now using BookDetailView component

/* ══════════════════════════════════════════════════════
   __ placeholder to preserve structure __
══════════════════════════════════════════════════════ */
function _removed_BookReader({ book, onClose, onRate, onDownload, downloading }) {
    const [page, setPage] = useState(0);
    const [sliding, setSliding] = useState(false);

    const pages = book.pages || [];
    const total = pages.length;
    const isLast = page > total;

    const go = useCallback((dir) => {
        if (sliding) return;
        if (dir > 0 && page >= total) return;
        if (dir < 0 && page <= 0) return;
        setSliding(true);
        setTimeout(() => {
            setPage(p => p + dir);
            setSliding(false);
        }, 160);
    }, [page, total, sliding]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowRight') go(1);
            else if (e.key === 'ArrowLeft') go(-1);
            else if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [go, onClose]);

    const progress = total ? Math.round((page / (total + 1)) * 100) : 0;
    const content = page === 0 ? null : page > total ? null : pages[page - 1];

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(2,3,16,0.97)',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* Top bar */}
            <div style={{
                height: 60, flexShrink: 0,
                background: 'rgba(4,5,26,0.95)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.2rem', gap: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    <BookOpen size={17} color="#a855f7" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {book.title}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {page === 0 ? 'Cover' : `Page ${page} of ${total}`} · {book.category}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                    {book.isEbook && (
                        <button
                            onClick={() => onDownload(book)}
                            disabled={downloading === book.id}
                            style={{
                                padding: '0.4rem 0.9rem', fontSize: '0.78rem', width: 'auto',
                                background: 'linear-gradient(135deg,#10b981,#059669)',
                            }}
                        >
                            <Download size={13} />
                            {downloading === book.id ? 'Saving…' : 'Download'}
                        </button>
                    )}
                    <button
                        onClick={onRate}
                        style={{
                            padding: '0.4rem 0.9rem', fontSize: '0.78rem', width: 'auto',
                            background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                        }}
                    >
                        <Star size={13} /> Rate
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '0.4rem 0.9rem', fontSize: '0.78rem', width: 'auto',
                            background: 'rgba(239,68,68,0.12)',
                            border: '1px solid rgba(239,68,68,0.30)',
                            color: '#fca5a5', boxShadow: 'none',
                        }}
                    >
                        <X size={13} /> Close
                    </button>
                </div>
            </div>

            {/* Progress */}
            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{
                    height: '100%', width: `${progress}%`,
                    background: 'linear-gradient(90deg,#6366f1,#a855f7)',
                    transition: 'width 0.3s ease',
                }} />
            </div>

            {/* Page area */}
            <div style={{
                flex: 1, overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem 0.75rem', gap: '1rem',
            }}>
                {/* Prev */}
                <button
                    onClick={() => go(-1)}
                    disabled={page === 0}
                    style={{
                        flexShrink: 0, width: 44, height: 44, borderRadius: '50%',
                        background: page === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.2)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: page === 0 ? 'not-allowed' : 'pointer',
                        opacity: page === 0 ? 0.3 : 1,
                        boxShadow: 'none', padding: 0, transition: 'all 0.2s',
                    }}
                >
                    <ChevronLeft size={20} color="#818cf8" />
                </button>

                {/* Page */}
                <div style={{
                    width: '100%', maxWidth: 720,
                    height: '100%', maxHeight: 'calc(100vh - 140px)',
                    background: page === 0 ? coverGradient(book.id) : '#fafafa',
                    borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
                    display: 'flex', flexDirection: 'column',
                    opacity: sliding ? 0 : 1,
                    transform: sliding ? 'scale(0.98)' : 'scale(1)',
                    transition: 'opacity 0.16s ease, transform 0.16s ease',
                }}>
                    {page === 0 ? (
                        /* Cover */
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            padding: '3rem 2rem', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>{book.cover || '📖'}</div>
                            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', marginBottom: '0.6rem', lineHeight: 1.3, fontFamily: 'Inter, sans-serif' }}>
                                {book.title}
                            </h2>
                            {book.author && <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '0.3rem' }}>by {book.author}</p>}
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{book.category}</p>
                            {book.isEbook && (
                                <div style={{
                                    marginTop: '1.5rem', padding: '8px 20px', borderRadius: 999,
                                    background: 'rgba(255,255,255,0.15)',
                                    color: '#fff', fontSize: '0.82rem', fontWeight: 600,
                                }}>
                                    ✅ Full E-Book · {total} pages
                                </div>
                            )}
                            <div style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                                Press → or click Next to start reading
                            </div>
                        </div>
                    ) : page > total ? (
                        /* End */
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            padding: '3rem', textAlign: 'center',
                            background: 'linear-gradient(135deg,#f0f4ff,#fdf4ff)',
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                            <h3 style={{ color: '#1e293b', fontSize: '1.5rem', marginBottom: '0.5rem' }}>You finished it!</h3>
                            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>We hope you enjoyed "<strong>{book.title}</strong>".</p>
                            <button onClick={onRate} style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', padding: '0.65rem 1.8rem', borderRadius: 999, fontSize: '0.9rem' }}>
                                <Star size={14} /> Leave a Review
                            </button>
                        </div>
                    ) : (
                        /* Content */
                        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {/* Header */}
                            <div style={{
                                padding: '12px 20px 8px', borderBottom: '1px solid #e2e8f0',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                flexShrink: 0, background: '#fff',
                            }}>
                                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                                    {book.title.toUpperCase()}
                                </span>
                                <span style={{ fontSize: '0.68rem', color: '#94a3b8', flexShrink: 0 }}>
                                    {page} / {total}
                                </span>
                            </div>
                            {/* Text */}
                            <div style={{
                                flex: 1, overflowY: 'auto', padding: '1.2rem 1.8rem',
                                fontFamily: '"Georgia", serif',
                                fontSize: '0.92rem', lineHeight: 1.9, color: '#1e293b',
                                whiteSpace: 'pre-wrap',
                            }}>
                                {content}
                            </div>
                            {/* Dots */}
                            <div style={{
                                padding: '8px', borderTop: '1px solid #e2e8f0',
                                background: '#f8fafc', display: 'flex', justifyContent: 'center', gap: 4,
                                flexShrink: 0,
                            }}>
                                {Array.from({ length: Math.min(total, 15) }).map((_, i) => {
                                    const dotPage = Math.max(1, Math.round((i / Math.max(Math.min(total, 15) - 1, 1)) * (total - 1)) + 1);
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => setPage(dotPage)}
                                            style={{
                                                width: page === dotPage ? 18 : 7,
                                                height: 7, borderRadius: 999,
                                                background: page === dotPage ? '#6366f1' : '#e2e8f0',
                                                cursor: 'pointer', transition: 'all 0.2s',
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Next */}
                <button
                    onClick={() => go(1)}
                    disabled={page > total}
                    style={{
                        flexShrink: 0, width: 44, height: 44, borderRadius: '50%',
                        background: page > total ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.2)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: page > total ? 'not-allowed' : 'pointer',
                        opacity: page > total ? 0.3 : 1,
                        boxShadow: 'none', padding: 0, transition: 'all 0.2s',
                    }}
                >
                    <ChevronRight size={20} color="#818cf8" />
                </button>
            </div>

            <div style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
                ← → Arrow keys · Esc to close
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════
   FeedbackModal
══════════════════════════════════════════════════════ */
function FeedbackModal({ book, studentName, onDone, onSkip }) {
    const [rating, setRating] = useState(5);
    const [msg, setMsg] = useState('');
    const [sent, setSent] = useState(false);

    const submit = async () => {
        try {
            await axios.post('/api/feedback', {
                studentName, bookTitle: book.title, message: msg, rating,
            });
        } catch { /* ignore */ }
        setSent(true);
        setTimeout(onDone, 1600);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            background: 'rgba(2,3,16,0.96)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                background: 'rgba(13,15,43,0.98)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 24, padding: '2.5rem 2rem',
                maxWidth: 420, width: '90%', textAlign: 'center',
                boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
            }}>
                {sent ? (
                    <div>
                        <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>🎉</div>
                        <h3 style={{ color: '#10b981' }}>Thank you for your review!</h3>
                    </div>
                ) : (
                    <>
                        <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Star size={24} color="#fff" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>Rate This Book</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
                            How was <strong style={{ color: '#e2e8f0' }}>{book.title}</strong>?
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: '1.2rem' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star
                                    key={s} size={34}
                                    fill={s <= rating ? '#f59e0b' : 'none'}
                                    stroke={s <= rating ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
                                    style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                                    onClick={() => setRating(s)}
                                />
                            ))}
                        </div>
                        <textarea
                            value={msg}
                            onChange={e => setMsg(e.target.value)}
                            placeholder="Share your thoughts… (optional)"
                            style={{ width: '100%', height: 90, padding: '0.75rem 1rem', borderRadius: 12, fontSize: '0.88rem', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: 10, marginTop: '1rem' }}>
                            <button onClick={submit} style={{ flex: 1, padding: '0.65rem', fontSize: '0.88rem' }}>
                                Submit
                            </button>
                            <button
                                onClick={onSkip}
                                style={{ flex: 1, padding: '0.65rem', fontSize: '0.88rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', boxShadow: 'none' }}
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

/* ── Sidebar nav ─────────────────────────────────── */
const NAV = [
    { key: 'ebooks', icon: Sparkles, label: 'E-Books Library' },
    { key: 'browse', icon: Library, label: 'All Books' },
    { key: 'prebooked', icon: BookMarked, label: 'My Pre-Bookings' },
    { key: 'stats', icon: BarChart2, label: 'My Stats' },
];

/* ══════════════════════════════════════════════════════
   StudentDashboard
══════════════════════════════════════════════════════ */
const StudentDashboard = ({ user, onLogout }) => {
    const [activeNav, setActiveNav] = useState('ebooks');
    const [timer, setTimer] = useState(0);
    const [books, setBooks] = useState([]);
    const [booksLoading, setBooksLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('All');
    const [readingBook, setReadingBook] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [myPrebooks, setMyPrebooks] = useState([]);
    const [downloading, setDownloading] = useState(null);
    const [bookLoading, setBookLoading] = useState(null);
    const [loadError, setLoadError] = useState('');

    /* Fetch lightweight book list on mount */
    useEffect(() => {
        setBooksLoading(true);
        axios.get('/api/books')
            .then(r => { setBooks(r.data); setBooksLoading(false); })
            .catch(() => {
                setLoadError('Could not load books. Make sure the backend is running on port 5000.');
                setBooksLoading(false);
            });
    }, []);

    /* Session timer */
    useEffect(() => {
        const t = setInterval(() => setTimer(s => s + 1), 1000);
        return () => clearInterval(t);
    }, []);

    const fmt = s => {
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    /* Open book — fetch pages on demand */
    const handleRead = useCallback(async (book) => {
        // Book list only has pageCount, not full pages — fetch on click
        setBookLoading(book.id);
        try {
            const res = await axios.get(`/api/books/${book.id}`);
            setReadingBook(res.data);
        } catch {
            alert('Could not load this book. Please try again.');
        } finally {
            setBookLoading(null);
        }
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
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = book.title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_') + '.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            alert(`Download failed: ${err.message}`);
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

    /* ── Overlays ── */
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
            <BookDetailView
                book={readingBook}
                downloading={downloading}
                onClose={() => setReadingBook(null)}
                onRate={() => setShowFeedback(true)}
                onDownload={handleDownload}
            />
        );
    }

    /* ── Dashboard Layout ── */
    return (
        <div className="dashboard" style={{ width: '100%' }}>

            {/* ── Sidebar ── */}
            <aside className="sidebar">
                <div className="sidebar__logo">
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Library size={18} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Smart Library</div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>Digital Collection</div>
                    </div>
                </div>

                {/* User card */}
                <div style={{ background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.20)', borderRadius: 12, padding: '10px 12px', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={16} color="#fff" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.name}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                {user.rollNo} · {user.year}
                            </div>
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
                        <Icon size={16} /> {label}
                        {key === 'ebooks' && ebooks.length > 0 && (
                            <span style={{ marginLeft: 'auto', background: '#10b981', color: '#fff', fontSize: '0.60rem', fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>
                                {ebooks.length}
                            </span>
                        )}
                    </div>
                ))}

                <div style={{ flex: 1 }} />

                {/* Timer */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '10px 12px', marginBottom: '0.8rem' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                        <Clock size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        Session time
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.06em', color: '#818cf8', fontVariantNumeric: 'tabular-nums' }}>
                        {fmt(timer)}
                    </div>
                </div>

                <button
                    onClick={() => onLogout(timer)}
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', width: '100%', boxShadow: 'none', fontSize: '0.85rem' }}
                >
                    <LogOut size={15} /> Logout
                </button>
            </aside>

            {/* ── Main ── */}
            <main className="dashboard__main">

                {/* Error banner */}
                {loadError && (
                    <div style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '0.9rem 1.2rem', marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.88rem', display: 'flex', gap: 10, alignItems: 'center' }}>
                        <AlertCircle size={16} />
                        {loadError}
                    </div>
                )}

                {/* ══ E-BOOKS ══ */}
                {activeNav === 'ebooks' && (
                    <>
                        {/* Hero */}
                        <div style={{
                            background: 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(168,85,247,0.12))',
                            border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20,
                            padding: '1.6rem 1.8rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(99,102,241,0.08)' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                    <Sparkles size={14} color="#818cf8" />
                                    <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.10em' }}>ENGINEERING E-BOOKS COLLECTION</span>
                                </div>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>
                                    📚 Digital <span className="text-gradient">Library</span>
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 520 }}>
                                    Read full-length engineering textbooks online — with Table of Contents, Chapter Summaries, and Book Metadata for each title.
                                </p>
                                <div style={{ display: 'flex', gap: 8, marginTop: '0.9rem', flexWrap: 'wrap' }}>
                                    {[
                                        { text: `✅ ${ebooks.length} Engineering E-Books`, c: '#10b981' },
                                        { text: '📑 Table of Contents', c: '#818cf8' },
                                        { text: '💡 Chapter Summaries', c: '#a855f7' },
                                        { text: '🏷️ Book Metadata', c: '#06b6d4' },
                                        { text: '⬇️ Download', c: '#f59e0b' },
                                    ].map(b => (
                                        <span key={b.text} style={{ padding: '4px 12px', borderRadius: 999, background: `${b.c}18`, border: `1px solid ${b.c}33`, color: b.c, fontSize: '0.75rem', fontWeight: 600 }}>
                                            {b.text}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {booksLoading ? (
                            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                                <div style={{ width: 36, height: 36, border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                                Loading books…
                            </div>
                        ) : (
                            <div className="grid-auto">
                                {ebooks.map((book, idx) => (
                                    <BookCard
                                        key={book.id}
                                        book={book} idx={idx}
                                        onRead={handleRead}
                                        onDownload={handleDownload}
                                        onPreBook={handlePreBook}
                                        downloading={downloading}
                                        bookLoading={bookLoading}
                                    />
                                ))}
                            </div>
                        )}

                        {/* How-to */}
                        <div style={{ marginTop: '1.8rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '0.8rem' }}>
                                <FileText size={14} color="#a855f7" />
                                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>How to use E-Books</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '0.75rem' }}>
                                {[
                                    { e: '1️⃣', t: 'Click "Read Online" to open the full book reader with formatted content' },
                                    { e: '2️⃣', t: 'Click "TOC" to open the Table of Contents and jump to any chapter' },
                                    { e: '3️⃣', t: 'Click "Info" to view book metadata — author, edition, keywords, and summary' },
                                    { e: '4️⃣', t: 'Each page shows a chapter summary at the bottom to reinforce key concepts' },
                                    { e: '5️⃣', t: 'Use ← → arrow keys to navigate pages. Click "Download" to save as .txt file' },
                                    { e: '6️⃣', t: 'Rate the book after finishing to help other students find top resources' },
                                ].map(s => (
                                    <div key={s.e} style={{ display: 'flex', gap: 8 }}>
                                        <span style={{ fontSize: '1rem' }}>{s.e}</span>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{s.t}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ══ ALL BOOKS ══ */}
                {activeNav === 'browse' && (
                    <>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>
                                Hello, <span className="text-gradient">{user.name?.split(' ')[0]}</span> 👋
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                                {books.length.toLocaleString()} books available · {user.department}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            <div className="search-wrap" style={{ flex: '1 1 240px', maxWidth: 420, margin: 0 }}>
                                <Search className="search-wrap__icon" size={16} />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books by title…" />
                            </div>
                            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: 'auto', minWidth: 170 }}>
                                {categories.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>

                        {booksLoading ? (
                            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                                <div style={{ width: 36, height: 36, border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                                Loading {books.length > 0 ? `${books.length.toLocaleString()} books` : 'books'}…
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                                <BookOpen size={44} style={{ opacity: 0.3, marginBottom: 10 }} />
                                <p>No books found for "<strong>{search}</strong>"</p>
                            </div>
                        ) : (
                            <div className="grid-auto">
                                {filtered.map((book, idx) => (
                                    <BookCard
                                        key={book.id}
                                        book={book} idx={idx}
                                        onRead={handleRead}
                                        onDownload={handleDownload}
                                        onPreBook={handlePreBook}
                                        downloading={downloading}
                                        bookLoading={bookLoading}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ══ PRE-BOOKINGS ══ */}
                {activeNav === 'prebooked' && (
                    <>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>My Pre-Bookings</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
                            Books reserved for physical pickup from the library counter
                        </p>
                        {myPrebooks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                                <BookMarked size={44} style={{ opacity: 0.3, marginBottom: 10 }} />
                                <p>No pre-bookings yet. Browse the library and click "Pre-Book"!</p>
                            </div>
                        ) : (
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th><th>Book Title</th><th>Booked At</th><th>Status</th>
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

                {/* ══ STATS ══ */}
                {activeNav === 'stats' && (
                    <>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>My Statistics</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>Your activity this session</p>
                        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                            {[
                                { label: 'Session Time', value: fmt(timer), emoji: '⏱️', color: '#6366f1' },
                                { label: 'Pre-Bookings', value: myPrebooks.length, emoji: '🔖', color: '#a855f7' },
                                { label: 'E-Books', value: ebooks.length, emoji: '📚', color: '#10b981' },
                            ].map(s => (
                                <div key={s.label} className="stat-card">
                                    <div className="stat-card__icon" style={{ background: `${s.color}22`, fontSize: '1.2rem' }}>{s.emoji}</div>
                                    <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                                    <div className="stat-card__label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ padding: '1.25rem', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                                <TrendingUp size={14} color="#818cf8" />
                                <span style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.85rem' }}>Your Profile</span>
                            </div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{user.name}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                {user.department} · {user.year} · Roll: {user.rollNo}
                            </p>
                        </div>
                    </>
                )}

                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </main>
        </div>
    );
};

export default StudentDashboard;
