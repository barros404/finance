import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Bell,
  Menu,
  X,
  Search,
  Filter,
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  Building2
} from 'lucide-react';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral do sistema',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'orcamento',
    label: 'Orçamento',
    icon: FileText,
    description: 'Gestão de orçamentos',
    color: 'from-emerald-500 to-green-600'
  },
  {
    id: 'tesouraria',
    label: 'Tesouraria',
    icon: Wallet,
    description: 'Fluxo de caixa',
    color: 'from-purple-500 to-violet-600'
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: BarChart3,
    description: 'Análises e insights',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    description: 'Configurações do sistema',
    color: 'from-gray-500 to-slate-600'
  },
];

const Layout = ({
  children,
  paginaAtual,
  setPaginaAtual
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [paginaAtual]);

  // Add scroll listener for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleUserMenuAction = (action) => {
    setIsUserMenuOpen(false);
    switch (action) {
      case 'profile':
        // Por enquanto não faz nada, como solicitado
        break;
      case 'settings':
        navigate('/configuracoes');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const navItemClasses = (isActive, item) =>
    `w-full flex items-center px-4 py-4 rounded-2xl transition-all duration-300 font-semibold text-sm group relative overflow-hidden ${isActive
      ? `bg-gradient-to-r ${item.color} text-white shadow-xl shadow-blue-500/25 transform scale-105`
      : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 hover:text-indigo-700 hover:shadow-lg hover:translate-x-2'
    }`;

  return (
    <>
      {children}
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  paginaAtual: PropTypes.string.isRequired,
  setPaginaAtual: PropTypes.func.isRequired
};

export default Layout;