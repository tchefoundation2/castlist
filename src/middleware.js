// Middleware para resolver problemas de CORS com privy.farcaster.xyz

export function middleware(request) {
  // Verificar se a requisição é para o endpoint privy.farcaster.xyz
  const url = new URL(request.url);
  
  // Criar uma resposta com os headers CORS adequados
  const response = new Response(null, {
    status: 200,
    headers: {
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors 'self' https://farcaster.xyz https://*.farcaster.xyz https://warpcast.com https://*.warpcast.com https://client.warpcast.com https://wallet.farcaster.xyz;",
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
  
  return response;
}

// Configurar as rotas que serão processadas pelo middleware
export const config = {
  matcher: [
    // Aplicar a todas as rotas
    '/(.*)',
    // Especificamente para requisições relacionadas ao privy.farcaster.xyz
    '/api/:path*',
  ],
};