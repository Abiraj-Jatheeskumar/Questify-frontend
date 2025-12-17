import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Network metrics session tracking
let networkSession = {
  rttHistory: [],
  requestStats: {
    total: 0,
    successful: 0,
    failed: 0
  }
}

let latestNetworkMetrics = null

// Reset network session (call when starting a quiz)
export const resetNetworkSession = () => {
  networkSession = {
    rttHistory: [],
    requestStats: {
      total: 0,
      successful: 0,
      failed: 0
    }
  }
  latestNetworkMetrics = null
}

// Get current network metrics from session state (for including in requests)
export const getCurrentNetworkMetrics = () => {
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

// Calculate jitter from RTT history
const calculateJitter = (history) => {
  if (history.length < 2) return 0
  const differences = []
  for (let i = 1; i < history.length; i++) {
    differences.push(Math.abs(history[i] - history[i - 1]))
  }
  const jitter = differences.reduce((sum, diff) => sum + diff, 0) / differences.length
  return Math.round(jitter)
}

// Calculate stability percentage (based on request success rate)
const calculateStability = (stats) => {
  if (stats.total === 0) return 100
  return Math.round((stats.successful / stats.total) * 100 * 100) / 100 // 2 decimals
}

// Calculate network quality (weighted scoring)
const calculateNetworkQuality = (rtt_ms, jitter_ms, stability_percent) => {
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
const calculateNetworkMetrics = (currentRtt_ms) => {
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

// Add token to requests and track start time
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Track request start time for RTT calculation
  config.metadata = { startTime: performance.now() }
  networkSession.requestStats.total++
  
  return config
})

// Handle response and calculate network metrics
api.interceptors.response.use(
  (response) => {
    // Calculate RTT
    const rtt_ms = Math.round(performance.now() - response.config.metadata.startTime)
    
    // Update RTT history (keep last 20 requests)
    networkSession.rttHistory.push(rtt_ms)
    if (networkSession.rttHistory.length > 20) {
      networkSession.rttHistory.shift()
    }
    
    networkSession.requestStats.successful++
    
    // Calculate and store current metrics
    const metrics = calculateNetworkMetrics(rtt_ms)
    latestNetworkMetrics = metrics
    
    // Attach metrics to response object for debugging
    response.networkMetrics = metrics
    
    return response
  },
  (error) => {
    networkSession.requestStats.failed++
    
    // Calculate RTT even for errors (if request was sent)
    let rtt_ms = null
    if (error.config?.metadata?.startTime) {
      rtt_ms = Math.round(performance.now() - error.config.metadata.startTime)
      
      // Only track RTT for actual network/server errors, not client errors (4xx)
      if (error.response?.status >= 500 || !error.response) {
        networkSession.rttHistory.push(rtt_ms)
        if (networkSession.rttHistory.length > 20) {
          networkSession.rttHistory.shift()
        }
      }
    }
    
    // Calculate metrics if we have RTT data
    if (rtt_ms !== null) {
      const metrics = calculateNetworkMetrics(rtt_ms)
      latestNetworkMetrics = metrics
      error.networkMetrics = metrics
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api

