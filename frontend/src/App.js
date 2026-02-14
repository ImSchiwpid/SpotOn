import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';

// Pages
import Dashboard from './pages/Dashboard';
import ExploreParking from './pages/ExploreParking';
import MyBookings from './pages/MyBookings';
import AddParking from './pages/AddParking';
import Profile from './pages/Profile';
import Login from './pages/Login';

// Context
export const AuthContext = createContext();
export const SocketContext = createContext();

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    role: 'user',
  });
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const socketURL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketURL, {
      transports: ['websocket'],
      reconnection: true
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = { user, setUser, login, logout }; // Expose logout to context

  return (
    <AuthContext.Provider value={value}>
      <SocketContext.Provider value={socket}>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/explore" element={
                <ProtectedRoute>
                  <ExploreParking />
                </ProtectedRoute>
              } />
              
              <Route path="/bookings" element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              } />
              
              <Route path="/add-parking" element={
                <ProtectedRoute>
                  <AddParking />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Settings & Help Routes */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/help" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Routes>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#fff',
                  color: '#363636',
                  borderRadius: '10px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff'
                  }
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff'
                  }
                }
              }}
            />
          </div>
        </Router>
      </SocketContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
