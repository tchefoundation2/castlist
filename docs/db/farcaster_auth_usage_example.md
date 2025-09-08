# Farcaster Authentication Integration - Usage Guide

## 🔐 Como Funciona

Este sistema **bypassa completamente** o Supabase Auth e usa apenas o FID do Farcaster como identificador único. É mais simples e eficiente para apps Farcaster.

## 📋 Ordem de Execução dos Scripts

Execute no **SQL Editor** do Supabase nesta ordem:

1. `01_profiles_table_fid.sql`
2. `02_guides_table_fid_integration_fixed.sql`
3. `03_farcaster_auth_functions_fixed.sql`
4. `04_seed_data_fixed.sql`
5. `05_farcaster_auth_integration.sql` ⭐ **NOVO**

## 🚀 Como Usar no Frontend

### 1. Atualizar `supabaseService.ts`

```typescript
// src/services/supabaseService.ts

import supabase from './supabaseService';

// Função de login com Farcaster
export const loginWithFarcaster = async (farcasterUser: {
  fid: number;
  username: string;
  pfp_url: string;
  signature?: string;
  message?: string;
  nonce?: string;
}) => {
  try {
    const { data, error } = await supabase.rpc('authenticate_with_farcaster', {
      p_fid: farcasterUser.fid,
      p_username: farcasterUser.username,
      p_pfp_url: farcasterUser.pfp_url,
      p_signature: farcasterUser.signature || null,
      p_message: farcasterUser.message || null,
      p_nonce: farcasterUser.nonce || null
    });

    if (error) throw error;

    // Armazenar session token no localStorage
    if (data && data.length > 0) {
      const { user_profile, session_token } = data[0];
      localStorage.setItem('farcaster_session', session_token);
      return { user: user_profile, session_token };
    }

    throw new Error('Authentication failed');
  } catch (error) {
    console.error('Farcaster login error:', error);
    throw error;
  }
};

// Função para validar sessão
export const validateSession = async () => {
  try {
    const sessionToken = localStorage.getItem('farcaster_session');
    if (!sessionToken) return null;

    const { data, error } = await supabase.rpc('validate_farcaster_session', {
      session_token: sessionToken
    });

    if (error) throw error;

    if (data && data.length > 0 && data[0].is_valid) {
      return data[0].user_profile;
    }

    // Sessão inválida, limpar localStorage
    localStorage.removeItem('farcaster_session');
    return null;
  } catch (error) {
    console.error('Session validation error:', error);
    localStorage.removeItem('farcaster_session');
    return null;
  }
};

// Função de logout
export const logoutFarcaster = async () => {
  try {
    await supabase.rpc('logout_farcaster');
    localStorage.removeItem('farcaster_session');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Função para definir contexto do usuário (chamar antes de cada operação)
export const setUserContext = async (fid: number) => {
  await supabase.rpc('set_current_user_fid', { user_fid: fid });
};
```

### 2. Atualizar `useAuth.tsx`

```typescript
// src/hooks/useAuth.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { loginWithFarcaster, validateSession, logoutFarcaster, setUserContext } from '../services/supabaseService';

// ... existing code ...

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing Farcaster session when the app loads
  useEffect(() => {
    const checkFarcasterSession = async () => {
      setIsLoading(true);
      try {
        if (window.farcaster) {
          // Try to validate existing session first
          const existingUser = await validateSession();
          if (existingUser) {
            setUser(existingUser);
            await setUserContext(existingUser.fid!);
          } else {
            // No valid session, check if user is logged in via Farcaster SDK
            const farcasterUser = await window.farcaster.get_user_data();
            if (farcasterUser) {
              const { user: profile } = await loginWithFarcaster(farcasterUser);
              setUser(profile);
              await setUserContext(profile.fid!);
            }
          }
        } else {
          // In dev mode, don't auto-login
          console.warn("Farcaster SDK not found. Displaying developer login options.");
        }
      } catch (e) {
        console.error("Error checking Farcaster session:", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkFarcasterSession();
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      if (!window.farcaster) {
        throw new Error("Farcaster SDK is not available. Please open this app in a Farcaster client like Warpcast.");
      }
      
      const result = await window.farcaster.sign_in();
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      const { user: profile } = await loginWithFarcaster(result);
      await setUserContext(profile.fid!);
      setUser(profile);
      setIsLoading(false);
      return {};
    } catch (error) {
      console.error("Farcaster login failed:", error);
      setIsLoading(false);
      return { error };
    }
  };

  const logout = async () => {
    await logoutFarcaster();
    setUser(null);
  };

  // ... rest of the code ...
};
```

### 3. Atualizar operações que precisam de contexto

```typescript
// src/services/supabaseService.ts

// Exemplo: Criar um guia
export const createGuide = async (guideData: {
  title: string;
  description: string;
  tags: string[];
  cover_image?: string;
}) => {
  // Definir contexto do usuário antes da operação
  const user = await getCurrentUser();
  if (!user?.fid) throw new Error('User not authenticated');
  
  await setUserContext(user.fid);
  
  const { data, error } = await supabase
    .from('guides')
    .insert({
      ...guideData,
      creator_fid: user.fid,
      is_public: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Exemplo: Dar like em um guia
export const toggleGuideLike = async (guideId: number) => {
  const user = await getCurrentUser();
  if (!user?.fid) throw new Error('User not authenticated');
  
  await setUserContext(user.fid);
  
  const { data, error } = await supabase.rpc('toggle_guide_like', {
    guide_id: guideId
  });

  if (error) throw error;
  return data[0];
};

// Helper para pegar usuário atual
export const getCurrentUser = async (): Promise<User | null> => {
  return await validateSession();
};
```

## 🔧 Configuração do Supabase

### 1. Desabilitar RLS para algumas operações (opcional)

Se quiser permitir leitura pública sem autenticação:

```sql
-- Permitir leitura pública de guias
DROP POLICY IF EXISTS "guides_select_policy" ON public.guides;
CREATE POLICY "guides_select_policy" ON public.guides
    FOR SELECT
    USING (is_public = true);
```

### 2. Configurar CORS (se necessário)

No Supabase Dashboard > Settings > API:
- Adicione seu domínio nas configurações de CORS
- Para desenvolvimento local: `http://localhost:5173`

## 🎯 Vantagens desta Abordagem

1. **✅ Simples**: Não depende do sistema de auth do Supabase
2. **✅ Farcaster-Native**: Usa FID como identificador principal
3. **✅ Seguro**: RLS policies protegem os dados
4. **✅ Flexível**: Fácil de customizar e estender
5. **✅ Performance**: Menos overhead que auth tradicional

## 🚨 Considerações

1. **Sessões**: Atualmente usa PostgreSQL settings (simples, mas não ideal para produção)
2. **Escalabilidade**: Para produção, considere usar uma tabela de sessões
3. **Segurança**: Adicione verificação de assinatura Farcaster se necessário

## 🧪 Testando

Após executar todos os scripts, teste:

```sql
-- Testar autenticação
SELECT * FROM public.authenticate_with_farcaster(1, 'test_user', 'https://example.com/pfp.jpg');

-- Testar validação de sessão
SELECT * FROM public.validate_farcaster_session('your_session_token_here');

-- Testar feed público
SELECT * FROM public.get_public_guides_feed(5, 0);
```

---

**🎉 Pronto!** Agora você tem um sistema completo de autenticação Farcaster integrado com Supabase!
