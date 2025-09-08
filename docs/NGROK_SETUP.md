# 🌐 Configuração do ngrok para Farcaster

## Por que precisamos do ngrok?

O Farcaster requer **HTTPS** para autenticação real. O ngrok cria um túnel HTTPS público para seu servidor local.

## 🚀 Como usar:

### **Opção 1: Script automático (Recomendado)**
```bash
npm run dev:ngrok
```

### **Opção 2: Manual**
```bash
# Terminal 1: Iniciar Vite
npm run dev

# Terminal 2: Iniciar ngrok
npm run ngrok
```

### **Opção 3: Scripts individuais**
```bash
# Windows
scripts/start-with-ngrok.bat

# PowerShell
scripts/start-with-ngrok.ps1
```

## 📱 Como testar:

1. **Execute o comando**:
   ```bash
   npm run dev:ngrok
   ```

2. **Aguarde** os dois servidores iniciarem

3. **Copie a URL HTTPS** do ngrok (ex: `https://abc123.ngrok.io`)

4. **Acesse** a URL HTTPS no navegador

5. **Teste a autenticação** Farcaster real

## 🔧 Configuração do Vite

O `vite.config.ts` foi configurado para aceitar conexões externas:

```typescript
server: {
  host: true, // Allow external connections
  port: 5173,
  hmr: {
    overlay: false
  }
}
```

## 🌐 URLs disponíveis:

| **Serviço** | **URL** | **Uso** |
|-------------|---------|---------|
| **Vite Local** | `http://localhost:5173` | Desenvolvimento local |
| **ngrok HTTPS** | `https://abc123.ngrok.io` | Autenticação Farcaster |

## ⚠️ Importante:

### **URLs do ngrok mudam**
- A cada reinicialização, o ngrok gera uma nova URL
- Para produção, use Vercel ou Netlify

### **Limitações do ngrok gratuito**
- 1 túnel simultâneo
- URLs aleatórias
- Rate limits

### **Para produção**
```bash
# Deploy no Vercel
npm run build
vercel --prod

# Deploy no Netlify
npm run build
# Upload da pasta dist/
```

## 🐛 Troubleshooting:

### **Erro: "ngrok not found"**
```bash
npm install -g ngrok
```

### **Erro: "Port already in use"**
```bash
# Pare o servidor Vite (Ctrl+C)
# Reinicie
npm run dev:ngrok
```

### **Erro: "Connection refused"**
- Verifique se o Vite está rodando na porta 5173
- Aguarde alguns segundos para o servidor inicializar

## 📋 Checklist:

- [ ] ngrok instalado (`ngrok version`)
- [ ] Vite configurado (`host: true`)
- [ ] Scripts criados (`npm run dev:ngrok`)
- [ ] URL HTTPS copiada do ngrok
- [ ] Teste de autenticação Farcaster funcionando

## 🎯 Próximos passos:

1. **Teste local** com ngrok
2. **Deploy em produção** (Vercel/Netlify)
3. **Configure domínio** personalizado
4. **Implemente** autenticação real

---

**💡 Dica**: Use o ngrok para desenvolvimento e testes. Para produção, faça deploy em uma plataforma como Vercel ou Netlify.
