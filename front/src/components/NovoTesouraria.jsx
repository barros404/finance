import React, { useState } from 'react';
import { X, Calendar, DollarSign, FileText, Save, ArrowLeft, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';

const NovoTesouraria = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    mes: '',
    saldoInicial: '',
    recebimentos: '',
    pagamentos: '',
    observacoes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode adicionar validações antes de salvar
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl transform transition-all duration-300">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90"></div>
          <div className="relative flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onClose}
                className="p-3 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold">Novo Plano de Tesouraria</h2>
                <p className="text-indigo-100 text-sm mt-1">Crie um novo plano mensal de fluxo de caixa</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Mês/Ano <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-indigo-500" />
                </div>
                <input
                  type="month"
                  name="mes"
                  value={formData.mes}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-all duration-300 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Saldo Inicial (Kz) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-indigo-500" />
                </div>
                <input
                  type="number"
                  name="saldoInicial"
                  value={formData.saldoInicial}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-all duration-300 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Total de Recebimentos Previstos (Kz)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <input
                  type="number"
                  name="recebimentos"
                  value={formData.recebimentos}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Total de Pagamentos Previstos (Kz)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <input
                  type="number"
                  name="pagamentos"
                  value={formData.pagamentos}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-50 focus:bg-white transition-all duration-300 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Observações
            </label>
            <div className="relative">
              <div className="absolute top-4 left-4">
                <FileText className="h-5 w-5 text-indigo-500" />
              </div>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows="4"
                className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-all duration-300 shadow-sm resize-none"
                placeholder="Adicione observações sobre este plano de tesouraria..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 font-semibold shadow-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center px-8 py-3 border border-transparent rounded-2xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <Save className="w-5 h-5 mr-2" />
              Salvar Plano
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovoTesouraria;
