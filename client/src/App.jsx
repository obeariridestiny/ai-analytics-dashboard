import React, { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [health, setHealth] = useState(null)
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [realTimeData, setRealTimeData] = useState([])

  const API_URL = import.meta.env.NEXT_PUBLIC_API_URL || 'https://ai-analytics-backend-z5so.onrender.com'

  // Mock data for richer demo
  const features = [
    { name: 'Real-time Analytics', icon: '📊', description: 'Live data updates every second' },
    { name: 'User Management', icon: '👥', description: 'Complete user system with roles' },
    { name: 'AI Predictions', icon: '🤖', description: 'Machine learning insights' },
    { name: 'Anomaly Detection', icon: '🚨', description: 'Automatic outlier detection' },
    { name: 'Data Export', icon: '📥', description: 'Export reports in multiple formats' },
    { name: 'Custom Dashboards', icon: '🎛️', description: 'Build your own analytics views' }
  ]

  const checkHealth = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/health`)
      setHealth(response.data)
    } catch (error) {
      setHealth({ 
        status: 'ERROR', 
        message: 'Backend is waking up...',
        tip: 'Render free tier takes 30-50 seconds to start'
      })
    }
    setLoading(false)
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`)
      setUsers(response.data.users)
    } catch (error) {
      // Enhanced mock data
      setUsers([
        { id: 1, name: 'Alex Johnson', email: 'alex@company.com', role: 'admin', status: 'active', joinDate: '2024-01-15' },
        { id: 2, name: 'Sarah Chen', email: 'sarah@company.com', role: 'user', status: 'active', joinDate: '2024-02-20' },
        { id: 3, name: 'Mike Rodriguez', email: 'mike@company.com', role: 'user', status: 'inactive', joinDate: '2024-01-08' },
        { id: 4, name: 'Emily Davis', email: 'emily@company.com', role: 'admin', status: 'active', joinDate: '2024-03-01' },
        { id: 5, name: 'James Wilson', email: 'james@company.com', role: 'user', status: 'active', joinDate: '2024-02-10' }
      ])
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/analytics`)
      setAnalytics(response.data)
    } catch (error) {
      // Enhanced mock analytics
      setAnalytics({
        revenue: 124531,
        users: 2347,
        growth: 18.2,
        activeUsers: 1892,
        sessions: 12457,
        conversion: 28.7,
        bounceRate: 32.1,
        avgSession: '4m 22s',
        chartData: [65, 78, 90, 81, 56, 55, 40, 75, 82, 91, 67, 88]
      })
    }
  }

  const testAllFeatures = async () => {
    setLoading(true)
    await Promise.all([
      checkHealth(),
      fetchUsers(),
      fetchAnalytics()
    ])
    
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealTimeData(prev => [
        ...prev.slice(-9),
        { value: Math.random() * 100, time: new Date().toLocaleTimeString() }
      ])
    }, 2000)
    
    setTimeout(() => clearInterval(interval), 10000)
    setLoading(false)
  }

  useEffect(() => {
    checkHealth()
    fetchUsers()
    fetchAnalytics()
    
    // Start with some real-time data
    setRealTimeData([
      { value: 45, time: '10:00:00' },
      { value: 67, time: '10:00:02' },
      { value: 23, time: '10:00:04' },
      { value: 89, time: '10:00:06' }
    ])
  }, [])

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <header style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: 'white',
          padding: '40px 30px',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '10px',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🚀 AI Analytics Dashboard
          </h1>
          <p style={{ 
            fontSize: '1.3rem', 
            opacity: 0.9,
            marginBottom: '20px'
          }}>
            Enterprise-grade analytics platform with real-time insights
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => setActiveTab('dashboard')}
              style={{
                padding: '12px 24px',
                background: activeTab === 'dashboard' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              style={{
                padding: '12px 24px',
                background: activeTab === 'users' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              👥 Users
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              style={{
                padding: '12px 24px',
                background: activeTab === 'analytics' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              📈 Analytics
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div style={{ padding: '30px' }}>
          
          {/* Server Status Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            padding: '25px',
            borderRadius: '15px',
            marginBottom: '30px',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ color: '#0369a1', fontSize: '1.5rem' }}>System Status</h2>
              <button 
                onClick={checkHealth}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: '#0284c7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? '🔄 Checking...' : '🔍 Check Status'}
              </button>
            </div>
            
            {health ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: health.status === 'OK' ? '#10b981' : '#f59e0b',
                  animation: health.status === 'OK' ? 'pulse 2s infinite' : 'none'
                }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ marginBottom: '5px', fontSize: '1.1rem', fontWeight: '600' }}>
                    Status: <span style={{ 
                      color: health.status === 'OK' ? '#10b981' : '#f59e0b'
                    }}>
                      {health.status === 'OK' ? 'All Systems Operational' : 'System Starting...'}
                    </span>
                  </p>
                  <p style={{ color: '#64748b', fontSize: '1rem' }}>
                    {health.message}
                  </p>
                  {health.tip && (
                    <p style={{ 
                      color: '#d97706', 
                      fontSize: '0.9rem', 
                      marginTop: '8px',
                      background: '#fffbeb',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #fcd34d'
                    }}>
                      💡 {health.tip}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p>Checking system status...</p>
            )}
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Analytics Overview */}
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ color: '#1e293b', fontSize: '1.8rem', marginBottom: '20px' }}>📈 Business Overview</h2>
                {analytics && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '20px',
                    marginBottom: '30px'
                  }}>
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '25px', 
                      background: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)',
                      borderRadius: '12px',
                      border: '1px solid #bfdbfe'
                    }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1e40af' }}>${analytics.revenue?.toLocaleString()}</div>
                      <div style={{ color: '#374151', fontWeight: '600', fontSize: '1.1rem' }}>Total Revenue</div>
                      <div style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '5px' }}>↑ 18.2% from last month</div>
                    </div>
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '25px', 
                      background: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)',
                      borderRadius: '12px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#166534' }}>{analytics.users?.toLocaleString()}</div>
                      <div style={{ color: '#374151', fontWeight: '600', fontSize: '1.1rem' }}>Total Users</div>
                      <div style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '5px' }}>↑ 234 new this week</div>
                    </div>
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '25px', 
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
                      borderRadius: '12px',
                      border: '1px solid #fde68a'
                    }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#92400e' }}>+{analytics.growth}%</div>
                      <div style={{ color: '#374151', fontWeight: '600', fontSize: '1.1rem' }}>Growth Rate</div>
                      <div style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '5px' }}>↑ 5.7% from last quarter</div>
                    </div>
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '25px', 
                      background: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)',
                      borderRadius: '12px',
                      border: '1px solid #fbcfe8'
                    }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#be185d' }}>{analytics.conversion}%</div>
                      <div style={{ color: '#374151', fontWeight: '600', fontSize: '1.1rem' }}>Conversion Rate</div>
                      <div style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '5px' }}>↑ 2.3% optimization</div>
                    </div>
                  </div>
                )}

                {/* Real-time Data Stream */}
                <div style={{ 
                  background: '#f8fafc',
                  padding: '25px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{ color: '#1e293b', marginBottom: '15px' }}>🔄 Real-time Data Stream</h3>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '10px'
                  }}>
                    {realTimeData.map((data, index) => (
                      <div key={index} style={{
                        background: 'white',
                        padding: '15px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: 'bold',
                          color: '#3b82f6'
                        }}>
                          {data.value.toFixed(1)}
                        </div>
                        <div style={{ 
                          fontSize: '0.8rem',
                          color: '#64748b'
                        }}>
                          {data.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div>
                <h2 style={{ color: '#1e293b', fontSize: '1.8rem', marginBottom: '20px' }}>✨ Platform Features</h2>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  {features.map((feature, index) => (
                    <div key={index} style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      padding: '25px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      transition: 'transform 0.2s ease'
                    }}>
                      <div style={{ 
                        fontSize: '2rem',
                        marginBottom: '15px'
                      }}>
                        {feature.icon}
                      </div>
                      <h3 style={{ 
                        color: '#1e293b',
                        fontSize: '1.3rem',
                        marginBottom: '10px'
                      }}>
                        {feature.name}
                      </h3>
                      <p style={{ 
                        color: '#64748b',
                        lineHeight: '1.5'
                      }}>
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 style={{ color: '#1e293b', fontSize: '1.8rem', marginBottom: '20px' }}>👥 User Management</h2>
              <div style={{ 
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Total Users: </span>
                    <strong style={{ color: '#1e293b' }}>{users.length}</strong>
                  </div>
                  <button 
                    onClick={fetchUsers}
                    style={{
                      padding: '10px 20px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Refresh Users
                  </button>
                </div>
                
                <div style={{ padding: '20px' }}>
                  {users.map(user => (
                    <div key={user.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '20px',
                      borderBottom: '1px solid #f1f5f9',
                      gap: '15px'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px',
                          marginBottom: '5px'
                        }}>
                          <strong style={{ color: '#1e293b', fontSize: '1.1rem' }}>{user.name}</strong>
                          <span style={{
                            padding: '4px 12px',
                            background: user.role === 'admin' ? '#fef3c7' : '#f1f5f9',
                            color: user.role === 'admin' ? '#d97706' : '#64748b',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            {user.role}
                          </span>
                          <span style={{
                            padding: '4px 12px',
                            background: user.status === 'active' ? '#dcfce7' : '#fef2f2',
                            color: user.status === 'active' ? '#166534' : '#dc2626',
                            borderRadius: '20px',
                            fontSize: '0.8rem'
                          }}>
                            {user.status}
                          </span>
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                          {user.email} • Joined {user.joinDate}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: 'white',
            padding: '40px',
            borderRadius: '15px',
            textAlign: 'center',
            marginTop: '40px'
          }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '15px' }}>Ready to Get Started? 🚀</h3>
            <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '30px' }}>
              Explore all features of your AI Analytics Dashboard
            </p>
            <button 
              onClick={testAllFeatures}
              disabled={loading}
              style={{
                padding: '15px 40px',
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '🔄 Testing Features...' : '🎯 Test All Features'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          background: '#f8fafc',
          padding: '30px',
          textAlign: 'center',
          borderTop: '1px solid #e2e8f0',
          color: '#64748b'
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
            🚀 AI Analytics Dashboard v2.0
          </p>
          <p style={{ fontSize: '0.9rem' }}>
            Built with React • Node.js • MongoDB • Real-time Analytics
          </p>
        </footer>
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  )
}

export default App