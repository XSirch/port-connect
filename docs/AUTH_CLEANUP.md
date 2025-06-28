# Authentication State Cleanup Documentation

## Overview

The PortConnect application implements comprehensive authentication state cleanup to ensure complete session termination and prevent unauthorized access. This system provides multiple levels of cleanup for different scenarios.

## Features Implemented

### 1. **Comprehensive Logout Functionality**

#### Quick Logout (`quickLogout`)
- Preserves user preferences and non-sensitive data
- Clears authentication tokens and session data
- Redirects to login page
- **Use case**: Normal user logout

#### Complete Logout (`completeLogout`)
- Clears all authentication data including preferences
- Comprehensive cleanup of all storage
- Force redirects to login page
- **Use case**: Security-conscious logout or shared devices

#### Emergency Cleanup (`emergencyCleanup`)
- Nuclear option - clears everything
- Resets entire application state
- Force page reload
- **Use case**: Security incidents or corrupted auth state

### 2. **Automatic Tab/Window Close Handling**

#### BeforeUnload Event Listener
- Automatically clears sensitive tokens when tab is closed
- Preserves non-sensitive preferences
- Works across all modern browsers
- Synchronous cleanup for immediate effect

#### Visibility Change Detection
- Clears temporary session data when tab is hidden
- Monitors page visibility changes
- Cleans up sensitive data on tab switching

#### Focus/Blur Management
- Validates session integrity when app regains focus
- Clears temporary data when app loses focus
- Automatic session expiration checking

### 3. **Storage Management**

#### localStorage Cleanup
- Removes authentication tokens
- Clears Supabase-specific keys
- Optionally preserves user preferences
- Clears cached API responses

#### sessionStorage Cleanup
- Complete clearing of session data
- Removes temporary authentication data
- Clears pending auth states

#### Cookie Management
- Clears authentication cookies for current domain
- Handles subdomain cookie cleanup
- Cross-domain cookie clearing

## Usage Examples

### Basic Usage in Components

```typescript
import { useAuthCleanup } from '../hooks/useAuthCleanup'

const MyComponent = () => {
  const { quickLogout, completeLogout, emergencyCleanup } = useAuthCleanup()

  const handleLogout = async () => {
    await quickLogout() // Normal logout
  }

  const handleSecureLogout = async () => {
    await completeLogout() // Complete cleanup
  }

  const handleEmergency = async () => {
    await emergencyCleanup() // Nuclear option
  }

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={handleSecureLogout}>Secure Logout</button>
      <button onClick={handleEmergency}>Emergency Reset</button>
    </div>
  )
}
```

### Direct AuthContext Usage

```typescript
import { useAuth } from '../contexts/AuthContext'

const MyComponent = () => {
  const { signOut, forceSignOut, clearAllAuthData } = useAuth()

  const handleNormalSignOut = async () => {
    await signOut() // Standard sign out with preference preservation
  }

  const handleForceSignOut = async () => {
    await forceSignOut() // Force sign out with complete cleanup
  }

  const handleClearData = async () => {
    await clearAllAuthData() // Clear data without signing out
  }
}
```

## Security Considerations

### Data Cleared on Logout
- ✅ Authentication tokens (access & refresh)
- ✅ Supabase session data
- ✅ User session information
- ✅ Cached API responses
- ✅ Authentication cookies
- ✅ Temporary session data

### Data Preserved (Quick Logout Only)
- ✅ User preferences (theme, language)
- ✅ Non-sensitive application settings
- ✅ UI state preferences

### Browser Compatibility
- ✅ Chrome (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (all versions)
- ✅ Edge (all versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Testing

### Development Testing Component

The `AuthCleanupTest` component (development only) provides:
- Real-time storage monitoring
- Test data injection
- Manual cleanup testing
- Storage content inspection

### Manual Testing Steps

1. **Login and add test data**
2. **Check storage contents** (localStorage, sessionStorage, cookies)
3. **Test different logout methods**
4. **Verify complete cleanup**
5. **Test tab close behavior**
6. **Verify no auto-login after cleanup**

## Implementation Details

### Files Modified/Created

- `src/contexts/AuthContext.tsx` - Enhanced with cleanup functions
- `src/utils/authUtils.ts` - Comprehensive cleanup utilities
- `src/hooks/useAuthCleanup.ts` - Custom hook for cleanup operations
- `src/components/AuthCleanupTest.tsx` - Development testing component
- `src/components/Layout.tsx` - Updated logout handling

### Key Functions

- `comprehensiveAuthCleanup()` - Main cleanup function
- `clearAuthCookies()` - Cookie cleanup
- `clearCachedApiData()` - API cache cleanup
- `setupTabCloseCleanup()` - Tab close event handling
- `emergencyAuthReset()` - Nuclear cleanup option

## Troubleshooting

### Common Issues

1. **Auto-login after logout**
   - Ensure `forceSignOut()` is used instead of `signOut()`
   - Check for cached tokens in browser dev tools

2. **Incomplete cleanup**
   - Use `emergencyCleanup()` for stubborn cases
   - Clear browser cache manually if needed

3. **Session persistence**
   - Verify Supabase session is properly cleared
   - Check for custom session storage implementations

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('auth_debug', 'true')
```

This will provide detailed cleanup logs in the browser console.

## Production Considerations

- The `AuthCleanupTest` component is automatically hidden in production
- Debug logging is disabled in production builds
- Emergency cleanup should be used sparingly
- Monitor cleanup performance on slower devices

## Future Enhancements

- [ ] Biometric authentication cleanup
- [ ] Multi-tab session synchronization
- [ ] Advanced session timeout handling
- [ ] Audit logging for security events
