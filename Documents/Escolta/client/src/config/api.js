const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://192.168.0.35:5000' 
  : 'http://localhost:5000';

export default API_BASE_URL;
