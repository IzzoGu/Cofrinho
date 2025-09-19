// Configuração da API - DETECÇÃO AUTOMÁTICA DE REDE
const getApiUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // Se estiver em produção (Netlify, Vercel, etc.), usar variável de ambiente
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Se estiver em localhost, priorizar localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'https://localhost:9443';
  }
  
  // Se estiver na rede local, usar o mesmo hostname
  if (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
    return `https://${hostname}:9443`;
  }
  
  // Para acesso externo, usar o mesmo hostname da aplicação
  // Isso funciona se o backend estiver no mesmo domínio/IP
  return `${protocol}//${hostname}${port ? ':' + port : ''}`;
};

const API_BASE_URL = getApiUrl();

console.log('API_BASE_URL configurada como:', API_BASE_URL);
console.log('Hostname atual:', window.location.hostname);
console.log('URL completa:', window.location.href);

export default API_BASE_URL;
