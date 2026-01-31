import React, { useState } from 'react';
import axios from 'axios';
import Login from './Login';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';

function App() {
  const [session, setSession] = useState(null); // { user, role }

  const handleLoginSuccess = (data, role) => {
    setSession({ user: data.user || { name: 'Admin' }, role });
  };

  const handleLogout = async (duration = 0) => {
    if (session.role === 'student') {
      await axios.post('http://localhost:5000/api/logout', {
        name: session.user.name,
        duration
      });
    }
    setSession(null);
  };

  return (
    <div className="app-container">
      {!session ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : session.role === 'admin' ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <StudentDashboard user={session.user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
