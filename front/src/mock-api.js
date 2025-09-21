// Mock API para desenvolvimento quando o backend não está disponível
export const mockApi = {
  // Mock data
  users: [
    {
      id: 1,
      name: 'Administrador',
      nome: 'Administrador',
      email: 'admin@admin.com',
      role: 'admin',
      cargo: 'Administrador'
    }
  ],

  // Simular login
  async login(credentials) {
    console.log('🎭 Usando Mock API para login');
    
    // Simular delay da rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verificar credenciais mock
    if (credentials.email === 'admin@admin.com' && credentials.password === '123456') {
      const user = this.users[0];
      const token = 'mock-jwt-token-' + Date.now();
      
      const response = {
        status: 'success',
        message: 'Login realizado com sucesso',
        data: {
          user: user,
          accessToken: token,
          token: token // fallback
        }
      };
      
      console.log('✅ Mock login bem-sucedido:', response);
      return response;
    } else {
      throw new Error('Credenciais inválidas');
    }
  },

  // Simular getCurrentUser
  async getCurrentUser(token) {
    console.log('🎭 Usando Mock API para getCurrentUser');
    
    // Simular delay da rede
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (token && token.startsWith('mock-jwt-token-')) {
      const response = {
        status: 'success',
        data: this.users[0]
      };
      
      console.log('✅ Mock getCurrentUser bem-sucedido:', response);
      return response;
    } else {
      throw new Error('Token inválido');
    }
  },

  // Simular logout
  async logout() {
    console.log('🎭 Usando Mock API para logout');
    await new Promise(resolve => setTimeout(resolve, 200));
    return { status: 'success', message: 'Logout realizado com sucesso' };
  }
};

// Verificar se deve usar mock API
export const shouldUseMockApi = () => {
  // Usar mock se estiver em desenvolvimento e o backend não estiver disponível
  return import.meta.env.DEV || localStorage.getItem('useMockApi') === 'true';
};

