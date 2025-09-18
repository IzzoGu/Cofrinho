const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://escolta-backend.herokuapp.com' 
  : '';

export default API_BASE_URL;
