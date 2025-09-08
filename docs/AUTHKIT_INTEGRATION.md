# 🔐 Integração com Farcaster AuthKit

## ❌ **Problema identificado:**
- **Tela customizada:** Estávamos forçando nossa tela de login em todos os ambientes
- **Web App:** Deveria usar AuthKit para melhor UX
- **Mini App:** Nossa tela customizada está correta

## ✅ **Solução implementada:**

### **1. Detecção de ambiente:**
- **Mini App:** `window.farcaster` + `window.farcaster.sign_in`
- **Web App:** `window.FarcasterAuthKit` + `window.FarcasterAuthKit.signIn`
- **Desenvolvimento:** Fallback para tela customizada

```javascript
// Check environment
const isMiniApp = window.farcaster && window.farcaster.sign_in;
const isWebApp = window.FarcasterAuthKit && window.FarcasterAuthKit.signIn;
```

### **2. AuthKit para Web Apps:**
- **Componente:** `FarcasterAuthKit.tsx`
- **AuthKit Provider:** Configurado com domínio
- **SignIn Button:** Componente oficial do Farcaster
- **UX:** Interface consistente com outros apps

```jsx
<AuthKitProvider config={config}>
  <div className="min-h-screen flex flex-col items-center justify-center">
    <h1>Castlist</h1>
    <h2>Transform your Readings into a Social Journey</h2>
    <SignInButton />
  </div>
</AuthKitProvider>
```

### **3. Tela customizada para Mini Apps:**
- **LoginPage:** Nossa tela customizada
- **SDK direto:** `window.farcaster.sign_in()`
- **UX personalizada:** Interface específica para mini app

```jsx
if (isWebApp && !isMiniApp) {
  return <FarcasterAuthKit />; // Web app
}

if (!isAuthenticated) {
  return <LoginPage />; // Mini app ou desenvolvimento
}
```

## 🎯 **Como funciona agora:**

### **1. Mini App (dentro do Farcaster):**
- **Detecção:** `window.farcaster` disponível
- **Interface:** Nossa tela customizada (`LoginPage`)
- **Autenticação:** `window.farcaster.sign_in()`
- **UX:** Personalizada para mini app

### **2. Web App (standalone):**
- **Detecção:** `window.FarcasterAuthKit` disponível
- **Interface:** AuthKit oficial (`FarcasterAuthKit`)
- **Autenticação:** `window.FarcasterAuthKit.signIn()`
- **UX:** Consistente com outros apps

### **3. Desenvolvimento:**
- **Detecção:** Nenhum SDK disponível
- **Interface:** Nossa tela customizada (`LoginPage`)
- **Autenticação:** Mock user
- **UX:** Para desenvolvimento local

## 🔍 **Logs esperados:**

### **Mini App:**
```
🔍 App environment detection:
  - isMiniApp: true
  - isWebApp: false
📱 Using custom login for mini app or development
```

### **Web App:**
```
🔍 App environment detection:
  - isMiniApp: false
  - isWebApp: true
🌐 Using AuthKit for web app
```

### **Desenvolvimento:**
```
🔍 App environment detection:
  - isMiniApp: false
  - isWebApp: false
📱 Using custom login for mini app or development
```

## 🚀 **Como testar:**

### **1. Mini App (Farcaster Preview):**
- **URL:** [Farcaster Preview](https://farcaster.xyz/~/developers/mini-apps/preview)
- **Resultado:** Deve mostrar "📱 Using custom login for mini app"
- **Interface:** Nossa tela customizada

### **2. Web App (standalone):**
- **URL:** `https://castlist.netlify.app` (direto no navegador)
- **Resultado:** Deve mostrar "🌐 Using AuthKit for web app"
- **Interface:** AuthKit oficial

### **3. Desenvolvimento:**
- **URL:** `http://localhost:5173`
- **Resultado:** Deve mostrar "📱 Using custom login for mini app"
- **Interface:** Nossa tela customizada

## ⚠️ **Importante:**

### **1. AuthKit config:**
- **Client ID:** Precisa ser configurado para produção
- **Domínio:** Configurado automaticamente
- **Configuração:** Pode precisar de ajustes

### **2. Ambientes suportados:**
- **✅ Mini App:** Tela customizada (correto)
- **✅ Web App:** AuthKit oficial (correto)
- **✅ Desenvolvimento:** Tela customizada (correto)

### **3. Debug:**
- Verificar logs do console
- Deve mostrar qual interface está sendo usada
- Deve usar o SDK apropriado para cada ambiente

---

**💡 Dica**: Agora usamos a abordagem correta para cada ambiente! Mini apps usam tela customizada, web apps usam AuthKit oficial.
