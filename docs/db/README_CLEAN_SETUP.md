# Castlist Database: Clean Setup

## 🎯 **Setup Completo e Limpo**

Este é um setup completo e limpo do banco de dados Castlist com integração Farcaster FID.

## 📋 **Pré-requisitos**

1. **Reset do Supabase Database:**
   - Vá no Supabase Dashboard → Settings → Database
   - Clique em "Reset Database" ou "Drop All Tables"
   - Confirme a ação

2. **Desabilitar Autenticação Supabase (opcional):**
   - Vá em Authentication → Settings
   - Desabilite "Enable email confirmations"
   - Ou mantenha habilitado se quiser usar ambos os sistemas

## 🚀 **Ordem de Execução**

Execute os scripts **nesta ordem exata** no Supabase SQL Editor:

### **1. Schema Completo**
```sql
-- docs/db/complete_schema_clean.sql
```
- ✅ Cria todas as tabelas do zero
- ✅ Configura RLS policies
- ✅ Cria índices de performance
- ✅ Configura triggers

### **2. Funções de Autenticação**
```sql
-- docs/db/complete_auth_functions_clean.sql
```
- ✅ Funções de autenticação Farcaster
- ✅ Funções de feed e interações
- ✅ Funções de like e atividades

### **3. Dados de Exemplo**
```sql
-- docs/db/complete_seed_data_clean.sql
```
- ✅ Perfis de usuários com FID
- ✅ Livros de exemplo
- ✅ Guias de exemplo
- ✅ Relacionamentos e interações

## 🔧 **Estrutura do Banco**

### **Tabelas Principais:**
- `profiles` - Usuários com FID
- `books` - Livros
- `guides` - Guias de leitura
- `guide_books` - Relacionamento guia-livro
- `activities` - Atividades sociais
- `guide_likes` - Likes nos guias

### **Sistema de Autenticação:**
- **FID (Farcaster ID)** - Identificador principal
- **UUID** - Compatibilidade com Supabase Auth
- **Dual Auth** - Suporte a ambos os sistemas

## 🧪 **Testando a Integração**

### **1. Verificar Dados:**
```sql
-- Verificar perfis
SELECT fid, username, created_at FROM public.profiles ORDER BY created_at;

-- Verificar guias
SELECT g.title, g.creator_fid, p.username, COUNT(gb.book_id) as book_count
FROM public.guides g
JOIN public.profiles p ON g.creator_fid = p.fid
LEFT JOIN public.guide_books gb ON g.id = gb.guide_id
GROUP BY g.id, g.title, g.creator_fid, p.username
ORDER BY g.created_at DESC;
```

### **2. Testar Funções:**
```sql
-- Feed público
SELECT * FROM public.get_public_guides_feed(5, 0);

-- Detalhes de um guia
SELECT * FROM public.get_guide_details(1);

-- Atividades
SELECT * FROM public.get_activities_feed(10, 0);
```

## 🔐 **Configuração do Frontend**

### **Variáveis de Ambiente:**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### **Exemplo de Uso:**
```typescript
// Autenticar usuário Farcaster
const { data, error } = await supabase.rpc('authenticate_farcaster_user', {
  user_fid: 123,
  username: 'username',
  pfp_url: 'https://example.com/pfp.jpg'
});

// Buscar feed
const { data: feed } = await supabase.rpc('get_public_guides_feed', {
  limit_count: 10,
  offset_count: 0
});
```

## ✅ **Vantagens do Setup Limpo**

1. **Sem Conflitos** - Tudo criado do zero
2. **Estrutura Consistente** - Sem colunas desnecessárias
3. **Performance Otimizada** - Índices corretos
4. **Segurança Adequada** - RLS policies corretas
5. **Fácil Manutenção** - Código limpo e organizado

## 🚨 **Troubleshooting**

### **Erro de Permissão:**
- Verifique se as funções têm `SECURITY DEFINER`
- Confirme que as permissões foram concedidas

### **Erro de RLS:**
- Verifique se as políticas estão corretas
- Confirme que as variáveis de sessão estão sendo definidas

### **Erro de Foreign Key:**
- Verifique se os dados de exemplo estão sendo inseridos na ordem correta
- Confirme que os FIDs existem na tabela profiles

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique a ordem de execução dos scripts
2. Confirme que o banco foi resetado
3. Verifique os logs do Supabase
4. Teste as funções individualmente

---

**🎉 Setup completo! Seu banco está pronto para o Castlist!**
