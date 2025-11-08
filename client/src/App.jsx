import React, { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [health, setHealth] = useState(null)
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState(null)

  const checkHealth = async () => {
    try {
      const response = await axios.get('/api/health')
      setHealth(response.data)
    } catch (error) {
      setHealth({ status: 'ERROR', message: 'Server not reachable' })
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users')
      setUsers(response.data.users)
    } catch (error) {
      console.log('Failed to fetch users')
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics')
      setAnalytics(response.data)
    } catch (error) {
      console.log('Failed to fetch analytics')
    }
  }

  useEffect(() => {
    checkHealth()
    fetchUsers()
    fetchAnalytics()
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1e293b', fontSize: '2.5rem', marginBottom: '10px' }}>
          🚀 AI Analytics Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Real-time analytics and insights powered by AI
        </p>
      </header>

      {/* Server Status */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '12px',
        marginBottom: '25px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ marginBottom: '15px', color: '#1e293b' }}>Server Status</h2>
        {health ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: health.status === 'OK' ? '#10b981' : '#ef4444'
            }}></div>
            <div>
              <p style={{ marginBottom: '5px' }}>
                Status: <strong style={{ 
                  color: health.status === 'OK' ? '#10b981' : '#ef4444' 
                }}>{health.status}</strong>
              </p>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                {health.message} • {new Date(health.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ) : (
          <p>Checking server status...</p>
        )}
      </div>

      {/* Analytics Data */}
      {analytics && (
        <div style={{ 
          background: 'white', 
          padding: '25px', 
          borderRadius: '12px',
          marginBottom: '25px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>📊 Analytics Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ textAlign: 'center', padding: '15px', background: '#f0f9ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0369a1' }}>${analytics.revenue.toLocaleString()}</div>
              <div style={{ color: '#64748b' }}>Revenue</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: '#f0fdf4', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#15803d' }}>{analytics.users.toLocaleString()}</div>
              <div style={{ color: '#64748b' }}>Users</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: '#fffbeb', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d97706' }}>+{analytics.growth}%</div>
              <div style={{ color: '#64748b' }}>Growth</div>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '12px',
        marginBottom: '25px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#1e293b' }}>👥 Users</h2>
          <button 
            onClick={fetchUsers}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}
          >
            Refresh Users
          </button>
        </div>
        
        {users.length > 0 ? (
          <div>
            {users.map(user => (
              <div key={user.id} style={{ 
                padding: '15px', 
                border: '1px solid #f1f5f9',
                marginBottom: '10px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong style={{ color: '#1e293b' }}>{user.name}</strong>
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{user.email}</div>
                </div>
                <span style={{
                  padding: '4px 12px',
                  background: user.role === 'admin' ? '#fef3c7' : '#f1f5f9',
                  color: user.role === 'admin' ? '#d97706' : '#64748b',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b', textAlign: 'center' }}>No users found</p>
        )}
      </div>

      {/* Demo Login */}
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        border: '1px solid '#e2e8f0',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>Ready to Deploy? 🚀</h3>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          Your AI Analytics Dashboard is ready! Next step: Deploy to Render & Vercel.
        </p>
        <button 
          onClick={checkHealth}
          style={{
            padding: '12px 24px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          Test All Features
        </button>
      </div>
    </div>
  )
}

export default App