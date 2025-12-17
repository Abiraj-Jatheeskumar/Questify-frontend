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

// Get current network metrics
export const getCurrentNetworkMetrics = () => {
  return latestNetworkMetrics || {
    rtt_ms: null,
    jitter_ms: null,
    stability_percent: null,
    network_quality: null
  }
}

// Calculate jitter (variation in RTT)
const calculateJitter = (rttHistory) => {
  if (rttHistory.length < 2) return null
  
  const differences = []
  for (let i = 1; i < rttHistory.length; i++) {
    differences.push(Math.abs(rttHistory[i] - rttHistory[i - 1]))
  }
  
  if (differences.length === 0) return null
  
  const avgJitter = differences.reduce((sum, diff) => sum + diff, 0) / differences.length
  return Math.round(avgJitter * 100) / 100 // Round to 2 decimal places
}

// Calculate stability percentage (inverse of coefficient of variation)
const calculateStability = (rttHistory) => {
  if (rttHistory.length < 2) return null
  
  const mean = rttHistory.reduce((sum, rtt) => sum + rtt, 0) / rttHistory.length
  if (mean === 0) return 100
  
  const variance = rttHistory.reduce((sum, rtt) => sum + Math.pow(rtt - mean, 2), 0) / rttHistory.length
  const stdDev = Math.sqrt(variance)
  const coefficientOfVariation = stdDev / mean
  
  // Convert to stability percentage (lower CV = higher stability)
  // Scale: CV 0 = 100%, CV 1 = 0%
  const stability = Math.max(0, Math.min(100, (1 - coefficientOfVariation) * 100))
  return Math.round(stability * 100) / 100
}

// Classify network quality based on RTT and jitter
const calculateNetworkQuality = (rtt_ms, jitter_ms) => {
  if (rtt_ms === null || rtt_ms === undefined) return null
  
  // Use jitter if available, otherwise estimate based on RTT
  const effectiveJitter = jitter_ms !== null && jitter_ms !== undefined ? jitter_ms : rtt_ms * 0.1
  
  if (rtt_ms < 100 && effectiveJitter < 30) {
    return 'Excellent'
  } else if (rtt_ms < 200 && effectiveJitter < 50) {
    return 'Good'
  } else if (rtt_ms < 400 && effectiveJitter < 100) {
    return 'Fair'
  } else {
    return 'Poor'
  }
}

// Calculate all network metrics
const calculateNetworkMetrics = (currentRtt) => {
  const rtt_ms = currentRtt !== null && currentRtt !== undefined ? Math.round(currentRtt) : null
  const jitter_ms = calculateJitter(networkSession.rttHistory)
  const stability_percent = calculateStability(networkSession.rttHistory)
  const network_quality = calculateNetworkQuality(rtt_ms, jitter_ms)
  
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

