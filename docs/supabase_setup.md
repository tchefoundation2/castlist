# Configuração do Supabase para Farcaster

## 1. Configurações no Supabase Dashboard

### Authentication Settings
1. Acesse **Authentication > Settings** no Supabase Dashboard
2. Configure as seguintes URLs:
   - **Site URL**: `https://castlist.netlify.app`
   - **Redirect URLs**: 
     - `https://castlist.netlify.app/**`
     - `https://farcaster.xyz/**`
     - `https://client.farcaster.xyz/**`

### CORS Settings
1. Acesse **Settings > API** no Supabase Dashboard
2. Configure as seguintes origens permitidas:
   - `https://castlist.netlify.app`
   - `https://farcaster.xyz`
   - `https://client.farcaster.xyz`
   - `https://warpcast.com`

### RLS (Row Level Security)
1. Acesse **Authentication > Policies** no Supabase Dashboard
2. Certifique-se de que as políticas RLS estão configuradas corretamente
3. Execute os scripts SQL fornecidos

## 2. Scripts SQL para Executar

### Script 1: Configuração de Autenticação
```sql
-- Execute: docs/db/setup_farcaster_auth.sql
```

### Script 2: Configuração de CORS
```sql
-- Execute: docs/db/configure_supabase_cors.sql
```

### Script 3: Correção de Políticas RLS
```sql
-- Execute: docs/db/fix_rls_policies.sql
```

## 3. Verificações

### Teste 1: CORS
```sql
SELECT public.test_cors_config();
```

### Teste 2: Autenticação
```sql
SELECT public.test_farcaster_auth();
```

### Teste 3: Acesso Público
```sql
SELECT public.test_public_access();
```

## 4. Configurações de Ambiente

### Variáveis de Ambiente no Netlify
- `SUPABASE_URL`: URL do seu projeto Supabase
- `SUPABASE_ANON_KEY`: Chave anônima do Supabase

### Verificação no Código
O arquivo `src/services/supabaseService.ts` já está configurado para usar essas variáveis.

## 5. Troubleshooting

### Problema: "Connection refused"
- Verifique se as URLs estão configuradas corretamente no Supabase
- Execute os scripts SQL de configuração
- Verifique se as políticas RLS estão ativas

### Problema: "CORS error"
- Verifique se as origens estão configuradas no Supabase Dashboard
- Execute o script de configuração de CORS
- Verifique se o arquivo `_headers` está correto

### Problema: "Authentication failed"
- Verifique se as funções de autenticação estão criadas
- Execute o script de configuração de autenticação
- Verifique se as políticas RLS permitem acesso anônimo

## 6. URLs Importantes

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Projeto Castlist**: https://rygpuqnqaagihwoapdix.supabase.co
- **App Deployado**: https://castlist.netlify.app
- **Manifesto**: https://castlist.netlify.app/.well-known/farcaster.json
