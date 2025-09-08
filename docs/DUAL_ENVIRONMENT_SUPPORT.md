# 🌐 Suporte para Mobile App e Web App do Farcaster

## ❌ **Problema identificado:**
- **Mini app:** Funciona apenas dentro do Farcaster mobile/web app
- **Web app:** Não funcionava como web app standalone
- **Causa:** Implementação apenas para `window.farcaster` (mini app)

## ✅ **Solução implementada:**

### **1. Detecção de ambiente:**
- **Mini App:** `window.farcaster` + `window.farcaster.sign_in`
- **Web App:** `window.FarcasterAuthKit` + `window.FarcasterAuthKit.signIn`
- **Desenvolvimento:** Fallback para mock user

```javascript
// Check if we're in a Farcaster mini app environment
const isMiniApp = window.farcaster && window.farcaster.sign_in;
// Check if we're in a standalone web app environment
const isWebApp = window.FarcasterAuthKit && window.FarcasterAuthKit.signIn;
```

### **2. Autenticação adaptativa:**
- **Mini App:** Usa `window.farcaster.sign_in()` e `window.farcaster.get_user_data()`
- **Web App:** Usa `window.FarcasterAuthKit.signIn()` e `window.FarcasterAuthKit.getUser()`
- **Logs:** Mostra qual ambiente foi detectado

```javascript
if (isMiniApp && window.farcaster) {
  console.log("📱 Mini App environment detected - using window.farcaster");
  // Mini app authentication logic
} else if (isWebApp && window.FarcasterAuthKit) {
  console.log("🌐 Web App environment detected - using FarcasterAuthKit");
  // Web app authentication logic
}
```

### **3. SDK types atualizados:**
- **Mini App SDK:** `window.farcaster` com `sign_in`, `get_user_data`, `actions.ready`
- **Web App SDK:** `window.FarcasterAuthKit` com `signIn`, `getUser`
- **TypeScript:** Tipos definidos para ambos os ambientes

```typescript
declare global {
  interface Window {
    // Mini App SDK (inside Farcaster mobile/web app)
    farcaster?: {
      sign_in: () => Promise<{ fid: number; username: string; pfp_url: string; ... }>;
      get_user_data: () => Promise<{ fid: number; username: string; pfp_url: string; } | null>;
      actions?: { ready: () => void; };
    };
    // Web App SDK (standalone web app)
    FarcasterAuthKit?: {
      signIn: () => Promise<any>;
      getUser: () => Promise<any>;
    };
  }
}
```

## 🎯 **Como funciona agora:**

### **1. Mini App (dentro do Farcaster):**
- **Detecção:** `window.farcaster` disponível
- **Autenticação:** `window.farcaster.sign_in()`
- **Dados:** `window.farcaster.get_user_data()`
- **Ready:** `window.farcaster.actions.ready()`
- **Resultado:** Funciona dentro do Warpcast/Farcaster web

### **2. Web App (standalone):**
- **Detecção:** `window.FarcasterAuthKit` disponível
- **Autenticação:** `window.FarcasterAuthKit.signIn()`
- **Dados:** `window.FarcasterAuthKit.getUser()`
- **Resultado:** Funciona como web app standalone

### **3. Desenvolvimento:**
- **Detecção:** Nenhum SDK disponível
- **Autenticação:** Mock user
- **Resultado:** Funciona para desenvolvimento local

## 🔍 **Logs esperados:**

### **Mini App:**
```
🔍 Environment detection:
  - isMiniApp: true
  - isWebApp: false
  - window.farcaster: true
  - window.FarcasterAuthKit: false
📱 Mini App environment detected - using window.farcaster
```

### **Web App:**
```
🔍 Environment detection:
  - isMiniApp: false
  - isWebApp: true
  - window.farcaster: false
  - window.FarcasterAuthKit: true
🌐 Web App environment detected - using FarcasterAuthKit
```

### **Desenvolvimento:**
```
🔍 Environment detection:
  - isMiniApp: false
  - isWebApp: false
  - window.farcaster: false
  - window.FarcasterAuthKit: false
Farcaster SDK not found. Displaying developer login options.
```

## 🚀 **Como testar:**

### **1. Mini App (Farcaster Preview):**
- **URL:** [Farcaster Preview](https://farcaster.xyz/~/developers/mini-apps/preview)
- **Resultado:** Deve mostrar "📱 Mini App environment detected"
- **Autenticação:** Deve funcionar com usuário real

### **2. Web App (standalone):**
- **URL:** `https://castlist.netlify.app` (direto no navegador)
- **Resultado:** Deve mostrar "🌐 Web App environment detected"
- **Autenticação:** Deve funcionar com FarcasterAuthKit

### **3. Desenvolvimento:**
- **URL:** `http://localhost:5173`
- **Resultado:** Deve mostrar "Farcaster SDK not found"
- **Autenticação:** Deve usar mock user

## ⚠️ **Importante:**

### **1. Ambientes suportados:**
- **✅ Mini App:** Dentro do Farcaster mobile/web app
- **✅ Web App:** Standalone web app
- **✅ Desenvolvimento:** Local com mock user

### **2. SDKs necessários:**
- **Mini App:** `window.farcaster` (injetado pelo Farcaster)
- **Web App:** `window.FarcasterAuthKit` (precisa ser carregado)
- **Desenvolvimento:** Nenhum (usa mock)

### **3. Debug:**
- Verificar logs do console
- Deve mostrar qual ambiente foi detectado
- Deve usar o SDK apropriado para cada ambiente

---

**💡 Dica**: Agora o app funciona tanto como mini app dentro do Farcaster quanto como web app standalone! A detecção de ambiente é automática e usa o SDK apropriado.
