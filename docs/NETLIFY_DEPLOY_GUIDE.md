# 🆓 Deploy Gratuito no Netlify

## ✅ **Vantagens do Netlify:**
- **Gratuito:** Sem limitações de projetos
- **HTTPS:** Automático
- **Deploy:** Drag & drop simples
- **Farcaster:** Funciona perfeitamente
- **CDN:** Global e rápido

## 🚀 **Como fazer deploy:**

### **Opção 1: Drag & Drop (Mais fácil)**

1. **Fazer build do projeto:**
   ```bash
   npm run build
   ```

2. **Acessar Netlify:**
   - Ir para [netlify.com](https://netlify.com)
   - Fazer login (gratuito)

3. **Deploy:**
   - Arrastar pasta `dist/` para a área de deploy
   - Aguardar deploy (30 segundos)
   - Copiar URL gerada

### **Opção 2: GitHub + Netlify (Automático)**

1. **Criar repo no GitHub:**
   - Criar repositório público
   - Fazer push do código

2. **Conectar no Netlify:**
   - Acessar [netlify.com](https://netlify.com)
   - "New site from Git"
   - Conectar GitHub
   - Selecionar repositório

3. **Configurar build:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Deploy

## 🔧 **Configurações pós-deploy:**

### **1. Atualizar manifesto Farcaster:**
Após o deploy, atualizar o `farcaster.json` com o domínio do Netlify:

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjExODM2MTAsInR5cGUiOiJhdXRoIiwia2V5IjoiMHg3NEZiNzMzODA0NzMwZDVkOEM2ZUEwNDRmYWUzZTVkNjY2MzY2ODI3In0",
    "payload": "eyJkb21haW4iOiJzZXUtZG9tYWluLW5ldGxpZnkubmV0bGlmeS5hcHAifQ",
    "signature": "AUq6PYthASuxKWebMjE1dHsCRHwKheYXInO2XYVIUnRVE617LhJQIutxWzwbeFCHiZ35Bg7kF696atzlAfkE9xs="
  }
}
```

### **2. Testar com Farcaster:**
- URL: [https://farcaster.xyz/~/developers/mini-apps/preview](https://farcaster.xyz/~/developers/mini-apps/preview)
- Cole a URL do Netlify
- Testar autenticação

## 🔄 **Workflow de iteração:**

### **1. Deploy inicial:**
- Build: `npm run build`
- Upload: Drag & drop da pasta `dist/`
- Testar: Farcaster preview

### **2. Correções:**
- Fazer mudanças no código
- Build: `npm run build`
- Upload: Drag & drop novamente
- Testar: Farcaster preview

### **3. Deploy automático (GitHub):**
- Push para GitHub
- Deploy automático no Netlify
- Testar: Farcaster preview

## 📊 **Comparação de plataformas:**

| Plataforma | Gratuito | HTTPS | Deploy | Farcaster |
|------------|----------|-------|--------|-----------|
| **Netlify** | ✅ Ilimitado | ✅ | Drag & drop | ✅ |
| **Vercel** | ❌ 1 projeto | ✅ | CLI/Git | ✅ |
| **GitHub Pages** | ✅ Ilimitado | ✅ | Git | ✅ |
| **Render** | ✅ 1 projeto | ✅ | Git | ✅ |

## ⚠️ **Problemas comuns:**

### **1. Manifesto não acessível:**
- Verificar `netlify.toml`
- Testar URL `/.well-known/farcaster.json`
- Verificar headers

### **2. Build falha:**
- Verificar TypeScript errors
- Testar `npm run build` localmente
- Verificar dependências

### **3. Farcaster não carrega:**
- Verificar HTTPS
- Testar manifesto
- Verificar CORS

---

**💡 Dica**: Use Netlify com drag & drop para deploy super rápido! Cada mudança pode ser testada em 30 segundos.
