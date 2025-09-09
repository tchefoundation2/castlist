// API endpoint para proxy de requisições CORS
// Este arquivo será usado pelo Vercel para criar um endpoint serverless

import { handleProxyRequest, handleOptionsRequest } from '../src/api/proxy';

export default async function handler(req, res) {
  // Configurar headers CORS para todas as respostas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Lidar com requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  try {
    // Converter a requisição do Next.js para uma requisição fetch
    const request = new Request(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });
    
    // Usar a função de proxy para lidar com a requisição
    const response = await handleProxyRequest(request);
    
    // Converter a resposta fetch para uma resposta do Next.js
    res.status(response.status);
    
    // Adicionar headers da resposta
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }
    
    // Enviar o corpo da resposta
    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}