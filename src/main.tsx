import React from 'react';
import ReactDOM from 'react-dom/client';
import CastlistApp from './App';
import './index.css';
import { setupProxyInterceptor } from './utils/proxyFetch';

// Configurar o interceptor de proxy para resolver problemas de CORS
setupProxyInterceptor();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <CastlistApp />
  </React.StrictMode>
);