# 🔧 Vercel Deployment Protection Fix

## ❌ **Root Cause Identified**

The issue is **Vercel's Deployment Protection** feature, which automatically injects `X-Frame-Options: DENY` headers to prevent clickjacking. These platform-level headers override any configuration we set in `vercel.json` or other files.

## ✅ **Solution: Disable Vercel Deployment Protection**

### Step 1: Access Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `castlist`

### Step 2: Navigate to Settings
1. Click on the **Settings** tab
2. Select **Deployments** from the side menu

### Step 3: Disable Deployment Protection
1. Scroll down to the **Deployment Protection** section
2. **Disable** the protection for your deployment environment
3. Set it to **"No protection enabled"**

### Step 4: Redeploy
1. Go to the **Deployments** tab
2. Click **"Redeploy"** on your latest deployment
3. Wait for the deployment to complete

## 🎯 **Expected Result**

After disabling Deployment Protection and redeploying:
- ✅ `X-Frame-Options: DENY` will be removed
- ✅ Our `Content-Security-Policy` with `frame-ancestors` will work
- ✅ App will embed properly in Farcaster Preview Tool
- ✅ No more iframe blocking errors

## 📋 **Verification Steps**

### 1. Check Headers
1. Open browser Developer Tools (F12)
2. Go to **Network** tab
3. Load `https://castlisttest.vercel.app`
4. Click on the first request (the document)
5. Check **Response Headers**:
   - ❌ Should NOT see `X-Frame-Options: DENY`
   - ✅ Should see `Content-Security-Policy: frame-ancestors ...`

### 2. Test Farcaster Preview Tool
1. Go to [Farcaster Preview Tool](https://farcaster.xyz/~/developers/mini-apps/preview)
2. Enter URL: `https://castlisttest.vercel.app`
3. Should load without iframe errors

## 🔧 **Current Configuration (Simplified)**

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors 'self' https://farcaster.xyz https://*.farcaster.xyz https://warpcast.com https://*.warpcast.com https://client.warpcast.com;"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

## ⚠️ **Important Notes**

1. **Single Source of Truth**: Only use `vercel.json` for headers (removed `next.config.js`, `middleware.js`)
2. **No X-Frame-Options**: Let CSP `frame-ancestors` handle framing permissions
3. **Simplified Headers**: Removed complex CSP and CORS configurations that could conflict
4. **Warpcast Domains**: Added `warpcast.com` and subdomains for better compatibility

## 🚀 **Next Steps**

1. **Disable Deployment Protection** in Vercel Dashboard
2. **Redeploy** the application
3. **Test** in Farcaster Preview Tool
4. **Verify** headers in browser DevTools
5. **Confirm** embedding works without errors

---

**This fix addresses the root cause identified by the Farcaster community and should resolve all embedding issues.**
