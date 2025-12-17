# Storage Strategy Guide for Questify

## Current Usage (localStorage)

✅ **What you're doing RIGHT:**
- `token` → localStorage (needs to persist)
- `user` → localStorage (needs to persist)
- `questify_app_version` → localStorage (needs to persist)

## Recommended Storage Strategy

### Use **localStorage** for:

1. **Authentication Data** ✅ (Already doing this)
   - `token` - Must persist across sessions
   - `user` - Must persist across sessions
   - Why: Students should stay logged in

2. **User Preferences** (If you add these)
   - Theme (dark/light mode)
   - Language preference
   - Dashboard layout preferences
   - Why: User wants these saved

3. **App State** (If you add these)
   - App version (already doing)
   - Last visited page
   - Why: App-level settings

### Use **sessionStorage** for:

1. **Temporary Form Data**
   - Quiz answer drafts (if auto-save during quiz)
   - Unsubmitted form data
   - Why: Should reset when tab closes (privacy)

2. **Temporary UI State**
   - Active filters (admin responses tab)
   - Scroll positions
   - Collapsed/expanded sections
   - Why: Reset on new session is fine

3. **Temporary Cache**
   - Recently viewed assignments
   - Search history (if temporary)
   - Why: Not critical to persist

4. **Sensitive Temporary Data**
   - OTP codes
   - Temporary tokens
   - Why: Should auto-clear for security

### Example Hybrid Usage:

```javascript
// Authentication (PERSISTENT) - localStorage ✅
localStorage.setItem('token', token)
localStorage.setItem('user', JSON.stringify(user))

// Temporary UI state (SESSION-ONLY) - sessionStorage
sessionStorage.setItem('activeFilters', JSON.stringify(filters))
sessionStorage.setItem('scrollPosition', scrollY)

// User preferences (PERSISTENT) - localStorage
localStorage.setItem('theme', 'dark')
localStorage.setItem('language', 'en')
```

## Security Considerations

### localStorage:
- ✅ Good for: Non-sensitive data that needs to persist
- ⚠️ Risk: XSS attacks can access it
- ✅ Safe for: Auth tokens (backend validates), user preferences

### sessionStorage:
- ✅ Good for: Sensitive temporary data
- ✅ Auto-clears: More secure for sensitive info
- ⚠️ Limitation: Doesn't persist across tabs

## Best Practice: What Data Goes Where?

### Quiz Taking Flow:

```javascript
// Start Quiz
sessionStorage.setItem('quizStartTime', Date.now())
sessionStorage.setItem('currentQuizId', quizId)

// Answer questions (if you want auto-save drafts)
sessionStorage.setItem('draftAnswers', JSON.stringify(answers))

// Submit Quiz
sessionStorage.removeItem('draftAnswers')
sessionStorage.removeItem('currentQuizId')
// ✅ Data saved to backend, sessionStorage cleared

// User stays logged in (localStorage token remains)
```

### Admin View Responses:

```javascript
// User sets filters
sessionStorage.setItem('responseFilters', JSON.stringify({
  assignmentId: '123',
  studentId: '456',
  // ... other filters
}))

// On page load, restore filters
const savedFilters = sessionStorage.getItem('responseFilters')
// ✅ Filters restored, but reset when tab closes (good UX)
```

## Current App Assessment

### ✅ Your Current Approach is CORRECT

For your app's primary use case:
- **localStorage for auth**: ✅ Perfect (students need persistent login)
- **No sessionStorage usage**: ✅ Fine (you don't need it yet)

### Future Enhancements to Consider:

1. **Add sessionStorage for:**
   - Quiz answer drafts (if implementing auto-save)
   - Admin filter state (restore filters, but reset on close)
   - Form state (prevent data loss on accidental close)

2. **Keep localStorage for:**
   - Everything you're already doing ✅
   - Any user preferences you add later

## Recommendation

**For Questify app:**
- ✅ **Keep using localStorage for auth** (current approach is correct)
- ✅ **Add sessionStorage only if you need temporary UI state**
- ✅ **Don't change current auth storage** (it's perfect for your use case)

The key question: **"Should this data survive browser close?"**
- **YES** → localStorage
- **NO** → sessionStorage

