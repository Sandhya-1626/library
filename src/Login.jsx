import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
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
            let endpoint;
            if (isAdmin) {
                endpoint = '/api/login/admin';
            } else if (isRegister) {
                endpoint = '/api/register';
            } else {
                endpoint = '/api/login/student';
            }

            const res = await axios.post(endpoint, formData);
            if (res.data.success) {
                if (isRegister) {
                    alert('Registration successful! Please login.');
                    setIsRegister(false);
                } else {
                    onLoginSuccess(res.data, isAdmin ? 'admin' : 'student');
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Action failed');
        }
    };

    return (
        <div className="glass-card">
            <h2 className="centered-content text-gradient">Smart Digital Library</h2>

            <div className="centered-content" style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => { setIsAdmin(false); setIsRegister(false); }}
                    style={{ width: 'auto', marginRight: '10px', background: (!isAdmin && !isRegister) ? 'var(--primary)' : 'transparent', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem' }}
                >
                    Student
                </button>
                <button
                    onClick={() => { setIsAdmin(true); setIsRegister(false); }}
                    style={{ width: 'auto', background: isAdmin ? 'var(--primary)' : 'transparent', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem' }}
                >
                    Admin
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {!isAdmin ? (
                    <>
                        <div className="input-group">
                            <label>Full Name</label>
                            <input name="name" onChange={handleChange} required value={formData.name} />
                        </div>

                        {isRegister && (
                            <>
                                <div className="input-group">
                                    <label>Department</label>
                                    <select name="department" onChange={handleChange} value={formData.department}>
                                        <option>Computer Science</option>
                                        <option>Information Technology</option>
                                        <option>ECE</option>
                                        <option>EEE</option>
                                        <option>Mechanical</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Year</label>
                                    <select name="year" onChange={handleChange} value={formData.year}>
                                        <option>1st Year</option>
                                        <option>2nd Year</option>
                                        <option>3rd Year</option>
                                        <option>4th Year</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="input-group">
                            <label>Roll Number</label>
                            <input name="rollNo" onChange={handleChange} required value={formData.rollNo} />
                        </div>

                        <button type="submit">{isRegister ? 'Register Account' : 'Login to Dashboard'}</button>

                        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
                            {isRegister ? "Already have an account?" : "Don't have an account?"}
                            <span
                                onClick={() => setIsRegister(!isRegister)}
                                style={{ color: 'var(--primary)', cursor: 'pointer', marginLeft: '5px', fontWeight: 'bold' }}
                            >
                                {isRegister ? 'Login here' : 'Register here'}
                            </span>
                        </p>
                    </>
                ) : (
                    <>
                        <div className="input-group">
                            <label>Username (Admin ID)</label>
                            <input name="username" onChange={handleChange} required value={formData.username} />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input type="password" name="password" onChange={handleChange} required value={formData.password} />
                        </div>
                        <button type="submit">Admin Login</button>
                    </>
                )}
            </form>
        </div>
    );
};

export default Login;
