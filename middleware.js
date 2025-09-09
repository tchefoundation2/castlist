export function middleware(request) {
  const response = new Response(null, {
    status: 200,
    headers: {
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors https://farcaster.xyz https://*.farcaster.xyz https://preview.farcaster.xyz https://wallet.farcaster.xyz; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://esm.sh https://unpkg.com https://cdn.jsdelivr.net https://client.farcaster.xyz; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https: wss: data:; frame-src 'self' https://farcaster.xyz https://preview.farcaster.xyz https://wallet.farcaster.xyz; object-src 'none'; base-uri 'self'; form-action 'self';",
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      'Access-Control-Allow-Credentials': 'true'
    }
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
