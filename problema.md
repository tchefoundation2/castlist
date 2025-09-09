# Farcaster Mini App v2 Embedding Issues - Technical Problems

## Overview
We're experiencing persistent issues with embedding our Farcaster Mini App v2 on the Farcaster platform. Despite following the official documentation and implementing all required specifications, the app fails to load properly in the Farcaster Preview Tool and embedded contexts.

## Current Status
- **App URL**: https://castlisttest.vercel.app
- **Manifest URL**: https://castlisttest.vercel.app/.well-known/farcaster.json
- **Platform**: Vercel (deployed from GitHub)
- **Compliance**: 100% Farcaster Mini App v2 specification compliant

## Technical Issues

### 1. X-Frame-Options Header Problem
**Issue**: The Vercel platform is overriding our `X-Frame-Options: ALLOWALL` header with `X-Frame-Options: DENY`, preventing iframe embedding.

**Error Message**:
```
Refused to display 'https://castlisttest.vercel.app/' in a frame because it set 'X-Frame-Options' to 'deny'.
```

**Attempted Solutions**:
- ✅ Set `X-Frame-Options: ALLOWALL` in `vercel.json`
- ✅ Set `X-Frame-Options: ALLOWALL` in `public/_headers`
- ✅ Added `X-Frame-Options: ALLOWALL` in `next.config.js`
- ✅ Created `middleware.js` to force headers
- ✅ Reordered headers to prioritize `X-Frame-Options`

**Result**: Vercel still returns `X-Frame-Options: DENY` despite our configuration.

### 2. Content Security Policy (CSP) Issues
**Issue**: CSP `frame-ancestors` directive not being respected, causing embedding failures.

**Current CSP Configuration**:
```
Content-Security-Policy: frame-ancestors https://farcaster.xyz https://*.farcaster.xyz https://preview.farcaster.xyz https://wallet.farcaster.xyz; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://esm.sh https://unpkg.com https://cdn.jsdelivr.net https://client.farcaster.xyz; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https: wss: data:; frame-src 'self' https://farcaster.xyz https://preview.farcaster.xyz https://wallet.farcaster.xyz; object-src 'none'; base-uri 'self'; form-action 'self';
```

**Attempted Solutions**:
- ✅ Added all Farcaster domains to `frame-ancestors`
- ✅ Added `wallet.farcaster.xyz` to `frame-ancestors`
- ✅ Configured CSP in multiple files (`vercel.json`, `_headers`, `next.config.js`)

### 3. CORS Configuration Issues
**Issue**: Cross-Origin Resource Sharing (CORS) headers not properly configured for Farcaster embedding.

**Current CORS Headers**:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

**Attempted Solutions**:
- ✅ Set `Access-Control-Allow-Origin: *`
- ✅ Added all necessary CORS headers
- ✅ Configured CORS in multiple configuration files
- ✅ Added `Access-Control-Allow-Credentials: true`

### 4. Manifest Access Issues
**Issue**: Initial 401 Unauthorized errors when accessing the manifest file.

**Error Message**:
```
HTTP Status: ✕ 401
Body: <!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Authentication Required</title>
```

**Attempted Solutions**:
- ✅ Created rewrite rule: `/.well-known/farcaster.json` → `/farcaster.json`
- ✅ Added specific headers for manifest file
- ✅ Created `_redirects` file with `200!` status
- ✅ Configured manifest in both `public/farcaster.json` and `public/.well-known/farcaster.json`

**Result**: Manifest is now accessible (200 OK) but embedding still fails.

### 5. Vercel Platform Limitations
**Issue**: Vercel appears to have platform-level restrictions that override our header configurations.

**Evidence**:
- Headers are correctly configured in multiple files
- Local testing works fine
- Vercel deployment shows `X-Frame-Options: DENY` despite our `ALLOWALL` setting
- No way to override Vercel's default security headers

## Manifest Configuration (v2 Compliant)

### Current Manifest Structure
```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjExODM2MTAsInR5cGUiOiJhdXRoIiwia2V5IjoiMHg3NEZiNzMzODA0NzMwZDVkOEM2ZUEwNDRmYWUzZTVkNjY2MzY2ODI3In0",
    "payload": "eyJkb21haW4iOiJjYXN0bGlzdHRlc3QudmVyY2VsLmFwcCJ9",
    "signature": "Piy5+ObxTJd9d1XWuEobYqT873GbFS3oVwTfJeBiu3NbsnQ+VJ+L6cyWEQQzvi8fgp2+vkwPiOD4FbbzF8Ra7Bs="
  },
  "frame": {
    "version": "1",
    "name": "Castlist",
    "iconUrl": "https://castlisttest.vercel.app/farcaster-white.svg",
    "homeUrl": "https://castlisttest.vercel.app",
    "imageUrl": "https://castlisttest.vercel.app/farcaster-white.svg",
    "buttonTitle": "Open Castlist",
    "splashImageUrl": "https://castlisttest.vercel.app/farcaster-white.svg",
    "splashBackgroundColor": "#8A63D2"
  }
}
```

### Meta Tags Configuration
```html
<meta name="fc:miniapp" content='{"version":"1","imageUrl":"https://castlisttest.vercel.app/farcaster-white.svg","button":{"title":"Open Castlist","action":{"type":"launch_frame","name":"Castlist","url":"https://castlisttest.vercel.app","splashImageUrl":"https://castlisttest.vercel.app/farcaster-white.svg","splashBackgroundColor":"#8A63D2"}}}' />
```

## Files and Configuration

### 1. vercel.json
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "ALLOWALL"
        },
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors https://farcaster.xyz https://*.farcaster.xyz https://preview.farcaster.xyz https://wallet.farcaster.xyz; ..."
        }
      ]
    }
  ]
}
```

### 2. public/_headers
```
/*
  X-Frame-Options: ALLOWALL
  Content-Security-Policy: frame-ancestors https://farcaster.xyz https://*.farcaster.xyz https://preview.farcaster.xyz https://wallet.farcaster.xyz; ...
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
  Access-Control-Allow-Credentials: true
```

### 3. middleware.js
```javascript
export function middleware(request) {
  const response = new Response(null, {
    status: 200,
    headers: {
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors https://farcaster.xyz https://*.farcaster.xyz https://preview.farcaster.xyz https://wallet.farcaster.xyz; ...",
      'Access-Control-Allow-Origin': '*',
      // ... other headers
    }
  });
  return response;
}
```

## Questions for the Community

1. **Vercel Compatibility**: Are there known issues with Vercel and Farcaster Mini App embedding? Should we use a different hosting platform?

2. **Header Override**: How can we prevent Vercel from overriding our `X-Frame-Options: ALLOWALL` header?

3. **Alternative Solutions**: Are there alternative approaches to enable iframe embedding on Vercel?

4. **Platform Recommendations**: What hosting platforms work best with Farcaster Mini Apps?

5. **Debugging Tools**: What tools can we use to debug iframe embedding issues?

## Current Workarounds Attempted

1. **Multiple Configuration Files**: Tried configuring headers in `vercel.json`, `_headers`, `next.config.js`, and `middleware.js`
2. **Header Reordering**: Placed `X-Frame-Options` first in all configurations
3. **Domain Variations**: Added all possible Farcaster domains to CSP
4. **CORS Configuration**: Implemented comprehensive CORS headers
5. **Manifest Rewrites**: Created rewrite rules for manifest access

## Expected Behavior vs Actual Behavior

**Expected**: App should load in Farcaster Preview Tool and embedded contexts without iframe restrictions.

**Actual**: App fails to load due to `X-Frame-Options: DENY` error, despite our configuration.

## Technical Environment

- **Framework**: React + Vite
- **Hosting**: Vercel
- **Domain**: castlisttest.vercel.app
- **Node Version**: 18+
- **Build Tool**: Vite
- **Package Manager**: npm

## Contact Information

- **Repository**: https://github.com/tchefoundation2/castlist
- **Branch**: castlist-refatoracao
- **App URL**: https://castlisttest.vercel.app
- **Manifest URL**: https://castlisttest.vercel.app/.well-known/farcaster.json

---

**Note**: This is a technical issue report for the Farcaster community. We've followed all official documentation and best practices but are still experiencing embedding issues. Any help or guidance would be greatly appreciated.
