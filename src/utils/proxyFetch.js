/**
 * Utilitário para fazer requisições através do proxy para evitar problemas de CORS
 * 
 * Este utilitário pode ser usado para substituir chamadas fetch diretas para domínios
 * que estão causando problemas de CORS, como privy.farcaster.xyz
 */

/**
 * Função que substitui o fetch padrão para usar o proxy
 * @param {string} url - URL original para a qual fazer a requisição
 * @param {Object} options - Opções do fetch
 * @returns {Promise<Response>} - Resposta da requisição
 */
export async function proxyFetch(url, options = {}) {
  // Verificar se a URL é para privy.farcaster.xyz ou outros domínios com problemas de CORS
  if (url.includes('privy.farcaster.xyz')) {
    // Construir a URL do proxy
    const baseUrl = window.location.origin;
    const proxyUrl = `${baseUrl}/api/proxy?url=${encodeURIComponent(url)}`;
    
    // Fazer a requisição através do proxy
    return fetch(proxyUrl, options);
  }
  
  // Para outras URLs, usar o fetch padrão
  return fetch(url, options);
}

/**
 * Função para interceptar e substituir o fetch global
 * Deve ser chamada no início da aplicação
 */
export function setupProxyInterceptor() {
  // Guardar a referência original do fetch
  const originalFetch = window.fetch;
  
  // Substituir o fetch global
  window.fetch = function(url, options) {
    // Verificar se a URL é para privy.farcaster.xyz
    if (typeof url === 'string' && url.includes('privy.farcaster.xyz')) {
      // Construir a URL do proxy
      const baseUrl = window.location.origin;
      const proxyUrl = `${baseUrl}/api/proxy?url=${encodeURIComponent(url)}`;
      
      // Fazer a requisição através do proxy
      return originalFetch(proxyUrl, options);
    }
    
    // Para outras URLs, usar o fetch original
    return originalFetch(url, options);
  };
}