import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { authApi } from '../services/api';

const RecuperarSenha = ({ onVoltarLogin }) => {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMensagem('');

    try {
      // Validar email
      if (!email) {
        throw new Error('Por favor, digite seu e-mail');
      }

      // Solicitar recuperação de senha
      const response = await authApi.forgotPassword(email);

      if (response.success) {
        setMensagem('Instruções de recuperação enviadas para seu e-mail!');
        setIsSuccess(true);
        setTimeout(() => {
          onVoltarLogin();
        }, 3000);
      } else {
        throw new Error(response.message || 'Erro ao solicitar recuperação de senha');
      }
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      setError(error.message || 'Erro ao solicitar recuperação de senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white text-center relative">
          <button
            onClick={onVoltarLogin}
            className="absolute left-6 top-6 text-white hover:text-indigo-200 transition-colors duration-300 p-2 rounded-xl hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Recuperar Senha</h1>
          <p className="text-indigo-100 mt-2 font-medium">Digite seu e-mail para recuperar a senha</p>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-indigo-600 to-purple-700 rotate-45"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-gray-50 focus:bg-white shadow-sm"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {mensagem && (
            <div className={`rounded-xl p-4 ${isSuccess ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'}`}>
              <div className="flex items-center justify-center">
                {isSuccess ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <Mail className="w-5 h-5 text-blue-500 mr-2" />
                )}
                <p className={`text-sm font-medium text-center ${isSuccess ? 'text-green-700' : 'text-blue-700'}`}>
                  {mensagem}
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-800 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : isSuccess ? (
              'Enviado com Sucesso!'
            ) : (
              'Enviar Instruções'
            )}
          </button>
        </form>

        <div className="bg-gradient-to-r from-gray-50 to-indigo-50 p-6 text-center border-t">
          <button
            onClick={onVoltarLogin}
            className="text-indigo-600 hover:text-purple-600 text-sm font-semibold transition-colors duration-300 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para o login</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;