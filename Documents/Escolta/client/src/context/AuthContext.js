import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

// Função para tentar diferentes URLs automaticamente
const tryApiRequest = async (requestFn) => {
  const fallbackUrls = [
    'https://192.168.0.35:9443',
    'http://192.168.0.35:8080',
    'http://192.168.0.35:5000',
    'http://192.168.0.35:3001',
    'http://192.168.0.35:4000',
    'https://localhost:9443',
    'http://localhost:8080',
    'http://localhost:5000'
  ];

  for (const url of fallbackUrls) {
    try {
      console.log(`Tentando conectar com: ${url}`);
      const result = await requestFn(url);
      console.log(`✅ Conexão bem-sucedida com: ${url}`);
      return result;
    } catch (error) {
      console.log(`❌ Falha ao conectar com: ${url}`, error.message);
      continue;
    }
  }
  
  throw new Error('Não foi possível conectar com nenhum servidor');
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await tryApiRequest(async (url) => {
        return await axios.get(`${url}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      });
      
      if (response.data.valid) {
        setUser(response.data.user);
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await tryApiRequest(async (url) => {
        return await axios.post(`${url}/api/auth/login`, {
          username,
          password
        });
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao fazer login - Verifique sua conexão'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
