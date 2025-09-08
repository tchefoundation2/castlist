# 🔐 Problema: Usuário Mock em vez do Real Farcaster

## ❌ **Problema identificado:**

- **Usuário mock:** App ainda pega usuário mock em vez do real Farcaster
- **SDK incorreto:** Usando `@farcaster/miniapp-sdk` (para mini apps)
- **API errada:** SDK não tem `getUser()` ou `signIn()`

## 🔍 **Análise do problema:**

### **1. SDK Atual:**
```javascript
// index.html - SDK incorreto
import { sdk } from 'https://esm.sh/@farcaster/miniapp-sdk';
window.farcaster = sdk;
```

### **2. API Esperada:**
```javascript
// useAuth.tsx - tentando usar API que não existe
const farcasterUser = await window.farcaster.get_user_data();
```

### **3. Problema:**
- **`@farcaster/miniapp-sdk`** é para **mini apps dentro do Farcaster**
- **Não tem** `getUser()` ou `signIn()`
- **Tem** `sdk.actions.ready()` mas não autenticação

## ✅ **Soluções possíveis:**

### **Opção 1: Usar AuthKit para Web Apps**
```javascript
// Para web apps standalone
import { AuthKitProvider, SignInButton, useProfile } from '@farcaster/auth-kit';
```

### **Opção 2: Usar SDK correto para Mini Apps**
```javascript
// Para mini apps dentro do Farcaster
import { sdk } from '@farcaster/miniapp-sdk';
// Usar sdk.getUser() se disponível
```

### **Opção 3: Detectar ambiente e usar SDK apropriado**
```javascript
// Detectar se é mini app ou web app
const isMiniApp = window.farcaster && window.farcaster.actions;
const isWebApp = window.FarcasterAuthKit;
```

## 🎯 **Recomendação:**

### **Para Mini Apps (dentro do Farcaster):**
- **SDK:** `@farcaster/miniapp-sdk`
- **API:** `sdk.getUser()` (se disponível)
- **Ready:** `sdk.actions.ready()`

### **Para Web Apps (standalone):**
- **SDK:** `@farcaster/auth-kit`
- **API:** `useProfile()` hook
- **Login:** `SignInButton` component

## 🔧 **Próximos passos:**

1. **Verificar documentação oficial** do `@farcaster/miniapp-sdk`
2. **Implementar detecção de ambiente** correta
3. **Usar SDK apropriado** para cada ambiente
4. **Testar** com usuário real do Farcaster

## 📚 **Referências:**

- [Farcaster Mini Apps SDK](https://miniapps.farcaster.xyz/docs/getting-started)
- [Farcaster AuthKit](https://docs.farcaster.xyz/auth-kit)
- [SDK Methods](https://miniapps.farcaster.xyz/docs/sdk/context)

---

**💡 Dica**: O problema é que estamos usando o SDK errado! Precisamos usar o SDK correto para cada ambiente (mini app vs web app).
