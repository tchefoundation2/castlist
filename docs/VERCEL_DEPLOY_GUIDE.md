# 🚀 Guia de Deploy no Vercel

## ✅ **Projeto preparado para deploy:**

### **1. Build funcionando:**
- ✅ TypeScript compilado sem erros
- ✅ Vite build concluído
- ✅ Arquivos gerados em `dist/`

### **2. Configurações do Vercel:**
- ✅ `vercel.json` criado
- ✅ Rotas configuradas para SPA
- ✅ Manifesto Farcaster configurado

### **3. Arquivos importantes:**
- ✅ `public/.well-known/farcaster.json` - Manifesto do Farcaster
- ✅ `vercel.json` - Configurações do Vercel
- ✅ `package.json` - Scripts e dependências

## 🚀 **Como fazer o deploy:**

### **Opção 1: Via Vercel CLI (Recomendado)**

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Fazer login no Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy do projeto:**
   ```bash
   vercel
   ```

4. **Deploy para produção:**
   ```bash
   vercel --prod
   ```

### **Opção 2: Via GitHub (Automático)**

1. **Criar repositório no GitHub:**
   - Criar repo: `castlist-standalone`
   - Fazer push do código

2. **Conectar no Vercel:**
   - Acessar [vercel.com](https://vercel.com)
   - Importar projeto do GitHub
   - Configurar build: `npm run build`
   - Deploy automático

### **Opção 3: Via Vercel Dashboard**

1. **Acessar Vercel:**
   - Ir para [vercel.com](https://vercel.com)
   - Fazer login

2. **Importar projeto:**
   - Clicar em "New Project"
   - Upload da pasta `dist/`
   - Configurar domínio

## 🔧 **Configurações pós-deploy:**

### **1. Atualizar manifesto Farcaster:**
Após o deploy, atualizar o `farcaster.json` com o domínio real:

```json
{
  "accountAssociation": {
    "header": "eyJmaWQiOjExODM2MTAsInR5cGUiOiJhdXRoIiwia2V5IjoiMHg3NEZiNzMzODA0NzMwZDVkOEM2ZUEwNDRmYWUzZTVkNjY2MzY2ODI3In0",
    "payload": "eyJkb21haW4iOiJzZXUtdmVyY2VsLWRvbWFpbi5jb20ifQ",
    "signature": "AUq6PYthASuxKWebMjE1dHsCRHwKheYXInO2XYVIUnRVE617LhJQIutxWzwbeFCHiZ35Bg7kF696atzlAfkE9xs="
  }
}
```

### **2. Testar com Farcaster:**
- URL: [https://farcaster.xyz/~/developers/mini-apps/preview](https://farcaster.xyz/~/developers/mini-apps/preview)
- Cole a URL do Vercel
- Testar autenticação

## 🔄 **Workflow de iteração:**

### **1. Deploy inicial:**
```bash
vercel
```

### **2. Testar no Farcaster:**
- Usar preview tool
- Identificar problemas
- Fazer correções

### **3. Deploy de correções:**
```bash
vercel --prod
```

### **4. Repetir até funcionar:**
- Deploy → Teste → Correção → Deploy
- Ciclo rápido de iteração

## 📊 **Vantagens do Vercel:**

### **1. Deploy rápido:**
- Build automático
- Deploy em segundos
- Rollback fácil

### **2. HTTPS automático:**
- Certificado SSL
- Domínio personalizado
- CDN global

### **3. Integração Farcaster:**
- HTTPS obrigatório
- Manifesto acessível
- Headers corretos

## ⚠️ **Problemas comuns:**

### **1. Build falha:**
- Verificar TypeScript errors
- Corrigir imports
- Testar localmente

### **2. Manifesto não acessível:**
- Verificar `vercel.json`
- Testar URL `/.well-known/farcaster.json`
- Verificar headers

### **3. Farcaster não carrega:**
- Verificar HTTPS
- Testar manifesto
- Verificar CORS

---

**💡 Dica**: Use o Vercel CLI para deploy rápido e iteração constante. Cada mudança pode ser testada em segundos!
