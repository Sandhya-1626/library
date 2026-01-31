import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [formData, setFormData] = useState({
        name: '', department: 'Computer Science', rollNo: '', year: '1st Year',
        username: '', password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isAdmin ? '/api/login/admin' : '/api/login/student';
            const res = await axios.post(`http://localhost:5000${endpoint}`, formData);
            if (res.data.success) {
                onLoginSuccess(res.data, isAdmin ? 'admin' : 'student');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="glass-card">
            <h2 className="centered-content text-gradient">Smart Digital Library</h2>
            <div className="centered-content" style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => setIsAdmin(false)}
                    style={{ width: 'auto', marginRight: '10px', background: !isAdmin ? 'var(--primary)' : 'transparent', border: '1px solid var(--glass-border)' }}
                >
                    Student
                </button>
                <button
                    onClick={() => setIsAdmin(true)}
                    style={{ width: 'auto', background: isAdmin ? 'var(--primary)' : 'transparent', border: '1px solid var(--glass-border)' }}
                >
                    Admin
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {!isAdmin ? (
                    <>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input name="name" onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Department</label>
                            <select name="department" onChange={handleChange}>
                                <option>Computer Science</option>
                                <option>Information Technology</option>
                                <option>ECE</option>
                                <option>EEE</option>
                                <option>Mechanical</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Roll Number</label>
                            <input name="rollNo" onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Year</label>
                            <select name="year" onChange={handleChange}>
                                <option>1st Year</option>
                                <option>2nd Year</option>
                                <option>3rd Year</option>
                                <option>4th Year</option>
                            </select>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="input-group">
                            <label>Username (Admin ID)</label>
                            <input name="username" onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input type="password" name="password" onChange={handleChange} required />
                        </div>
                    </>
                )}
                <button type="submit">Login to Dashboard</button>
            </form>
        </div>
    );
};

export default Login;
