/**
 * Version Check Utility
 * 
 * Checks if the app version has changed and forces a cache clear + reload
 * if a new version is detected.
 */

const VERSION_STORAGE_KEY = 'questify_app_version'

/**
 * Get the current app version from meta tag in index.html
 * Falls back to timestamp if meta tag not found (dev mode)
 */
export const getCurrentVersion = () => {
  // Try to get version from meta tag (injected at build time)
  const metaVersion = document.querySelector('meta[name="app-version"]')?.getAttribute('content')
  
  if (metaVersion && metaVersion !== '__APP_VERSION__') {
    return metaVersion
  }
  
  // Fallback: use build timestamp or current timestamp (dev mode)
  // In dev mode, use a fixed version to avoid constant reloads
  if (import.meta.env.DEV) {
    return 'dev-version'
  }
  
  // Production fallback (shouldn't happen if build plugin works)
  return import.meta.env.VITE_APP_VERSION || Date.now().toString()
}

/**
 * Get the stored version from localStorage
 */
export const getStoredVersion = () => {
  return localStorage.getItem(VERSION_STORAGE_KEY)
}

/**
 * Store the current version in localStorage
 */
export const storeVersion = (version) => {
  localStorage.setItem(VERSION_STORAGE_KEY, version)
}

/**
 * Check if app version has changed
 * Returns true if version changed or no version stored
 */
export const hasVersionChanged = () => {
  const currentVersion = getCurrentVersion()
  const storedVersion = getStoredVersion()
  
  // First time visit - no stored version
  if (!storedVersion) {
    return true
  }
  
  // Version changed
  return currentVersion !== storedVersion
}

/**
 * Clear all app-related cache and reload
 * @param {string} newVersion - The new version to store before reloading
 */
export const clearCacheAndReload = (newVersion) => {
  // Clear localStorage (except auth tokens - we'll preserve them)
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  
  // Clear all localStorage
  localStorage.clear()
  
  // Restore auth tokens if they exist
  if (token) {
    localStorage.setItem('token', token)
  }
  if (user) {
    localStorage.setItem('user', user)
  }
  
  // Store new version before reload
  if (newVersion) {
    localStorage.setItem(VERSION_STORAGE_KEY, newVersion)
  }
  
  // Clear sessionStorage
  sessionStorage.clear()
  
  // Force reload with cache bypass - ensures fresh files are fetched
  // Using location.href assignment to force hard reload
  window.location.href = window.location.href
}

/**
 * Initialize version check - should be called on app startup
 * 
 * If version changed:
 * 1. Stores new version
 * 2. Clears cache
 * 3. Reloads page to get fresh code
 */
export const initVersionCheck = () => {
  try {
    // Skip version check in dev mode to avoid constant reloads
    if (import.meta.env.DEV) {
      return false
    }
    
    const storedVersion = getStoredVersion()
    const currentVersion = getCurrentVersion()
    
    // First visit - no stored version, just store current version
    if (!storedVersion) {
      storeVersion(currentVersion)
      return false
    }
    
    // Version changed - need to reload
    if (currentVersion !== storedVersion) {
      console.log('🔄 New app version detected. Clearing cache and reloading...')
      clearCacheAndReload(currentVersion)
      return true // Indicates reload is happening
    }
    
    // Version matches - continue normally
    return false
  } catch (error) {
    console.error('Version check error:', error)
    // Don't block app loading if version check fails
    return false
  }
}

