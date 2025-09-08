# 🔴 Real Farcaster Integration

## ✅ **Funcionalidade implementada para usar Farcaster real:**

### **1. Toggle no Debug Panel**
- ✅ **Botão ON/OFF** para alternar entre Mock e Real
- ✅ **Indicador visual** do modo atual (🔴 Real / 🟡 Mock)
- ✅ **Persistência** no localStorage
- ✅ **Reload automático** para aplicar mudanças

### **2. Manifesto do Farcaster**
- ✅ **Arquivo `.well-known/farcaster.json`** criado
- ✅ **Metadados** do app (nome, descrição, ícone)
- ✅ **Permissões** necessárias (user:read, user:write)
- ✅ **Screenshots** e informações do desenvolvedor

### **3. Lógica de Injeção Atualizada**
- ✅ **Respeita preferência** do usuário
- ✅ **Mock SDK** só injeta se Real estiver OFF
- ✅ **SDK real** carrega automaticamente se disponível
- ✅ **Logs detalhados** para debugging

## 🎛️ **Como usar:**

### **1. Alternar para Farcaster Real:**
1. **Clique no debug panel** para expandir
2. **Clique no botão "OFF"** para ativar "ON"
3. **Aguarde o reload** automático da página
4. **Faça login** com seu Farcaster real

### **2. Voltar para Mock:**
1. **Clique no botão "ON"** para desativar "OFF"
2. **Aguarde o reload** automático da página
3. **Use o mock user** (preview_user)

## 🔧 **Arquivos modificados:**

### **1. SDKDebug.tsx**
```typescript
// Toggle para alternar entre Mock e Real
const [useRealFarcaster, setUseRealFarcaster] = useState(() => {
  return localStorage.getItem('useRealFarcaster') === 'true';
});

// Função para alternar e salvar preferência
const toggleRealFarcaster = () => {
  const newValue = !useRealFarcaster;
  setUseRealFarcaster(newValue);
  localStorage.setItem('useRealFarcaster', newValue.toString());
  // Reload automático para aplicar mudanças
  setTimeout(() => window.location.reload(), 1000);
};
```

### **2. useFarcasterSDK.tsx**
```typescript
// Parâmetro para controlar injeção do mock
export const useFarcasterSDK = (useRealFarcaster: boolean = false) => {
  // Só injeta mock se Real estiver OFF
  if (isInFarcasterPreview && !isLoaded && !useRealFarcaster) {
    console.log("🔄 Attempting to inject Mock Farcaster SDK...");
    injectFarcasterSDK();
  }
}
```

### **3. index.html**
```javascript
// Verifica preferência no localStorage
const useRealFarcaster = localStorage.getItem('useRealFarcaster') === 'true';

// Só injeta mock se Real estiver OFF
if (isInFarcasterPreview && !window.farcaster && !useRealFarcaster) {
  injectMockSDK();
}
```

### **4. .well-known/farcaster.json**
```json
{
  "name": "Castlist",
  "description": "Transform your Readings into a Social Journey",
  "icon": "/farcaster-white.svg",
  "splash": {
    "icon": "/farcaster-white.svg",
    "background": "#8A63D2"
  },
  "permissions": ["user:read", "user:write"],
  "version": "1.0.0"
}
```

## 🎯 **Como testar:**

### **1. Modo Mock (Padrão):**
- **Debug Panel:** Mostra "🟡 Mock"
- **Login:** preview_user (FID: 12345)
- **SDK:** Mock injetado automaticamente

### **2. Modo Real:**
- **Clique "OFF" → "ON"** no debug panel
- **Aguarde reload** automático
- **Debug Panel:** Mostra "🔴 Real"
- **Login:** Seu Farcaster real
- **SDK:** Farcaster real (se disponível)

## 🔍 **Debug Panel atualizado:**

### **Novos indicadores:**
- **Use Real Farcaster:** ON/OFF (botão clicável)
- **Mode:** 🔴 Real / 🟡 Mock
- **SDK Loaded:** Status do SDK
- **Has Actions:** Se tem ações disponíveis
- **SDK Ready:** Se está pronto
- **Farcaster:** Se o objeto existe
- **Preview Mode:** Se está no preview

## ⚠️ **Importante:**

### **1. Para usar Farcaster real:**
- ✅ **App deve estar** no preview oficial do Farcaster
- ✅ **URL deve ser** acessada via preview tool
- ✅ **SDK real** será injetado automaticamente pelo Farcaster

### **2. Para usar Mock:**
- ✅ **Funciona** em qualquer ambiente
- ✅ **SDK mock** é injetado automaticamente
- ✅ **Ideal** para desenvolvimento local

## 🚀 **Status atual:**

| **Funcionalidade** | **Status** | **Descrição** |
|-------------------|------------|---------------|
| **Toggle Real/Mock** | ✅ Ativo | Botão no debug panel |
| **Persistência** | ✅ Ativo | localStorage |
| **Reload automático** | ✅ Ativo | Aplica mudanças |
| **Manifesto** | ✅ Ativo | .well-known/farcaster.json |
| **SDK Real** | ✅ Ativo | Carrega automaticamente |
| **SDK Mock** | ✅ Ativo | Fallback quando Real OFF |

---

**💡 Dica**: Agora você pode alternar entre Mock e Real Farcaster facilmente! Use Mock para desenvolvimento local e Real para testar com seu Farcaster real no preview oficial.
