import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Trash2, Plus, Users, BookOpen, Bell, Upload, Star } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = ({ onLogout }) => {
    const [stats, setStats] = useState(null);
    const [notifs, setNotifs] = useState([]);
    const [books, setBooks] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [users, setUsers] = useState([]);
    const [bookViews, setBookViews] = useState([]);
    const [loginLogs, setLoginLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, books, views, logs
    const [newBook, setNewBook] = useState({ title: '', category: '', pages: '' });
    const [selectedFile, setSelectedFile] = useState(null);

    const fetchData = async () => {
        const [s, n, b, f, u, bv, l] = await Promise.all([
            axios.get('/api/admin/stats'),
            axios.get('/api/admin/notifications'),
            axios.get('/api/books'),
            axios.get('/api/admin/feedbacks'),
            axios.get('/api/admin/users'),
            axios.get('/api/admin/book-views'),
            axios.get('/api/admin/logs')
        ]);
        setStats(s.data);
        setNotifs(n.data);
        setBooks(b.data);
        setFeedbacks(f.data);
        setUsers(u.data);
        setBookViews(bv.data);
        setLoginLogs(l.data);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Polling for notifications
        return () => clearInterval(interval);
    }, []);

    const handleAddBook = async () => {
        const formData = new FormData();
        formData.append('title', newBook.title);
        formData.append('category', newBook.category);
        formData.append('pages', newBook.pages);
        if (selectedFile) {
            formData.append('bookFile', selectedFile);
        }

        await axios.post('/api/books', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        fetchData();
        setNewBook({ title: '', category: '', pages: '' });
        setSelectedFile(null);
    };

    const handleDeleteBook = async (id) => {
        await axios.delete(`/api/books/${id}`);
        fetchData();
    };

    if (!stats) return <div>Loading...</div>;

    const chartData = {
        labels: Object.keys(stats.deptWiseLogins),
        datasets: [{
            label: 'Logins by Department',
            data: Object.values(stats.deptWiseLogins),
            backgroundColor: 'rgba(99, 102, 241, 0.6)',
            borderColor: 'var(--primary)',
            borderWidth: 1,
        }]
    };

    return (
        <div style={{ width: '100%', maxWidth: '1200px', padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2 className="text-gradient" style={{ margin: 0 }}>Admin Panel</h2>
                </div>
                <button onClick={onLogout} style={{ width: 'auto' }}>Logout</button>
            </header>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid var(--glass-border)', paddingBottom: '10px' }}>
                <button
                    onClick={() => setActiveTab('overview')}
                    style={{
                        width: 'auto',
                        padding: '0.5rem 1.5rem',
                        background: activeTab === 'overview' ? 'var(--primary)' : 'transparent',
                        border: '1px solid var(--glass-border)'
                    }}
                >
                    📊 Overview
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        width: 'auto',
                        padding: '0.5rem 1.5rem',
                        background: activeTab === 'users' ? 'var(--primary)' : 'transparent',
                        border: '1px solid var(--glass-border)'
                    }}
                >
                    👥 Registered Candidates ({users.length})
                </button>
                <button
                    onClick={() => setActiveTab('books')}
                    style={{
                        width: 'auto',
                        padding: '0.5rem 1.5rem',
                        background: activeTab === 'books' ? 'var(--primary)' : 'transparent',
                        border: '1px solid var(--glass-border)'
                    }}
                >
                    📚 Manage Books
                </button>
                <button
                    onClick={() => setActiveTab('views')}
                    style={{
                        width: 'auto',
                        padding: '0.5rem 1.5rem',
                        background: activeTab === 'views' ? 'var(--primary)' : 'transparent',
                        border: '1px solid var(--glass-border)'
                    }}
                >
                    👁️ Book Views Tracking
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    style={{
                        width: 'auto',
                        padding: '0.5rem 1.5rem',
                        background: activeTab === 'logs' ? 'var(--primary)' : 'transparent',
                        border: '1px solid var(--glass-border)'
                    }}
                >
                    ⏲️ Candidate Login History
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                        <div className="glass-card" style={{ margin: 0 }}>
                            <h3><Users /> Login Statistics</h3>
                            <p>Total Logins Today: {stats.totalLogins}</p>
                            <Bar data={chartData} options={{ responsive: true, color: 'white' }} />
                        </div>

                        <div className="glass-card" style={{ margin: 0 }}>
                            <h3><Bell /> Recent Pre-Bookings</h3>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {notifs.length === 0 ? <p>No pre-bookings yet.</p> : notifs.map((n, i) => (
                                    <div key={i} style={{ borderBottom: '1px solid var(--glass-border)', padding: '10px 0' }}>
                                        <strong>{n.studentName}</strong> pre-booked <strong>{n.bookTitle}</strong>
                                        <p style={{ fontSize: '0.7rem' }}>{new Date(n.time).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="glass-card">
                        <h3><Users /> Student Feedbacks</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {feedbacks.length === 0 ? <p>No feedback yet.</p> : feedbacks.map((f, i) => (
                                <div key={i} style={{ padding: '10px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{f.studentName} <span style={{ color: '#888', fontWeight: 'normal', fontSize: '0.8rem' }}>on {f.bookTitle}</span></p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
                                            <span style={{ fontSize: '0.9rem', color: '#fbbf24' }}>{f.rating}</span>
                                        </div>
                                    </div>
                                    <p style={{ fontStyle: 'italic', margin: '5px 0' }}>"{f.message}"</p>
                                    <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(f.date).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Registered Users Tab */}
            {activeTab === 'users' && (
                <div className="glass-card" style={{ maxWidth: '100%' }}>
                    <h3><Users /> All Registered Candidates</h3>
                    {users.length === 0 ? (
                        <p>No candidates registered yet.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Roll Number</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Department</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Year</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '12px' }}>{user.name}</td>
                                            <td style={{ padding: '12px' }}>{user.rollNo}</td>
                                            <td style={{ padding: '12px' }}>{user.department}</td>
                                            <td style={{ padding: '12px' }}>{user.year}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Login History Tab */}
            {activeTab === 'logs' && (
                <div className="glass-card" style={{ maxWidth: '100%' }}>
                    <h3>⏲️ Candidate Login History</h3>
                    <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '20px' }}>
                        Track every time a candidate logs into the system
                    </p>
                    {loginLogs.length === 0 ? (
                        <p>No login history yet.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Candidate Name</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Roll Number</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Department</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Login Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loginLogs.map((log, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '12px' }}>{log.name}</td>
                                            <td style={{ padding: '12px' }}>{log.rollNo}</td>
                                            <td style={{ padding: '12px' }}>{log.department}</td>
                                            <td style={{ padding: '12px', fontSize: '0.85rem', color: '#888' }}>
                                                {new Date(log.date).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Manage Books Tab */}
            {activeTab === 'books' && (
                <div className="glass-card" style={{ maxWidth: '100%' }}>
                    <h3><BookOpen /> Manage Books</h3>
                    <div style={{ marginBottom: '20px' }}>
                        <input placeholder="Title" value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} />
                        <input
                            placeholder="Category / Topic"
                            value={newBook.category}
                            onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                            style={{ marginTop: '10px', background: '#000', color: '#fff', border: '1px solid #333' }}
                        />
                        <textarea
                            placeholder="Book Summary/Introduction (Optional)"
                            value={newBook.pages}
                            onChange={e => setNewBook({ ...newBook, pages: e.target.value })}
                            style={{ width: '100%', marginTop: '10px', height: '80px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid #333', borderRadius: '12px', padding: '10px' }}
                        />
                        <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '5px' }}>💡 Tip: Use <b>Double Enter</b> to separate pages for the 3D Flipbook.</p>
                        <div style={{ marginTop: '10px' }}>
                            <label style={{ fontSize: '0.8rem', color: '#888' }}>Upload Full Book File (PDF/TXT):</label>
                            <input
                                type="file"
                                onChange={e => setSelectedFile(e.target.files[0])}
                                style={{ marginTop: '5px', padding: '5px' }}
                            />
                        </div>
                        <button onClick={handleAddBook} style={{ marginTop: '15px' }}><Plus size={16} /> Add Full Book</button>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {books.length === 0 ? <p>No books added yet.</p> : books.map(b => (
                            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--glass-border)' }}>
                                <div>
                                    <span style={{ fontWeight: 'bold' }}>{b.title}</span>
                                    <p style={{ fontSize: '0.8rem', color: '#888', margin: '5px 0' }}>Category: {b.category}</p>
                                    {b.ratings && b.ratings.length > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
                                            <span style={{ fontSize: '0.8rem' }}>
                                                {(b.ratings.reduce((a, b) => a + b, 0) / b.ratings.length).toFixed(1)} ({b.ratings.length} reviews)
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <Trash2 size={16} onClick={() => handleDeleteBook(b.id)} style={{ cursor: 'pointer', color: 'red' }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Book Views Tracking Tab */}
            {activeTab === 'views' && (
                <div className="glass-card" style={{ maxWidth: '100%' }}>
                    <h3>👁️ Book Views Tracking</h3>
                    <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '20px' }}>
                        Track which candidates are viewing which books in real-time
                    </p>
                    {bookViews.length === 0 ? (
                        <p>No book views tracked yet.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Student Name</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Roll Number</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Book Title</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Viewed At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookViews.map((view, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '12px' }}>{view.studentName}</td>
                                            <td style={{ padding: '12px' }}>{view.rollNo}</td>
                                            <td style={{ padding: '12px' }}>{view.bookTitle}</td>
                                            <td style={{ padding: '12px', fontSize: '0.85rem', color: '#888' }}>
                                                {new Date(view.timestamp).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
