import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';
import { authAPI } from './utils/api';
import { getSocketUrl } from './utils/appConfig';
import { normalizeRole } from './utils/roles';

// Pages
import Dashboard from './pages/Dashboard';
import ExploreParking from './pages/ExploreParking';
import MyBookings from './pages/MyBookings';
import AddParking from './pages/AddParking';
import Profile from './pages/Profile';
import Cars from './pages/Cars';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerPanel from './pages/OwnerPanel';
import AdminPanel from './pages/AdminPanel';
import Notifications from './pages/Notifications';

// Context
export const AuthContext = createContext();
export const SocketContext = createContext();

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, authReady } = React.useContext(AuthContext);
  if (!authReady) return null;
  return user ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, roles }) => {
  const { user, authReady } = React.useContext(AuthContext);
  if (!authReady) return null;
  if (!user) return <Navigate to="/login" />;

  const currentRole = normalizeRole(user.role);
  return roles.includes(currentRole) ? children : <Navigate to="/dashboard" />;
};

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          localStorage.removeItem('user');
        }
      }

      if (!storedToken) {
        setAuthReady(true);
        return;
      }

      try {
        const response = await authAPI.getMe();
        if (response?.data?.data) {
          setUser(response.data.data);
          localStorage.setItem('user', JSON.stringify(response.data.data));
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    };

    bootstrapAuth();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const injectedSocket =
      typeof window !== 'undefined' && window.__SPOTON_E2E_SOCKET__
        ? window.__SPOTON_E2E_SOCKET__
        : null;

    if (injectedSocket) {
      setSocket(injectedSocket);
      return () => {
        if (typeof injectedSocket.close === 'function') {
          injectedSocket.close();
        }
      };
    }

    const socketURL = getSocketUrl();
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

  const value = { user, setUser, login, logout, authReady };

  if (!authReady) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      <SocketContext.Provider value={socket}>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
              
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

              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              
              <Route path="/add-parking" element={
                <RoleRoute roles={['parking_owner', 'admin']}>
                  <AddParking />
                </RoleRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              <Route path="/cars" element={
                <ProtectedRoute>
                  <Cars />
                </ProtectedRoute>
              } />

              <Route path="/favorites" element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />

              <Route path="/owner" element={
                <RoleRoute roles={['parking_owner', 'admin']}>
                  <OwnerPanel />
                </RoleRoute>
              } />

              <Route path="/admin" element={
                <RoleRoute roles={['admin']}>
                  <AdminPanel />
                </RoleRoute>
              } />

              <Route path="/admin/users" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/pending" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/transactions" element={<Navigate to="/admin" replace />} />
              
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
                duration: 5000,
                style: {
                  background: '#fff',
                  color: '#363636',
                  borderRadius: '10px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                },
                success: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff'
                  }
                },
                error: {
                  duration: 5000,
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
