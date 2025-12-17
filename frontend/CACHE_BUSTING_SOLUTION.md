# Browser Cache Busting Solution

## Problem Solved

**Issue**: Students with persisted login (localStorage token) were automatically redirected to dashboard, but their browsers served cached JavaScript/CSS files, preventing them from getting new updates.

**Solution**: Automatic version check that detects new deployments and forces a cache clear + reload.

---

## How It Works

### 1. **Build-Time Version Injection**
- Vite plugin (`vite.config.js`) injects a **build timestamp** into `index.html` as a meta tag
- Each build generates a unique version (timestamp)
- Version is embedded in HTML: `<meta name="app-version" content="1703123456789" />`

### 2. **Version Check on App Load**
- On every app startup (`main.jsx`), checks stored version vs. current version
- Compares:
  - **Stored version**: Saved in `localStorage.getItem('questify_app_version')`
  - **Current version**: Read from meta tag in `index.html`

### 3. **Automatic Cache Clear & Reload**
- If versions differ → New deployment detected
- Actions taken:
  1. ✅ **Preserves auth tokens** (user stays logged in)
  2. ✅ **Clears all other localStorage** (removes old cached data)
  3. ✅ **Clears sessionStorage**
  4. ✅ **Stores new version**
  5. ✅ **Forces page reload** (fetches fresh JavaScript/CSS)

### 4. **User Experience**
- **Seamless**: User stays logged in (tokens preserved)
- **Fast**: Happens automatically, no user action needed
- **Transparent**: Console log shows "🔄 New app version detected..."

---

## Code Flow

```
App Loads
    ↓
main.jsx → initVersionCheck()
    ↓
Get stored version from localStorage
    ↓
Get current version from meta tag
    ↓
Versions match? ──No──→ Clear cache + Reload ──→ Get fresh code ✅
    │
   Yes
    ↓
Continue normally (use cached code) ✅
```

---

## Files Modified

1. **`src/utils/versionCheck.js`** (NEW)
   - Version checking logic
   - Cache clearing with token preservation
   - Smart reload handling

2. **`src/main.jsx`**
   - Added `initVersionCheck()` call before app renders

3. **`vite.config.js`**
   - Added `injectVersionPlugin()` to inject build timestamp

4. **`index.html`**
   - Added `<meta name="app-version" content="__APP_VERSION__" />`
   - Plugin replaces `__APP_VERSION__` with timestamp at build time

---

## Development Mode

- **Version check is DISABLED in dev mode** (`import.meta.env.DEV`)
- Prevents constant reloads during development
- Uses fixed version `'dev-version'` for consistency

---

## Production Behavior

### First Visit:
1. No stored version → Stores current version
2. App loads normally

### After Deployment:
1. Student opens app
2. Version check runs → Detects new version
3. Cache cleared, page reloaded
4. Fresh code loaded ✅
5. User stays logged in ✅

### Subsequent Visits (Same Version):
1. Versions match → No reload
2. Uses cached code (faster loading)

---

## Benefits

✅ **Automatic**: No manual cache clearing needed  
✅ **Preserves Login**: Auth tokens never lost  
✅ **Fast**: Only reloads when new version detected  
✅ **Reliable**: Works for all users automatically  
✅ **Production Only**: Doesn't interfere with development  

---

## Testing

### Test New Deployment:
1. Build and deploy new version
2. User opens app (with old cached code)
3. Check browser console → Should see "🔄 New app version detected..."
4. Page should reload once
5. User should remain logged in
6. New features should be available

### Verify It Works:
```javascript
// In browser console, check versions:
localStorage.getItem('questify_app_version')  // Stored version
document.querySelector('meta[name="app-version"]').content  // Current version
```

---

## Future Improvements (Optional)

- Add visual indicator ("Updating app...") during reload
- Add version endpoint from backend for more control
- Add rollback mechanism if version check fails

