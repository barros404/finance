import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se há dados salvos no localStorage ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        console.log('🔍 Inicializando autenticação...');

        if (token && userData) {
          console.log('✅ Token e dados encontrados no localStorage');
          try {
            const parsedUser = JSON.parse(userData);
            console.log('✅ Dados do usuário carregados:', parsedUser);
            
            // Primeiro, definir o usuário como autenticado para evitar flash de login
            setUser(parsedUser);
            setIsAuthenticated(true);
            
            // Verificar se o token ainda é válido fazendo uma requisição para /auth/me
            try {
              console.log('🔍 Verificando validade do token...');
              const response = await authApi.getMe();
              
              if (response.status === 'success' && response.data?.user) {
                console.log('✅ Token válido, atualizando dados do usuário:', response.data.user);
                setUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
              } else {
                throw new Error('Resposta inválida da API');
              }
            } catch (tokenError) {
              console.log('❌ Token inválido ou expirado:', tokenError.message);
              // Se o token for inválido, limpar dados e forçar novo login
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (parseError) {
            console.log('❌ Erro ao fazer parse dos dados do usuário:', parseError);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('❌ Nenhum token ou dados encontrados');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('🔐 Iniciando processo de login...');
      
      const response = await authApi.login(credentials);
      
      // Baseado na estrutura do auth.controller.js
      if (response.status === 'success' && response.data) {
        console.log('✅ Login bem-sucedido:', response.data);
        
        const userData = response.data.user;
        const token = response.data.token;
        
        if (userData && token) {
          // Garantir que os dados sejam salvos no localStorage
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Atualizar o estado
          setUser(userData);
          setIsAuthenticated(true);
          
          console.log('✅ Usuário autenticado com sucesso e dados salvos');
        } else {
          throw new Error('Dados de usuário ou token ausentes na resposta');
        }
        
        return response;
      } else {
        const errorMessage = response.message || 'Erro ao fazer login';
        console.log('❌ Login falhou:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      // Limpar dados em caso de erro
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      await authApi.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      console.log('✅ Logout realizado com sucesso');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const getCurrentUser = async () => {
    try {
      const response = await authApi.getMe();
      if (response.status === 'success' && response.data?.user) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    getCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};