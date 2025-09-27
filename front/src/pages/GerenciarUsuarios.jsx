import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioApi } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Plus, Edit, Trash2, Search, User, Check, X, ChevronLeft, ChevronRight, Loader2 
} from 'lucide-react';

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(10);
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState({
    id: null,
    nome: '',
    email: '',
    role: 'usuario',
    ativo: true
  });
  const [modoEdicao, setModoEdicao] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState({});
  const navigate = useNavigate();

  // Carregar usuários
  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const resposta = await usuarioApi.listarUsuarios({
        pagina: paginaAtual,
        limite: itensPorPagina,
        busca: filtro
      });
      setUsuarios(resposta.data || []);
    } catch (erro) {
      console.error('Erro ao carregar usuários:', erro);
      toast.error('Erro ao carregar usuários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar usuários quando o componente montar ou a página/filtro mudar
  useEffect(() => {
    carregarUsuarios();
  }, [paginaAtual, filtro]);

  // Abrir modal para adicionar novo usuário
  const abrirModalNovoUsuario = () => {
    setUsuarioAtual({
      id: null,
      nome: '',
      email: '',
      role: 'usuario',
      ativo: true
    });
    setModoEdicao(false);
    setErros({});
    setModalAberto(true);
  };

  // Abrir modal para editar usuário
  const abrirModalEditarUsuario = (usuario) => {
    setUsuarioAtual({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role || 'usuario',
      ativo: usuario.ativo !== undefined ? usuario.ativo : true
    });
    setModoEdicao(true);
    setErros({});
    setModalAberto(true);
  };

  // Fechar modal
  const fecharModal = () => {
    setModalAberto(false);
  };

  // Manipular mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUsuarioAtual(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar erro do campo ao modificar
    if (erros[name]) {
      setErros(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validar formulário
  const validarFormulario = () => {
    const novosErros = {};
    
    if (!usuarioAtual.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }
    
    if (!usuarioAtual.email.trim()) {
      novosErros.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(usuarioAtual.email)) {
      novosErros.email = 'E-mail inválido';
    }
    
    if (!modoEdicao && !usuarioAtual.senha) {
      novosErros.senha = 'Senha é obrigatória';
    } else if (usuarioAtual.senha && usuarioAtual.senha.length < 6) {
      novosErros.senha = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    try {
      setCarregando(true);
      
      if (modoEdicao) {
        // Atualizar usuário existente
        await usuarioApi.atualizarUsuario(usuarioAtual.id, {
          nome: usuarioAtual.nome,
          email: usuarioAtual.email,
          role: usuarioAtual.role,
          ativo: usuarioAtual.ativo,
          ...(usuarioAtual.senha && { senha: usuarioAtual.senha }) // Incluir senha apenas se fornecida
        });
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        await usuarioApi.criarUsuario({
          nome: usuarioAtual.nome,
          email: usuarioAtual.email,
          senha: usuarioAtual.senha,
          role: usuarioAtual.role,
          ativo: true
        });
        toast.success('Usuário criado com sucesso!');
      }
      
      // Recarregar lista de usuários e fechar modal
      await carregarUsuarios();
      fecharModal();
    } catch (erro) {
      console.error('Erro ao salvar usuário:', erro);
      const mensagemErro = erro.response?.data?.message || 'Erro ao salvar usuário. Tente novamente.';
      toast.error(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  // Excluir usuário
  const excluirUsuario = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await usuarioApi.removerUsuario(id);
        toast.success('Usuário excluído com sucesso!');
        await carregarUsuarios();
      } catch (erro) {
        console.error('Erro ao excluir usuário:', erro);
        toast.error('Erro ao excluir usuário. Tente novamente.');
      }
    }
  };

  // Paginação
  const indiceUltimoUsuario = paginaAtual * itensPorPagina;
  const indicePrimeiroUsuario = indiceUltimoUsuario - itensPorPagina;
  const usuariosPaginados = usuarios.slice(indicePrimeiroUsuario, indiceUltimoUsuario);
  const totalPaginas = Math.ceil(usuarios.length / itensPorPagina);

  const paginar = (numeroPagina) => setPaginaAtual(numeroPagina);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h1>
        <button
          onClick={abrirModalNovoUsuario}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Usuário
        </button>
      </div>

      {/* Filtro de busca */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar usuários..."
            className="pl-10 pr-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de usuários */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            <span className="ml-2">Carregando usuários...</span>
          </div>
        ) : usuariosPaginados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filtro ? 'Tente ajustar sua busca ou filtro.' : 'Comece adicionando um novo usuário.'}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={abrirModalNovoUsuario}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Novo Usuário
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-mail
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perfil
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuariosPaginados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usuario.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {usuario.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usuario.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => abrirModalEditarUsuario(usuario)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => excluirUsuario(usuario.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{indicePrimeiroUsuario + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(indiceUltimoUsuario, usuarios.length)}
                  </span>{' '}
                  de <span className="font-medium">{usuarios.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                    disabled={paginaAtual === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Anterior</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                    let pageNum;
                    if (totalPaginas <= 5) {
                      pageNum = i + 1;
                    } else if (paginaAtual <= 3) {
                      pageNum = i + 1;
                    } else if (paginaAtual >= totalPaginas - 2) {
                      pageNum = totalPaginas - 4 + i;
                    } else {
                      pageNum = paginaAtual - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginar(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          paginaAtual === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaAtual === totalPaginas}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Próximo</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de adicionar/editar usuário */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {modoEdicao ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={usuarioAtual.nome}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    erros.nome ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                  placeholder="Digite o nome completo"
                />
                {erros.nome && (
                  <p className="mt-1 text-sm text-red-600">{erros.nome}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={usuarioAtual.email}
                  onChange={handleChange}
                  disabled={modoEdicao}
                  className={`mt-1 block w-full rounded-md border ${
                    erros.email ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 ${
                    modoEdicao ? 'bg-gray-100' : ''
                  }`}
                  placeholder="Digite o e-mail"
                />
                {erros.email && (
                  <p className="mt-1 text-sm text-red-600">{erros.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                  {modoEdicao ? 'Nova Senha' : 'Senha'} <span className="text-red-500">*</span>
                  {modoEdicao && <span className="text-xs text-gray-500 ml-1">(Deixe em branco para manter a senha atual)</span>}
                </label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={usuarioAtual.senha || ''}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    erros.senha ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2`}
                  placeholder={modoEdicao ? 'Deixe em branco para não alterar' : 'Digite a senha'}
                />
                {erros.senha && (
                  <p className="mt-1 text-sm text-red-600">{erros.senha}</p>
                )}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Perfil <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={usuarioAtual.role}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                >
                  <option value="usuario">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {modoEdicao && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativo"
                    name="ativo"
                    checked={usuarioAtual.ativo}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                    Usuário ativo
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={carregando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={carregando}
                >
                  {carregando ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      {modoEdicao ? 'Atualizando...' : 'Criando...'}
                    </>
                  ) : (
                    <>{modoEdicao ? 'Atualizar' : 'Criar'} Usuário</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarUsuarios;