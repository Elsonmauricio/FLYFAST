// Configuração centralizada de API
let API_URL = 'http://localhost:5000';

if (process.env.NODE_ENV === 'production') {
  API_URL = ''; // Em produção, usa caminhos relativos (o vercel.json trata do proxy)
}

export default API_URL;
