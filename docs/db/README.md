# Castlist Database Setup

Este diretório contém todos os scripts SQL necessários para configurar o banco de dados Supabase do Castlist com suporte completo ao FID do Farcaster.

## 📋 Ordem de Execução

Execute os scripts na seguinte ordem no **SQL Editor** do Supabase:

### 1. `01_profiles_table_fid.sql`
- ✅ Cria a tabela `profiles` com FID como identificador único
- ✅ Configura índices otimizados para consultas por FID
- ✅ Implementa RLS (Row Level Security) básico
- ✅ Adiciona constraints e validações

### 2. `02_guides_table_fid_integration.sql`
- ✅ Cria tabelas `guides`, `books`, `guide_books`
- ✅ Configura tabelas de atividades sociais (`activities`, `guide_likes`)
- ✅ Integra tudo com o sistema baseado em FID
- ✅ Implementa RLS para todas as tabelas

### 3. `03_farcaster_auth_functions.sql`
- ✅ Funções auxiliares para autenticação Farcaster
- ✅ Funções para gerenciar sessão do usuário
- ✅ APIs otimizadas para consultas com estatísticas
- ✅ Funções para features sociais (likes, atividades)

### 4. `04_seed_data.sql`
- ✅ Dados de exemplo para desenvolvimento
- ✅ Usuários mockados que correspondem ao frontend
- ✅ Guias e livros de exemplo
- ✅ Atividades sociais simuladas

## 🔑 Conceitos Principais

### FID como Chave Primária
- **FID (Farcaster ID)** é usado como identificador único de usuários
- Não depende do sistema de auth tradicional do Supabase
- Permite login direto via SDK do Farcaster

### Row Level Security (RLS)
- **Políticas baseadas em FID**: Usuários só podem modificar seus próprios dados
- **Configuração de sessão**: `app.current_user_fid` define o contexto do usuário
- **Segurança granular**: Diferentes permissões para leitura/escrita

### Funções Auxiliares
- **`authenticate_farcaster_user()`**: Cria/atualiza perfil do usuário
- **`set_current_user_fid()`**: Define contexto da sessão
- **`get_public_guides_feed()`**: Feed público com estatísticas
- **`toggle_guide_like()`**: Sistema de likes otimizado

## 🚀 Como Usar

### 1. No Supabase Dashboard
1. Acesse o **SQL Editor**
2. Execute cada script na ordem indicada
3. Verifique se não há erros

### 2. No Código da Aplicação
```typescript
// Após autenticação Farcaster
const { data, error } = await supabase.rpc('authenticate_farcaster_user', {
  p_fid: farcasterUser.fid,
  p_username: farcasterUser.username,
  p_pfp_url: farcasterUser.pfp_url
});

// Definir contexto do usuário para RLS
await supabase.rpc('set_current_user_fid', { user_fid: farcasterUser.fid });
```

### 3. Consultas Otimizadas
```typescript
// Feed público com estatísticas
const { data: guides } = await supabase.rpc('get_public_guides_feed', {
  limit_count: 20,
  offset_count: 0
});

// Guias do usuário com stats
const { data: userGuides } = await supabase.rpc('get_user_guides_with_stats', {
  user_fid: currentUser.fid
});
```

## 🔧 Customizações Necessárias

### No seu código TypeScript:
1. **Atualizar `supabaseService.ts`** para usar as novas funções RPC
2. **Implementar `set_current_user_fid`** após login
3. **Usar funções otimizadas** em vez de queries manuais

### Melhorias futuras:
- **Verificação de assinatura Farcaster** nas RLS policies
- **Cache de consultas** frequentes
- **Índices adicionais** conforme o app cresce
- **Backup e migração** de dados

## 📊 Verificação

Após executar todos os scripts, rode estas consultas para verificar:

```sql
-- Verificar perfis
SELECT fid, username, created_at FROM public.profiles ORDER BY fid;

-- Verificar guias com estatísticas
SELECT * FROM public.get_public_guides_feed(10, 0);

-- Verificar funções
SELECT proname FROM pg_proc WHERE proname LIKE '%farcaster%' OR proname LIKE '%guide%';
```

## 🐛 Troubleshooting

### Erro: "function does not exist"
- ✅ Verifique se executou os scripts na ordem correta
- ✅ Confirme que não há erros de sintaxe

### Erro: "permission denied"
- ✅ Execute `GRANT` statements nos scripts
- ✅ Verifique RLS policies

### Erro: "relation does not exist"
- ✅ Execute primeiro os scripts de criação de tabelas
- ✅ Verifique se as tabelas foram criadas corretamente

---

**📝 Nota**: Estes scripts foram projetados para funcionar perfeitamente com o código frontend existente do Castlist. Após executá-los, seu app terá um banco de dados robusto e otimizado para o ecossistema Farcaster!
