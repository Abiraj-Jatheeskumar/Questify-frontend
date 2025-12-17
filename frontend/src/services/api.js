import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Session-scoped network tracking (reset when quiz starts)
let networkSession = {
  rttHistory: [],
  requestStats: { total: 0, successful: 0 },
  sessionStartTime: null
}

// Latest network metrics (updated after each request)
let latestNetworkMetrics = null

// Get current network metrics from session state (for including in requests)
export function getCurrentNetworkMetrics() {
  // Calculate metrics from current session state
  // Note: RTT will be calculated after request, but jitter/stability are accurate
  const lastRtt = networkSession.rttHistory.length > 0 
    ? networkSession.rttHistory[networkSession.rttHistory.length - 1] 
    : 0
  const jitter_ms = calculateJitter(networkSession.rttHistory)
  const stability_percent = calculateStability(networkSession.requestStats)
  const network_quality = calculateNetworkQuality(lastRtt, jitter_ms, stability_percent)
  
  return {
    rtt_ms: lastRtt, // Will be updated after request completes
    jitter_ms,
    stability_percent,
    network_quality
  }
}

// Reset network tracking for new quiz session
export function resetNetworkSession() {
  networkSession = {
    rttHistory: [],
    requestStats: { total: 0, successful: 0 },
    sessionStartTime: performance.now()
  }
  latestNetworkMetrics = null
}

// Calculate jitter from RTT history
function calculateJitter(history) {
  if (history.length < 2) return 0
  const differences = []
  for (let i = 1; i < history.length; i++) {
    differences.push(Math.abs(history[i] - history[i - 1]))
  }
  const jitter = differences.reduce((sum, diff) => sum + diff, 0) / differences.length
  return Math.round(jitter)
}

// Calculate stability percentage
function calculateStability(stats) {
  if (stats.total === 0) return 100
  return Math.round((stats.successful / stats.total) * 100 * 100) / 100 // 2 decimals
}

// Calculate network quality (weighted scoring)
function calculateNetworkQuality(rtt_ms, jitter_ms, stability_percent) {
  const rttScore = rtt_ms < 100 ? 100 : 
                   rtt_ms < 300 ? 90 :
                   rtt_ms < 500 ? 75 :
                   rtt_ms < 1000 ? 50 :
                   rtt_ms < 2000 ? 25 : 0
  
  const jitterScore = jitter_ms < 50 ? 100 :
                      jitter_ms < 100 ? 90 :
                      jitter_ms < 200 ? 75 :
                      jitter_ms < 500 ? 50 : 0
  
  const stabilityScore = stability_percent
  const overallScore = (rttScore * 0.3) + (jitterScore * 0.2) + (stabilityScore * 0.5)
  
  if (overallScore >= 90) return 'Excellent'
  if (overallScore >= 75) return 'Good'
  if (overallScore >= 60) return 'Fair'
  return 'Poor'
}

// Calculate all network metrics
function calculateNetworkMetrics(currentRtt_ms) {
  const rtt_ms = currentRtt_ms
  const jitter_ms = calculateJitter(networkSession.rttHistory)
  const stability_percent = calculateStability(networkSession.requestStats)
  const network_quality = calculateNetworkQuality(rtt_ms, jitter_ms, stability_percent)
  
  return {
    rtt_ms,
    jitter_ms,
    stability_percent,
    network_quality
  }
}

// Add token to requests (must run first)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Mark request start time for RTT measurement
  config.metadata = { startTime: performance.now() }
  // Increment total requests BEFORE sending
  networkSession.requestStats.total++
  return config
})

// Handle responses and track network metrics
api.interceptors.response.use(
  (response) => {
    // Calculate RTT (high precision)
    const rtt_ms = Math.round(performance.now() - response.config.metadata.startTime)
    
    // Update RTT history (keep last 20)
    networkSession.rttHistory.push(rtt_ms)
    if (networkSession.rttHistory.length > 20) {
      networkSession.rttHistory.shift()
    }
    
    // Mark request as successful
    networkSession.requestStats.successful++
    
    // Calculate all metrics
    const metrics = calculateNetworkMetrics(rtt_ms)
    
    // Store latest metrics for next request
    latestNetworkMetrics = metrics
    
    // Attach to response for easy access
    response.networkMetrics = metrics
    
    return response
  },
  (error) => {
    // Calculate RTT even for failed requests
    const rtt_ms = error.config?.metadata?.startTime 
      ? Math.round(performance.now() - error.config.metadata.startTime)
      : null
    
    if (rtt_ms) {
      networkSession.rttHistory.push(rtt_ms)
      if (networkSession.rttHistory.length > 20) {
        networkSession.rttHistory.shift()
      }
    }
    
    // Only count network/server errors as failures for stability
    const status = error.response?.status
    if (status >= 500 || !status) {
      // Network/server error - don't increment successful
    } else if (status >= 400 && status < 500) {
      // Client error - count as successful (not network issue)
      networkSession.requestStats.successful++
    }
    
    // Handle 401 separately
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // Calculate metrics even for errors
    if (rtt_ms !== null) {
      const metrics = calculateNetworkMetrics(rtt_ms)
      latestNetworkMetrics = metrics
      error.networkMetrics = metrics
    }
    
    return Promise.reject(error)
  }
)

export default api

