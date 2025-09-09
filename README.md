# Castlist: Farcaster Miniapp v2 Compliance

This directory contains the complete, self-contained `castlist` mini-application designed for **100% Farcaster Miniapp v2 compliance**.

## 🎯 Current Status: Refactoring for v2 Compliance

### **❌ Current Issues (Non-Compliant):**
- Custom login buttons (not allowed in v2)
- Manual authentication flow
- Complex environment detection
- Missing required meta tags

### **✅ Target Compliance:**
- **Splash Screen Only:** No custom buttons, just loading
- **Quick Auth:** Automatic authentication via `sdk.quickAuth.getToken()`
- **Auto-Detection:** Simple miniapp environment detection
- **Meta Tags:** Required `fc:miniapp` tags for embeds

## 📋 Required Screens for v2 Compliance

### **�� Mandatory Screens:**
1. **Splash Screen** - Loading only, no buttons
2. **Quick Auth** - Automatic authentication
3. **Environment Detection** - `sdk.isInMiniApp()`
4. **Back Navigation** - `sdk.back()`

### **�� Optional Screens (Advanced Features):**
5. **Cast Composition** - Create/publish casts
6. **Wallet Integration** - Ethereum/Solana wallets
7. **Notifications** - User re-engagement

## �� Refactoring Plan

### **Phase 1: Remove Custom Buttons**
- [ ] Remove all "Sign in with Farcaster" buttons
- [ ] Simplify LoginPage to splash screen only
- [ ] Remove unnecessary auth components

### **Phase 2: Implement Quick Auth**
- [ ] Use `sdk.quickAuth.getToken()` for auto-authentication
- [ ] Remove manual login logic
- [ ] Keep only development fallback

### **Phase 3: Add Meta Tags**
- [ ] Implement `fc:miniapp` meta tags
- [ ] Configure for shareable pages

### **Phase 4: Compliance Testing**
- [ ] Test in Farcaster Preview Tool
- [ ] Verify "Ready not called" is resolved
- [ ] Confirm automatic authentication

## 📁 Files to Modify

### **Core Files:**
- `src/pages/LoginPage.tsx` - Simplify to splash screen
- `src/App.tsx` - Simplify environment detection
- `src/hooks/useAuth.tsx` - Implement Quick Auth
- `src/components/SDKDebug.tsx` - Simplify debug panel

### **Files to Remove:**
- `src/components/OfficialFarcasterAuth.tsx`
- `src/components/FarcasterAuthKit.tsx`
- `src/components/FarcasterMiniAppAuth.tsx`
- `src/components/DebugFarcasterAuth.tsx`
- `src/components/SimpleFarcasterAuth.tsx`

## 🛠️ How to Run

### **Development:**
```bash
npm run dev
```

### **Build:**
```bash
npm run build
```

### **Deploy:**
```bash
# Deploy to Netlify/Vercel
npm run build
# Upload dist/ folder
```

## �� Documentation

- [Farcaster Miniapp v2 Docs](https://miniapps.farcaster.xyz)
- [Quick Auth Guide](https://miniapps.farcaster.xyz/docs/sdk/quick-auth)
- [Loading Guide](https://miniapps.farcaster.xyz/docs/guides/loading)

## 🎯 Goal

Transform Castlist into a **100% compliant Farcaster Miniapp v2** with:
- ✅ No custom login buttons
- ✅ Automatic authentication
- ✅ Proper splash screen
- ✅ Required meta tags
- ✅ Clean, maintainable code

---

**Current Branch:** `refactor/miniapp-v2-compliance`  
**Target:** 100% Farcaster Miniapp v2 Compliance