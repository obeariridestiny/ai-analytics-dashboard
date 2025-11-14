import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [health, setHealth] = useState(null);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' });

  // Backend URL - make sure this matches your Render backend
  const API_URL = 'https://ai-analytics-backend-z5so.onrender.com';
  console.log('🔧 Using API_URL:', API_URL);

  // Create axios instance with better configuration
  const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Auth functions
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    console.log('🔄 Attempting login...');
    
    try {
      const response = await api.post('/api/auth/login', {
        email: authData.email,
        password: authData.password
      });
      
      console.log('✅ Login response:', response.data);
      
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setShowAuth(false);
      setAuthData({ name: '', email: '', password: '' });
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      alert(error.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    console.log('🔄 Attempting registration...');
    
    try {
      const response = await api.post('/api/auth/register', authData);
      console.log('✅ Registration response:', response.data);
      
      alert('Registration successful! Please login.');
      setAuthMode('login');
      setAuthData({ ...authData, name: '' });
      
    } catch (error) {
      console.error('❌ Registration failed:', error);
      alert(error.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Data functions
  const checkHealth = async () => {
    setLoading(true);
    console.log('🔄 Checking health...');
    
    try {
      const response = await api.get('/api/health');
      console.log('✅ Health check success:', response.data);
      setHealth(response.data);
    } catch (error) {
      console.error('❌ Health check failed:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      setHealth({ 
        status: 'ERROR', 
        message: `Connection failed: ${error.message}`
      });
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Fallback mock data
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
      ]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Fallback mock data
      setAnalytics({
        revenue: 45231,
        users: 1234,
        growth: 12.5,
        activeUsers: 892,
        sessions: 2457
      });
    }
  };

  const testAllFeatures = async () => {
    setLoading(true);
    await Promise.all([checkHealth(), fetchUsers(), fetchAnalytics()]);
    setLoading(false);
  };

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }

    // Load initial data
    checkHealth();
    fetchUsers();
    fetchAnalytics();
  }, []);

  // Auth Modal Component - FIXED VERSION (no onBlur handlers)
  const AuthModal = () => {
    const inputStyle = {
      width: '100%',
      padding: '12px',
      marginBottom: '15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '16px',
      WebkitAppearance: 'none',
      lineHeight: '1.5'
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '15px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
            {authMode === 'login' ? '🔐 Login' : '👤 Register'}
          </h2>
          
          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
            {authMode === 'register' && (
              <input
                type="text"
                placeholder="Full Name"
                value={authData.name}
                onChange={(e) => setAuthData(prev => ({...prev, name: e.target.value}))}
                style={inputStyle}
                autoComplete="name"
                required
              />
            )}
            
            <input
              type="email"
              placeholder="Email Address"
              value={authData.email}
              onChange={(e) => setAuthData(prev => ({...prev, email: e.target.value}))}
              style={inputStyle}
              autoComplete="email"
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              value={authData.password}
              onChange={(e) => setAuthData(prev => ({...prev, password: e.target.value}))}
              style={inputStyle}
              autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
              required
            />
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '🔄 Processing...' : (authMode === 'login' ? 'Login' : 'Register')}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '15px', color: '#666' }}>
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {authMode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
          
          <button
            onClick={() => setShowAuth(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Auth Modal */}
      {showAuth && <AuthModal />}

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        minHeight: '100vh',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <header style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: 'white',
          padding: '20px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div>
              <h1 style={{ 
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                margin: 0,
                background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🚀 AI Analytics Dashboard
              </h1>
              <p style={{ 
                margin: '5px 0 0 0',
                opacity: 0.8,
                fontSize: 'clamp(0.8rem, 2.5vw, 1rem)'
              }}>
                Connected to Backend v1.0.0
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {user ? (
                <>
                  <span style={{ fontSize: '0.9rem' }}>
                    👋 Hello, {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    fontSize: '0.9rem'
                  }}
                >
                  🔐 Login
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav style={{
            display: 'flex',
            gap: '10px',
            marginTop: '15px',
            flexWrap: 'wrap'
          }}>
            {['dashboard', 'analytics', 'users'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  background: activeTab === tab ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'dashboard' && '📊 '}
                {tab === 'analytics' && '📈 '}
                {tab === 'users' && '👥 '}
                {tab}
              </button>
            ))}
          </nav>
        </header>

        {/* Main Content */}
        <main style={{ padding: '20px' }}>
          {/* Loading Spinner */}
          {loading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && !loading && (
            <div>
              {/* Welcome Message */}
              {user && (
                <div style={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '1px solid #bae6fd'
                }}>
                  <h2 style={{ color: '#0369a1', margin: 0 }}>
                    👋 Welcome back, {user.name}!
                  </h2>
                  <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>
                    Ready to explore your analytics dashboard
                  </p>
                </div>
              )}

              {/* Server Status */}
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <h2 style={{ color: '#1e293b', margin: 0 }}>System Status</h2>
                  <button
                    onClick={checkHealth}
                    disabled={loading}
                    style={{
                      padding: '8px 16px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1,
                      fontSize: '0.9rem'
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>

                {health ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: health.status === 'OK' ? '#10b981' : '#ef4444',
                      animation: health.status === 'OK' ? 'pulse 2s infinite' : 'none'
                    }}></div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
                        Status: <span style={{
                          color: health.status === 'OK' ? '#10b981' : '#ef4444'
                        }}>
                          {health.status}
                        </span>
                      </p>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                        {health.message}
                      </p>
                      {health.version && (
                        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                          Backend Version: {health.version}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p>Checking system status...</p>
                )}
              </div>

              {/* Analytics Overview */}
              {analytics && (
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>📊 Business Overview</h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      padding: '15px',
                      background: '#f0f9ff',
                      borderRadius: '8px',
                      border: '1px solid #e0f2fe'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>
                        ${analytics.revenue?.toLocaleString()}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Revenue</div>
                    </div>
                    <div style={{
                      textAlign: 'center',
                      padding: '15px',
                      background: '#f0fdf4',
                      borderRadius: '8px',
                      border: '1px solid #dcfce7'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>
                        {analytics.users?.toLocaleString()}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Users</div>
                    </div>
                    <div style={{
                      textAlign: 'center',
                      padding: '15px',
                      background: '#fffbeb',
                      borderRadius: '8px',
                      border: '1px solid #fef3c7'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>
                        +{analytics.growth}%
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Growth</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                color: 'white',
                padding: '25px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <h3 style={{ marginBottom: '15px' }}>Ready to Explore? 🚀</h3>
                <p style={{ marginBottom: '20px', opacity: 0.9 }}>
                  Test all features of your analytics dashboard
                </p>
                <button
                  onClick={testAllFeatures}
                  disabled={loading}
                  style={{
                    padding: '12px 30px',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    backdropFilter: 'blur(10px)',
                    opacity: loading ? 0.7 : 1,
                    fontSize: '1rem'
                  }}
                >
                  {loading ? '🔄 Testing...' : '🎯 Test All Features'}
                </button>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && !loading && (
            <div>
              <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>📈 Detailed Analytics</h2>
              {analytics ? (
                <div style={{
                  display: 'grid',
                  gap: '15px',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
                }}>
                  {Object.entries(analytics).map(([key, value]) => (
                    <div key={key} style={{
                      background: 'white',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#64748b',
                        textTransform: 'capitalize',
                        marginBottom: '5px'
                      }}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#1e293b'
                      }}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Loading analytics data...</p>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && !loading && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <h2 style={{ color: '#1e293b', margin: 0 }}>👥 User Management</h2>
                <button
                  onClick={fetchUsers}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  🔄 Refresh Users
                </button>
              </div>

              {users.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gap: '10px'
                }}>
                  {users.map(user => (
                    <div key={user.id} style={{
                      background: 'white',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginBottom: '5px'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.8rem'
                          }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ color: '#1e293b' }}>{user.name}</strong>
                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        background: user.role === 'admin' ? '#fef3c7' : '#f1f5f9',
                        color: user.role === 'admin' ? '#d97706' : '#64748b',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
                  No users found
                </p>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{
          background: '#f8fafc',
          padding: '20px',
          textAlign: 'center',
          borderTop: '1px solid #e2e8f0',
          color: '#64748b',
          marginTop: '40px'
        }}>
          <p style={{ margin: '0 0 5px 0' }}>
            🚀 AI Analytics Dashboard v2.0
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem' }}>
            Connected to Backend API • Real-time Analytics
          </p>
        </footer>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

export default App;