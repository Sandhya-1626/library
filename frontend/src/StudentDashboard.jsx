import React, { useState, useEffect, forwardRef } from 'react';
import axios from 'axios';
import { Clock, Book, Search, LogOut, ChevronLeft, ChevronRight, CheckCircle, Star, MoveHorizontal } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';

const Page = forwardRef((props, ref) => {
    const children = props.children;
    // Check if the content is an image URL
    const isImageUrl = typeof children === 'string' && (children.startsWith('http') || children.match(/\.(png|jpg|jpeg|gif)$/i));

    return (
        <div className="demoPage" ref={ref} style={{
            background: '#fff',
            padding: isImageUrl ? '0' : '20px',
            border: '1px solid #ddd',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.1)',
            height: '100%',
            width: '100%',
            color: '#333',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {isImageUrl ? (
                <img
                    src={children}
                    alt={`Page ${props.number}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    onError={(e) => {
                        console.error("Image failed:", children);
                        e.target.style.display = 'none';
                    }}
                />
            ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: '1.6', textAlign: 'left' }}>
                        {children}
                    </div>
                </div>
            )}
            <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                fontSize: '0.8rem',
                color: '#999',
                background: 'rgba(255,255,255,0.7)',
                padding: '2px 5px',
                borderRadius: '4px',
                zIndex: 5
            }}>
                {props.number}
            </div>
        </div>
    );
});

const StudentDashboard = ({ user, onLogout }) => {
    const [timer, setTimer] = useState(0);
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [readingBook, setReadingBook] = useState(null);
    const [page, setPage] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [rating, setRating] = useState(5);

    useEffect(() => {
        const fetchBooks = async () => {
            const res = await axios.get('http://localhost:5000/api/books');
            setBooks(res.data);
        };
        fetchBooks();

        const interval = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePreBook = async (bookTitle) => {
        await axios.post('http://localhost:5000/api/prebook', { studentName: user.name, bookTitle });
        alert(`Pre-booked ${bookTitle}! Admin notified. Collect within 24hrs.`);
    };

    const filteredBooks = books
        .filter(b => String(b.title).toLowerCase().includes(search.toLowerCase()))
        .slice(0, 50); // Limit to 50 books for performance

    const handleFeedbackSubmit = async () => {
        await axios.post('http://localhost:5000/api/feedback', {
            studentName: user.name,
            bookTitle: readingBook.title,
            message: feedbackMsg,
            rating: rating
        });
        alert('Thank you for your feedback and rating!');
        setReadingBook(null);
        setShowFeedback(false);
        setFeedbackMsg('');
        setRating(5);
    };

    if (showFeedback) {
        return (
            <div className="glass-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
                <h3 className="text-gradient">Book Review</h3>
                <p>How was your experience reading <strong>{readingBook.title}</strong>?</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={32}
                            fill={star <= rating ? "#fbbf24" : "none"}
                            stroke={star <= rating ? "#fbbf24" : "#666"}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>
                <textarea
                    placeholder="Type your feedback here..."
                    value={feedbackMsg}
                    onChange={(e) => setFeedbackMsg(e.target.value)}
                    style={{ width: '100%', height: '150px', background: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '12px', padding: '15px', border: '1px solid var(--glass-border)' }}
                />
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button onClick={handleFeedbackSubmit}>Submit Feedback</button>
                    <button onClick={() => { setShowFeedback(false); setReadingBook(null); }} style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>Skip</button>
                </div>
            </div>
        );
    }

    if (readingBook) {
        // Prepare pages - double pages for the flipbook effect
        const displayPages = [...readingBook.pages];
        if (displayPages.length % 2 !== 0) displayPages.push(""); // Pad to even number for better book feel

        return (
            <div className="flipbook-overlay" style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.9)', zIndex: 1000,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
                {/* Header pinned to top */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '80px',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    justifyContent: 'center',
                    zIndex: 1001,
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', padding: '0 20px', alignItems: 'center' }}>
                        <h3 className="text-gradient" style={{ margin: 0 }}>{readingBook.title}</h3>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={() => setShowFeedback(true)}
                                style={{
                                    background: 'linear-gradient(to right, #6366f1, #a855f7)',
                                    color: 'white',
                                    padding: '0.6rem 1.5rem',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.9rem',
                                    width: 'auto',
                                    borderRadius: '50px'
                                }}
                            >
                                <Star size={18} fill="currentColor" /> Feedback
                            </button>
                            <button
                                onClick={() => setReadingBook(null)}
                                style={{
                                    border: '1px solid #ff4444',
                                    color: '#ff4444',
                                    background: 'rgba(255, 68, 68, 0.1)',
                                    padding: '0.6rem 1.5rem',
                                    fontSize: '0.9rem',
                                    width: 'auto',
                                    borderRadius: '50px'
                                }}
                            >
                                Close Book
                            </button>
                        </div>
                    </div>
                </div>

                <div className="book-container" style={{ marginTop: '60px' }}>
                    <HTMLFlipBook
                        width={500}
                        height={700}
                        size="stretch"
                        minWidth={315}
                        maxWidth={1000}
                        minHeight={420}
                        maxHeight={1400}
                        maxShadowOpacity={0.5}
                        showCover={true}
                        mobileScrollSupport={true}
                        className="demo-book"
                        style={{ margin: '0 auto' }}
                    >
                        {/* Cover Page */}
                        <Page number="Cover">
                            <div style={{ textAlign: 'center', background: '#f8fafd', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                                <div style={{ background: 'var(--primary)', padding: '20px', borderRadius: '50%', marginBottom: '30px' }}>
                                    <Book size={80} color="white" />
                                </div>
                                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '15px', color: '#1e293b' }}>{readingBook.title}</h1>
                                <p style={{ color: '#64748b' }}>{readingBook.category}</p>
                                <div style={{ marginTop: 'auto', color: '#6366f1', fontSize: '0.9rem' }}>
                                    Swipe corners to swap pages
                                </div>
                            </div>
                        </Page>

                        {/* Content Pages */}
                        {displayPages.map((p, i) => (
                            <Page key={i} number={i + 1}>
                                {p ? p : (i === displayPages.length - 1 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                        <h3 style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: '700' }}>End of Book</h3>
                                        <button
                                            onClick={() => setShowFeedback(true)}
                                            style={{
                                                marginTop: '20px',
                                                background: 'linear-gradient(to right, #6366f1, #a855f7)',
                                                color: 'white',
                                                padding: '1rem 2rem',
                                                borderRadius: '50px'
                                            }}
                                        >
                                            Leave Review
                                        </button>
                                    </div>
                                ) : "...")}
                            </Page>
                        ))}
                    </HTMLFlipBook>
                </div>

                <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: '20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: '50px' }}>
                        <MoveHorizontal size={18} />
                        <span style={{ fontSize: '0.9rem' }}>Page 1 of {displayPages.length + 1}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', maxWidth: '1000px', padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h2 className="text-gradient">Welcome, {user.name}!</h2>
                    <p>{user.department} - {user.rollNo}</p>
                </div>
                <div className="glass-card" style={{ padding: '10px 20px', width: 'auto', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={20} className="text-gradient" />
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formatTime(timer)}</span>
                </div>
                <button onClick={() => onLogout(timer)} style={{ width: 'auto' }}><LogOut size={20} /></button>
            </header>

            <div className="search-bar" style={{ marginBottom: '30px', position: 'relative' }}>
                <input
                    placeholder="Search books..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: '45px' }}
                />
                <Search style={{ position: 'absolute', left: '15px', top: '12px', color: '#666' }} size={20} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {filteredBooks.map(book => (
                    <div key={book.id} className="glass-card" style={{ margin: 0, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <Book size={40} style={{ marginBottom: '15px', color: 'var(--secondary)' }} />
                            <h4>{book.title}</h4>
                            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Category: {book.category}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                                <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    {book.ratings && book.ratings.length > 0
                                        ? (book.ratings.reduce((a, b) => a + b, 0) / book.ratings.length).toFixed(1)
                                        : "N/A"}
                                </span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>({book.ratings?.length || 0})</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button onClick={() => { setReadingBook(book); setPage(0); }} style={{ padding: '0.5rem' }}>Read Online</button>
                            <button onClick={() => handlePreBook(book.title)} style={{ padding: '0.5rem', background: 'transparent', border: '1px solid var(--glass-border)' }}>Pre-Book</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentDashboard;
