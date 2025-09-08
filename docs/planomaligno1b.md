#  Castlist - Plano de Desenvolvimento Maligno 1b 🚀

Este documento descreve o plano de ação para finalizar o desenvolvimento do mini-app Castlist, configurar o ambiente local e prepará-lo para o deploy no Farcaster.

**Status Atual**: ✅ Ambiente de desenvolvimento configurado com animações modernas implementadas!

## 🔗 **1. Conexão com Supabase**

A conexão com o Supabase já está configurada no código, utilizando as seguintes credenciais:

-   **URL**: `https://dkgkmywbgnircfgyroye.supabase.co`
-   **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 📊 **2. Análise do Backend (Supabase)**

### ✅ O que já está implementado (no código):

-   **Cliente Supabase**: Inicializado e pronto para uso.
-   **Autenticação**: Lógica de `getOrCreateUserProfile` para login com Farcaster.
-   **Operações CRUD**: Funções para criar, ler, atualizar e deletar guias e livros (atualmente usando dados mockados).
-   **Tabela `profiles`**: O código já interage com esta tabela.

### 🤔 O que precisa ser verificado/criado no Supabase:

1.  **Schema das Tabelas**:
    *   `guides`: Verificar se a tabela existe e se sua estrutura corresponde à interface `Guide` em `types.ts`.
    *   `books`: Verificar se a tabela existe para armazenar os livros.
    *   `guide_books`: Tabela de junção para a relação many-to-many entre guias e livros.
2.  **Segurança**:
    *   **RLS (Row Level Security)**: Verificar se está ativado para as tabelas.
    *   **Policies**: Garantir que as políticas de segurança estão implementadas para permitir as operações CRUD apenas para usuários autorizados (ex: um usuário só pode editar seus próprios guias).

## 🚀 **3. Plano de Ação**

### Fase 1: Configuração do Ambiente de Desenvolvimento Local

-   **[x] Setup do Vite**:
    -   Instalar e configurar o Vite como servidor de desenvolvimento.
    -   Criar `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, etc.
-   **[x] Reestruturação de Arquivos**:
    -   Criar um diretório `src/`.
    -   Mover todos os arquivos de código-fonte (`components`, `hooks`, `pages`, `services`, `types.ts`, `App.tsx`, etc.) para dentro de `src/`.
    -   Atualizar `index.html` e o ponto de entrada da aplicação para funcionar com o Vite.
-   **[x] Validar o App Localmente**:
    -   Rodar o servidor de desenvolvimento e garantir que a aplicação funcione com os dados mockados.
    -   **[x] Corrigir Scroll Mobile**: Aplicar estilos CSS para esconder barras de scroll em carrosséis mobile.
    -   **[x] Implementar Framer Motion**: Adicionar animações modernas e micro-interações para melhorar UX.

### Fase 2: Integração com o Backend Real (Supabase)

-   **[ ] Validação do Schema**:
    -   Acessar o dashboard do Supabase e comparar o schema existente com as necessidades da aplicação.
    -   Criar ou alterar as tabelas (`guides`, `books`, etc.) conforme necessário.
-   **[ ] Migração dos Dados**:
    -   Substituir as chamadas de funções mockadas em `services/supabaseService.ts` por chamadas reais ao Supabase.
-   **[ ] Testes de Integração**:
    -   Testar todo o fluxo da aplicação:
        -   Login com Farcaster.
        -   Criação, visualização, edição e deleção de guias.
        -   Interações (like/dislike).

### Fase 3: Preparação para Deploy

-   **[ ] Build de Produção**:
    -   Configurar o script de build no `package.json` para gerar os arquivos estáticos otimizados.
-   **[ ] Variáveis de Ambiente**:
    -   Mover as chaves do Supabase para variáveis de ambiente (`.env`) em vez de deixá-las hardcoded.
-   **[ ] CI/CD**:
    -   Configurar o deploy contínuo em uma plataforma como Vercel ou Netlify, linkando com o repositório do Git.
