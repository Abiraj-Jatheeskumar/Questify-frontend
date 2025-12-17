import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { store } from './redux/store'
import { initVersionCheck } from './utils/versionCheck'
import './index.css'

// Check for version updates before rendering app
// This ensures users always get the latest code
if (initVersionCheck()) {
  // Version check triggered a reload, don't render
  // (This return is here for safety, but reload should happen before this)
  throw new Error('Version check reloading...')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)

